import Favorites from '../utils/favorite'
import Lang from '../utils/lang'
import Arrays from '../utils/arrays'
import Utils from '../utils/math'
import Register from '../interaction/register/register'
import RegisterModule from '../interaction/register/module/module'
import Main from '../interaction/items/main'
import LineModule from '../interaction/items/line/module/module'
import Background from '../interaction/background'
import Router from '../core/router'
import CardModule from '../interaction/card/module/module'

/**
 * Компонент "Избранное"
 * @param {*} object 
 * @returns 
 */

function component(object){
    let all      = Favorites.all()
    let comp     = Utils.createInstance(Main, object)

    comp.use({
        onCreate: function(){
            let category = ['look', 'scheduled', 'book', 'like', 'wath', 'viewed', 'continued','thrown']
            let lines    = []
            let folders  = ['book','like','wath', 'viewed','scheduled','thrown']
            let media    = ['movies','tv']

            lines.push({
                results: [],
                params: {
                    module: LineModule.toggle(LineModule.MASK.base, 'More', 'Event'),
                    items: {
                        view: 20
                    }
                }
            })

            // Добавляем категории
            category.forEach(a=>{
                lines[0].results.push({
                    title: Lang.translate('title_' + a),
                    count: all[a].length,
                    params: {
                        module: RegisterModule.only('Line', 'Callback'),
                        createInstance: (item)=> new Register(item),
                        emit: {
                            onEnter: Router.call.bind(Router, 'favorite', {type: a})
                        }
                    }
                })
            })

            // Добавляем карточки
            category.forEach(a=>{
                if(all[a].length){
                    let items = Arrays.clone(all[a].slice(0,20))

                    items.forEach(item=>{
                        item.params = {
                            emit: {
                                onEnter: Router.call.bind(Router, 'full', item),
                                onFocus: ()=>{
                                    Background.change(Utils.cardImgBackground(item))
                                }
                            }
                        }
                    })

                    // Если есть папки, то добавляем их
                    if(folders.indexOf(a) > -1){
                        let i = 0

                        media.forEach(m=>{
                            let filter = Utils.filterCardsByType(all[a], m)

                            if(filter.length){
                                Arrays.insert(items, i, {
                                    results: filter,
                                    media: m,
                                    params: {
                                        module: CardModule.only('Folder', 'Callback'),
                                        emit: {
                                            onEnter: Router.call.bind(Router, 'favorite', {
                                                title : Lang.translate('title_' + a) + ' - ' + Lang.translate('menu_' + m),
                                                type: a, 
                                                filter: m
                                            }),
                                            onFocus: ()=>{
                                                Background.change(Utils.cardImgBackground(filter[0]))
                                            }
                                        }
                                    }
                                })

                                i++
                            }
                        })
                    }

                    lines.push({
                        title: Lang.translate('title_' + a),
                        results: items,
                        type: a,
                        total_pages: all[a].length > 20 ? Math.ceil(all[a].length / 20) : 1,
                        params: {
                            module: LineModule.toggle(LineModule.MASK.base, 'Event'),
                            emit: {
                                onMore: Router.call.bind(Router, 'favorite', {type: a, page: 2})
                            }
                        }
                    })
                }
            })

            if(lines.length){
                comp.build(lines)
            }
            else comp.empty()
        }
    })

    return comp
}

export default component