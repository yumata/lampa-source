import Api from '../utils/api.js'
import Shot from './shot.js'
import Slides from './slides.js'
import Defined from '../defined.js'

function component(object){
    Lampa.Utils.extendParams(object, {
        items: {
            cols: Lampa.Storage.field('interface_size') == 'bigger' ? 4: 3
        },
        empty: {
            descr: Lampa.Lang.translate('shots_card_empty_descr'),
            buttons: [
                {
                    title: Lampa.Lang.translate('shots_how_create_video_title'),
                    onEnter: ()=>{
                        Slides({
                            slides: [1,2,3,4].map(i=>Defined.cdn + 'record/slide-' + i + '.jpg'),
                            button_text: 'shots_button_good',
                            onLoad: ()=>{},
                            onInstall: ()=>{
                                Lampa.Controller.toggle('content')
                            },
                            onBack: ()=>{
                                Lampa.Controller.toggle('content')
                            }
                        })
                    }
                }
            ]
        }
    })

    let comp     = Lampa.Maker.make('Category', object, (module)=>module.toggle(Lampa.Maker.module('Category').MASK.base, 'Pagination', 'Explorer'))
    let playlist = []

    comp.use({
        onCreate: function(){
            Api.shotsCard(object.card, object.page, (result)=>{
                playlist = Lampa.Arrays.clone(result.results)

                this.build(result)
            }, this.empty.bind(this))
        },
        onNext: function(resolve, reject){
            Api.shotsCard(object.card, object.page, (result)=>{
                playlist = playlist.concat(result.results)

                resolve(result)
            }, reject.bind(this))
        },
        onlyCreateAndAppend: function(element){
            try{
                let item = new Shot(element, {
                    playlist,
                    without_card: true
                })

                this.emit('instance', item, element)
                
                item.create()

                this.emit('append', item, element)
            }
            catch(e){
                console.warn('Warning', 'onCreateAndAppend error:', e.message, e.stack)
            }
        },
        onDestroy: function(){
            playlist = null
        }
    })

    return comp
}

export default component