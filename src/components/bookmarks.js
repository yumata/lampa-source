import Favorites from '../core/favorite'
import Lang from '../core/lang'
import Arrays from '../utils/arrays'
import Utils from '../utils/utils'
import Register from '../interaction/register/register'
import RegisterModule from '../interaction/register/module/module'
import Main from '../interaction/items/main'
import LineModule from '../interaction/items/line/module/module'
import Background from '../interaction/background'
import Router from '../core/router'
import CardModule from '../interaction/card/module/module'
import Account from '../core/account/account'
import EmptyRouter from '../interaction/empty/module/router'
import ContentRows from '../core/content_rows'

/**
 * Компонент "Избранное"
 * @param {*} object 
 * @returns 
 */

function component(object){
    let all      = Favorites.all()
    let comp     = Utils.createInstance(Main, object, {
        empty: {
            router: 'bookmarks'
        }
    })

    comp.use(EmptyRouter, 0)

    comp.use({
        onCreate: function(){
            let category = ['look', 'scheduled', 'book', 'like', 'wath', 'viewed', 'continued','thrown']
            let lines    = []
            let folders  = ['book','like','wath', 'viewed','scheduled','thrown']
            let media    = ['movies','tv']
            let premium  = Account.hasPremium()
            let sync     = Account.Permit.sync

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
                if(all[a].length){
                    lines[0].results.push({
                        title: Lang.translate('title_' + a),
                        count: all[a].length,
                        limit: sync ? (premium ? 2000 : 500) : 0,
                        params: {
                            module: RegisterModule.only('Line', 'Callback'),
                            createInstance: (item)=> new Register(item),
                            emit: {
                                onEnter: Router.call.bind(Router, 'favorite', {type: a})
                            }
                        }
                    })
                }
            })

            if(lines[0].results.length == 0) lines = []

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

            ContentRows.call('bookmarks', {}, lines)

            if(lines.length){
                comp.build(lines)
            }
            else comp.empty()
        }
    })

    return comp
}

export default component