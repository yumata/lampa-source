import Preview from './preview.js'
import Checkbox from './checkbox.js'
import Api from '../utils/api.js'
import Progress from './progress.js'
import Handler from '../utils/handler.js'
import Created from '../utils/created.js'
import Selector from './selector.js'
import Tags from '../utils/tags.js'

function Upload(data){
    this.data = data
    this.html = Lampa.Template.get('shots_modal_upload')

    this.start = function(){
        this.preview  = new Preview(this.data)

        this.checkbox = new Checkbox({
            text: Lampa.Lang.translate('Сделать публичной'),
            state: true
        })

        this.progress = new Progress({
            text: Lampa.Lang.translate('shots_upload_progress_start')
        })

        this.selector_title = $('<div class="shots-line-title">'+Lampa.Lang.translate('shots_choice_tags')+'</div>')
        this.selector = new Selector(Tags.list())

        this.checkbox.create()
        this.preview.create()
        this.progress.create()
        this.progress.render().addClass('hide')
        this.selector.create()

        this.button_upload   = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_start')})
        this.button_cancel   = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_cancel')})
        this.button_again    = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_again')})
        this.button_complete = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_complete')})
        this.text_complete   = Lampa.Template.get('shots_upload_complete_text')
        this.text_notice     = Lampa.Template.get('shots_upload_notice_text')

        this.button_again.addClass('hide').on('hover:enter', this.startUpload.bind(this))
        this.button_upload.on('hover:enter', this.startUpload.bind(this))

        this.button_complete.addClass('hide').on('hover:enter', ()=>{
            this.destroy()

            this.onComplete(this.shot_ready)
        })

        this.text_complete.addClass('hide')

        this.button_cancel.addClass('shots-selector--transparent')
        this.button_cancel.on('hover:enter', this.cancelUpload.bind(this))

        this.html.find('.shots-modal-upload__preview').append(this.preview.render())
        this.html.find('.shots-modal-upload__body')
            .append(this.text_notice)
            .append(this.selector_title)
            .append(this.selector.render())
            .append(this.button_upload)
            .append(this.progress.render())
            .append(this.button_again)
            .append(this.button_cancel)
            .append(this.text_complete)
            .append(this.button_complete)

        Lampa.Modal.open({
            html: this.html,
            size: 'small',
            scroll: {
                nopadding: true
            },
            onBack: ()=>{}
        })

    }

    this.setFocus = function(target){
        Lampa.Controller.clear()
        Lampa.Controller.collectionSet(this.html)
        Lampa.Controller.collectionFocus(target, this.html)
    }

    this.startUpload = function(){
        this.button_again.addClass('hide')
        this.button_upload.addClass('hide')
        this.progress.render().removeClass('hide')

        this.setFocus(this.progress.render())

        this.progress.setText(Lampa.Lang.translate('shots_upload_progress_start'))
        this.progress.setState('waiting')

        let play = this.data.play_data
        let card = play.card

        Api.uploadRequest({
            card_id: card.id,
            card_type: card.original_name ? 'tv' : 'movie',
            card_title: card.title || card.name || card.original_title || card.original_name || 'Unknown',
            card_year: (card.release_date || card.first_air_date || '----').slice(0,4),
            card_poster: card.poster_path || '',

            start_point: this.data.recording.start_point,
            end_point: this.data.recording.end_point,

            season: play.season || 0,
            episode: play.episode || 0,
            voice_name: play.voice_name || '',
            balanser: play.balanser || '',

            tags: this.selector.get().map(t=>t.id),

            recorder: 'new',
        }, this.endUpload.bind(this), this.errorUpload.bind(this))
    }

    this.errorUpload = function(e){
        this.progress.render().addClass('hide')
        this.button_again.removeClass('hide')

        this.setFocus(this.button_again)
    }


    this.endUpload = function(upload){
        this.progress.render().addClass('hide')
        this.button_cancel.addClass('hide')
        this.button_complete.removeClass('hide')
        this.text_complete.removeClass('hide')
        this.text_notice.addClass('hide')
        this.selector_title.remove()
        this.selector.destroy()

        Lampa.Storage.set('shots_last_record', Date.now())

        Api.shotsVideo(upload.id, (result)=>{
            Created.add(result.video)

            Handler.add(result.video)
        })

        this.setFocus(this.button_complete)
    }

    this.cancelUpload = function(){
        if(this.uploading) this.uploading.abort()
        
        this.destroy()

        this.onCancel()
    }

    this.destroy = function(){
        Lampa.Modal.close()

        this.preview.destroy()
        this.checkbox.destroy()
        this.html.remove()

        this.runUpload = ()=>{}
        this.endUpload = ()=>{}
        this.cancelUpload = ()=>{}
        this.notifyUpload = ()=>{}
    }
}

export default Upload