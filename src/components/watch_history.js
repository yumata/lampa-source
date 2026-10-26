import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import CardModule from '../interaction/card/module/module'
import Background from '../interaction/background'
import Utils from '../utils/utils'
import Router from '../core/router'
import Lang from '../core/lang'
import Account from '../core/account/account'
import Api from '../core/api/api'
import Head from '../interaction/head/head'
import Select from '../interaction/select'
import Controller from '../core/controller'
import EmptyRouter from '../interaction/empty/module/router'

/**
 * «История» при синхронизации с CUB — история просмотров с сервера, каждый просмотр отдельной карточкой с датой
 * (открывается через Favorite.historyActivity). Если сервер её не отдаёт (старый сервер, нет сети) — показываем
 * прежнюю историю из закладок, как экран favorite
 * @param {*} object - {filter: '' | 'movie' | 'tv'}
 * @returns
 */
function component(object){
    let comp = Utils.createInstance(Category, object, {
        module: CategoryModule.toggle(CategoryModule.MASK.base, 'Pagination'),
        empty: {
            account: true,
            router: 'watch_history'
        }
    })

    let filters = [
        {title: Lang.translate('watch_history_all'), filter: ''},
        {title: Lang.translate('menu_movies'), filter: 'movie'},
        {title: Lang.translate('menu_tv'), filter: 'tv'}
    ]

    let button
    let legacy = false // показываем прежнюю историю из закладок

    function prepare(data){
        data.results.forEach(card=>{
            card.params = {
                module: CardModule.toggle(CardModule.MASK.base, 'History')
            }
        })

        return data
    }

    comp.use(EmptyRouter, 0)

    comp.use({
        onCreate: function(){
            Account.Api.watchHistory(object, (data)=>{
                if(data.results.length) this.build(prepare(data))
                else this.empty()
            }, (e)=>{
                // без входа — пустой экран с кнопкой входа, иначе прежняя история, чтобы экран не был пустым
                if(e && e.decode_code == 403) return this.empty()

                legacy = true

                Api.favorite(Object.assign({}, object, {type: 'history'}), (data)=>{
                    setTimeout(this.build.bind(this, data), 10)
                }, this.empty.bind(this))
            })
        },
        onNext: function(resolve, reject){
            if(legacy) Api.favorite(Object.assign({}, object, {type: 'history'}), resolve, reject)
            else Account.Api.watchHistory(object, (data)=>resolve(prepare(data)), reject)
        },
        onInstance: function(item, data){
            item.use({
                onEnter: Router.call.bind(Router, 'full', data),
                onFocus: function(){
                    Background.change(Utils.cardImgBackground(data))
                }
            })
        },
        // Фильтр Все / Фильмы / Сериалы в шапке
        onStart: function(){
            let current = filters.find(f=>f.filter == (object.filter || '')) || filters[0]

            if(button) button.remove()

            button = $('<div class="head__action selector watch-history__filter"></div>').text(current.title)

            Head.addElement(button, ()=>{
                let enabled = Controller.enabled().name

                Select.show({
                    title: Lang.translate('title_filter'),
                    items: filters.map(f=>({title: f.title, filter: f.filter, selected: f.filter == (object.filter || '')})),
                    onSelect: (a)=>{
                        object.filter = a.filter
                        object.page   = 1

                        Controller.toggle(enabled)

                        this.activity.refresh()
                    },
                    onBack: ()=>{
                        Controller.toggle(enabled)
                    }
                })
            })
        },
        onPause: function(){
            if(button) button.remove()
        },
        onDestroy: function(){
            if(button) button.remove()
        }
    })

    return comp
}

export default component
