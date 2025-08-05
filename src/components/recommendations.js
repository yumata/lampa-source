import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Empty from '../interaction/empty'
import Lang from '../utils/lang'
import Utils from '../utils/math'
import AI from '../utils/api/ai'
import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'

/**
 * Компонент "Рекомендации"
 * @param {*} object 
 */

function component(object){
    let comp = Utils.createInstance(Category, object, {
        module: CategoryModule.toggle(CategoryModule.MASK.base, 'Explorer', 'Loading', 'Next', 'Empty'),
    })

    comp.use({
        onCreate: function(){
            AI.recommendations(object.movie.id, object.movie.name ? 'tv' : 'movie', (data)=>{
                if(data.results.length == 0) this.empty({status: 347})
                else this.build(data)
            }, this.empty.bind(this))
        },
        onInstance: function(item, data){
            item.use({
                onEnter: function(){
                    Activity.push({
                        url: data.url,
                        component: 'full',
                        id: data.id,
                        method: data.name ? 'tv' : 'movie',
                        card: data,
                        source: data.source || object.source || 'tmdb',
                    })
                },
                onFocus: function(){
                    Background.change(Utils.cardImgBackground(data))
                }
            })
        },
        onEmpty: function(event){
            let code = Lampa.Network.errorCode(event)
            let text = {
                title: Lang.translate('network_error'),
                descr: Lang.translate('subscribe_noinfo')
            }

            if(code == 600){
                text.title  = Lang.translate('ai_subscribe_title')
                text.descr  = Lang.translate('ai_subscribe_descr')
                text.noicon = true
                text.width  = 'medium'
            }
            if(code == 347){
                text.title = Lang.translate('empty_title_two')
                text.descr = Lang.translate('empty_text_two')
            }
            if(code == 345){
                text.title = Lang.translate('account_login_failed')
                text.descr = Lang.translate('account_login_wait')
            }
            if(code == 245){
                text.descr = event.message || Lang.translate('subscribe_noinfo')
            }

            let empty = new Empty(text)

            empty.use({
                onController: (controller)=>{
                    controller.left = ()=>{
                        comp.explorer.toggle()
                    }
                }
            })
            
            this.scroll.append(empty.render(true))
            this.start = empty.start.bind(empty)
        }
    })

    return comp
}


export default component