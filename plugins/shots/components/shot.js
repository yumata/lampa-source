import Tags from './tags.js'
import Lenta from '../lenta/lenta.js'
import Handler from '../utils/handler.js'
import Utils from '../utils/utils.js'

function Shot(item_data, params = {}){
    let clone = Lampa.Arrays.clone(item_data)

    item_data.card = {
        id: item_data.card_id,
        type: item_data.card_type,
        title: item_data.card_title,
        release_date: item_data.card_year,
        poster_path: item_data.card_poster
    }

    item_data.img = item_data.screen

    let item  = Lampa.Maker.make('Episode', item_data, (module)=>module.only('Card', 'Callback'))

    item.use({
        onCreate: function(){
            this.html.find('.full-episode__name').remove()
            this.html.find('.full-episode__num').remove()

            let tags = new Tags(this.data)
                tags.create()

            this.html.find('.full-episode__date').empty().append(tags.render())

            this.html.addClass('full-episode--shot')

            this.liked = $(`
                <div class="full-episode__liked">
                    <svg><use xlink:href="#sprite-love"></use></svg>
                    <span>${Lampa.Utils.bigNumberToShort(this.data.liked)}</span>
                </div>
            `)

            this.html.find('.full-episode__date').append(this.liked)

            this.status = Lampa.Template.elem('div', {class: 'shots-status hide'})

            this.html.find('.card__left').append(this.status)

            this.html.find('.full-episode').append($('<div class="full-episode__shot-icon"><svg><use xlink:href="#sprite-shots"></use></svg></div>'))

            this.updateStatusHandler = (e)=>{
                if(e.id !== this.data.id) return

                this.status.toggleClass('hide', e.status == 'ready')

                this.status.toggleClass('shots-status--error', e.status == 'error')
                this.status.toggleClass('shots-status--processing', e.status == 'processing' || e.status == 'converting')
                this.status.toggleClass('shots-status--ready', e.status == 'ready')
                this.status.toggleClass('shots-status--deleted', e.status == 'deleted')
                this.status.toggleClass('shots-status--blocked', e.status == 'blocked')

                this.status.text(
                    e.status == 'error' ? Lampa.Lang.translate('shots_status_error') :
                    e.status == 'processing' || e.status == 'converting' ? Lampa.Lang.translate('shots_status_processing') :
                    e.status == 'blocked' ? Lampa.Lang.translate('shots_status_blocked') :
                    e.status == 'deleted' ? Lampa.Lang.translate('shots_status_deleted') :
                    e.status == 'ready' ? Lampa.Lang.translate('shots_status_ready') : ''
                )

                Utils.videoReplaceStatus(e, this.data)
                Utils.videoReplaceStatus(e, clone)

                this.data.img = e.screen

                if(e.screen) this.emit('visible')
            }

            this.updateDataHandler = (e)=>{
                if(e.id !== this.data.id) return

                this.liked.find('span').text(Lampa.Utils.bigNumberToShort(e.liked || this.data.liked))
            }

            Lampa.Listener.follow('shots_status', this.updateStatusHandler)
            Lampa.Listener.follow('shots_update', this.updateDataHandler)

            this.updateStatusHandler(this.data)

            if(this.data.status == 'processing' && Lampa.Account.Permit.account.id == this.data.cid) Handler.add(clone)
        },
        onlyEnter: function(){
            let lenta = new Lenta(clone, params.playlist || [this.data])

            lenta.onNext = params.onNext

            lenta.start()
        },
        onlyFocus: function(){
            Lampa.Background.change(this.data.img || '')
        },
        onRemove: function(){
            Lampa.Listener.remove('shots_status', this.updateStatusHandler)
            Lampa.Listener.remove('shots_update', this.updateDataHandler)
        }
    })

    return item
}

export default Shot