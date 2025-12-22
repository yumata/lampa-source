import Api from '../utils/api.js'
import Shot from './shot.js'

function component(object){
    Lampa.Utils.extendParams(object, {
        items: {
            cols: 3
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