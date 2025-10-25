import Category from '../interaction/items/category'
import Background from '../interaction/background'
import Utils from '../utils/utils'
import Torserver from '../interaction/torserver'
import Arrays from '../utils/arrays'
import CardModule from '../interaction/card/module/module'
import Torrent from '../interaction/torrent'
import Controller from '../core/controller'
import Lang from '../core/lang'
import Select from '../interaction/select'
import Router from '../core/router'
import EmptyRouter from '../interaction/empty/module/router'

/**
 * Компонент "Мои торренты"
 * @param {*} object 
 * @returns 
 */
function component(object){
    let comp = Utils.createInstance(Category, object, {
        empty: {
            router: 'mytorrents'
        }
    })

    comp.use(EmptyRouter, 0)

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
                        module: CardModule.only('Card', 'Release', 'Callback')
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
                            onSelect: Router.call.bind(Router, 'full', data.data.movie)
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