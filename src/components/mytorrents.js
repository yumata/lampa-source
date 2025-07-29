import Category from '../interaction/items/category'
import Activity from '../interaction/activity'
import Background from '../interaction/background'
import Utils from '../utils/math'
import Torserver from '../interaction/torserver'
import Arrays from '../utils/arrays'
import CardModule from '../interaction/card/module/module'
import Torrent from '../interaction/torrent'
import Controller from '../interaction/controller'
import Lang from '../utils/lang'
import Select from '../interaction/select'

/**
 * Компонент "Мои торренты"
 * @param {*} object 
 * @returns 
 */
function component(object){
    let comp = new Category(object)

    comp.use({
        onCreate: function(){
            Torserver.my(result=>{
                result.forEach(item => {
                    item.title = item.title.replace('[LAMPA] ','')
                    item.data = Arrays.decodeJson(item.data,{})

                    if(item.data.movie && item.data.movie.poster) {
                        item.poster = item.data.movie.poster
                    }

                    item.params = {
                        module: CardModule.only('Callback')
                    }
                })

                this.build({
                    results: result,
                })
            }, this.empty.bind(this))
        },
        onInstance: function(item, data){
            item.use({
                onEnter: function(){
                    if(!this.disabled) Torrent.open(data.hash, data.data.lampa && data.data.movie ? data.data.movie : false)
                },
                onFocus: function(){
                    Background.change(Utils.cardImgBackground(data))
                },
                onLong: function(){
                    if(this.disabled) return

                    let enabled = Controller.enabled().name
                    let menu    = []

                    if(data.data.movie){
                        menu.push({
                            title: Lang.translate('title_card'),
                            onSelect: ()=>{
                                Activity.push({
                                    url: data.data.movie.url,
                                    component: 'full',
                                    id: data.data.movie.id,
                                    method: data.data.movie.name ? 'tv' : 'movie',
                                    card: data.data.movie,
                                    source: data.data.movie.source || 'tmdb'
                                })
                            }
                        })
                    }

                    menu.push({
                        title: Lang.translate('torrent_remove_title'),
                        subtitle: Lang.translate('torrent_remove_descr'),
                        onSelect: ()=>{
                            Torserver.remove(data.hash)

                            item.disable()

                            Controller.toggle(enabled)
                        }
                    })

                    Select.show({
                        title: Lang.translate('title_action'),
                        items: menu,
                        onBack: ()=>{
                            Controller.toggle(enabled)
                        }
                    })
                }
            })
        }
    })

    return comp
}

export default component