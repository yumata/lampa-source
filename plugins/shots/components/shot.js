import Tags from './tags.js'
import Lenta from '../lenta/lenta.js'

function Shot(item_data, params = {}){
    let clone = Lampa.Arrays.clone(item_data)
    let item  = Lampa.Maker.make('Episode', item_data, (module)=>module.only('Card', 'Callback'))

    item.use({
        onCreate: function(){
            this.html.find('.full-episode__name').remove()
            this.html.find('.full-episode__num').remove()

            let tags = new Tags(this.data)
                tags.create()

            this.html.find('.full-episode__date').empty().append(tags.render())

            this.html.addClass('full-episode--shot')

            this.html.find('.full-episode__date').append(Lampa.Template.elem('span', {text: '130k'}))
        },
        onEnter: function(){
            let lenta = new Lenta(clone, params.playlist || [this.data])

            lenta.onNext = params.onNext

            lenta.start()
        },
        onFocus: function(){
            Lampa.Background.change(this.data.img || '')
        }
    })

    return item
}

export default Shot