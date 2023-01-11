import Api from '../interaction/api'
import Favorite from '../utils/favorite'
import Noty from '../interaction/noty'
import Storage from '../utils/storage'
import Lang from '../utils/lang'
import Items from '../interaction/items/category'

function component(object){
    let comp = new Items(object)

    let update = (e)=>{
        if(e.name == 'account') comp.activity.needRefresh()
    }

    Storage.listener.follow('change',update)

    comp.create = function(){
        Api.favorite(object,this.build.bind(this),this.empty.bind(this))
    }

    comp.nextPageReuest = function(object, resolve, reject){
        Api.favorite(object,resolve.bind(this), reject.bind(this))
    }

    if(object.type == 'history'){
        comp.cardRender = function(object, data, card){
            card.onMenuShow = (menu_list)=>{
                menu_list.push({
                    title: Lang.translate('menu_history'),
                    separator: true
                })

                menu_list.push({
                    title: Lang.translate('fav_remove_title'),
                    subtitle: Lang.translate('fav_remove_descr'),
                    one: true
                })
                menu_list.push({
                    title: Lang.translate('fav_clear_title'),
                    subtitle: Lang.translate('fav_clear_descr'),
                    all: true
                })
                menu_list.push({
                    title: Lang.translate('fav_clear_label_title'),
                    subtitle: Lang.translate('fav_clear_label_descr'),
                    label: true
                })
                menu_list.push({
                    title: Lang.translate('fav_clear_time_title'),
                    subtitle: Lang.translate('fav_clear_time_descr'),
                    timecode: true
                })
            }

            card.onMenuSelect = (action)=>{
                if(action.all){
                    Favorite.clear('history')

                    Lampa.Activity.replace({})
                }
                else if(action.label){
                    Storage.set('online_view',[])
                    Storage.set('torrents_view',[])
                    
                    Noty.show(Lang.translate('fav_label_cleared'))
                }
                else if(action.timecode){
                    Storage.set('file_view',{})
                    
                    Noty.show(Lang.translate('fav_time_cleared'))
                }
                else if(action.one){
                    Favorite.remove('history', data)

                    card.watched = ()=>{}

                    card.render().find('.card-watched').remove()

                    card.render().css('opacity','0.5').unbind()
                } 
            }
        }
    }

    return comp
}

export default component