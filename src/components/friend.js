import Controller from '../core/controller'
import Scroll from '../interaction/scroll'
import Activity from '../interaction/activity/activity'
import Template from '../interaction/template'
import Lang from '../core/lang'
import Utils from '../utils/utils'
import Router from '../core/router'
import Background from '../interaction/background'
import Layer from '../core/layer'
import Card from '../interaction/card/card'
import CardModule from '../interaction/card/module/module'
import Register from '../interaction/register/register'
import RegisterModule from '../interaction/register/module/module'
import TMDB from '../core/api/sources/tmdb'
import Account from '../core/account/account'
import Friends from '../core/account/friends'
import Storage from '../core/storage/storage'

let TABS      = ['feed', 'bookmarks', 'history']
let BOOKMARKS = ['look', 'scheduled', 'book', 'like', 'wath', 'viewed', 'continued', 'thrown'] // порядок как в «Избранном»
let PERMS     = [['p_book', 'friends_tab_bookmarks'], ['p_history', 'friends_tab_history'], ['p_activity', 'friends_tab_feed'], ['p_recommends', 'friends_perm_recommends'], ['p_stats', 'friends_perm_stats']]
let ICONS     = {watched: 'sprite-viewed', bookmark: 'sprite-book', like: 'sprite-like', comment: 'sprite-comment', collection: 'sprite-collection'}

/**
 * Профиль друга: слева — карточка друга, «Сейчас смотрит», «Открыто другу» (что я открыл другу);
 * справа — вкладки «Лента» (friends/feed?friend_id), «Закладки» (плитки категорий + карточки активной), «История» (friends/history).
 * Закрытый другом раздел — заглушка «{name} не открыл(а) этот раздел»
 * @param {{friend_id:integer, tab:string, title:string}} object
 */
function Friend(object){
    // как в торрентах (Explorer): слева своя прокрутка с информацией о друге, справа над прокруткой содержимого — закреплённые вкладки
    let scroll  = new Scroll({mask: true, over: true, step: 300})
    let lscroll = new Scroll({mask: true, over: true})
    let html    = Template.get('friend_profile')
    let content = html.find('.friend-profile__content')
    let tabs    = html.find('.friend-profile__tabs')
    let head    = html.find('.friend-profile__head')
    let id      = parseInt(object.friend_id) || 0
    let user    = {}
    let friend  = {}
    let sections = {}
    let counts   = {}
    let view     = null // текущая вкладка: {name, token, page, next, loading, done, items, cards}
    let token    = 0
    let destroyed = false
    let last

    let text = (name, values)=>{
        let result = Lang.translate(name)

        for(let key in (values || {})) result = result.replace('{' + key + '}', values[key])

        return result
    }

    let elem = (cls, value)=>{
        let node = $('<div></div>').addClass(cls)

        if(value !== undefined) node.text(value)

        return node
    }

    let failed = (e)=>{
        if(e && e.responseJSON && e.responseJSON.text) return e.responseJSON.text
        if(e && typeof e.text == 'string' && e.text) return e.text

        return Lang.translate('network_noconnect')
    }

    this.create = function(){
        this.activity.loader(true)

        // высота правой прокрутки — экран без шапки с вкладками
        scroll.minus(head)
        lscroll.minus()

        scroll.onEnd = this.more.bind(this)

        scroll.onAnimateEnd = scroll.onScroll = ()=>{
            Layer.visible(scroll.render(true))
        }

        html.find('.friend-profile__body').append(scroll.render())
        scroll.append(content)

        html.find('.friend-profile__left').append(lscroll.render())
        lscroll.append(html.find('.friend-profile__left-body'))

        Promise.all([
            Account.Api.load('friends/user/' + id),
            Account.Api.load('friends/list').catch(()=>({}))
        ]).then((result)=>{
            if(destroyed) return

            let info = result[0] || {}

            if(!info.secuses) return this.fail(info)

            user     = info.user || {}
            sections = info.sections || {}
            counts   = info.counts || {}
            friend   = ((result[1] || {}).friends || []).find((f)=>f.friend_id == id) || {}

            this.build()
        }).catch((e)=>{
            if(!destroyed) this.fail(e)
        })

        return this.render()
    }

    this.fail = function(e){
        html.empty().append(elem('friend-profile__error').append(
            elem('friend-profile__empty-title', Lang.translate('title_error')),
            elem('friend-profile__empty-text', failed(e))
        ))

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.build = function(){
        let name = user.name || object.title || ''

        object.title = name

        html.find('.friend-profile__name').text(name)
        html.find('.friend-profile__since').text(user.since ? text('friends_since', {date: this.date(user.since)}) : '').toggleClass('hide', !user.since)

        html.find('.friend-profile__avatar img').each((i, node)=>{
            Utils.imgLoad(node, Friends.avatar(user.icon), ()=>{}, (img)=>{
                img.src = './img/img_load.svg'
            })
        })

        this.watching()
        this.opened()
        this.tabs()

        this.activity.loader(false)

        this.activity.toggle()
    }

    // Сейчас смотрит: только если друг открыл мне ленту (сервер отдаёт watching лишь при p_activity)
    this.watching = function(){
        let watching = friend.watching && typeof friend.watching == 'object' && friend.watching.title ? friend.watching : null
        let panel    = html.find('.friend-profile__watching')

        panel.toggleClass('hide', !watching)

        // на узком экране левой колонки нет — «Смотрит «…»» в строке над вкладками
        if(watching) html.find('.friend-profile__mini-status').text(text('friends_watching', {title: watching.title})).removeClass('hide')

        if(!watching) return

        let tv   = watching.method == 'tv'
        let card = {id: watching.id, source: 'tmdb'}

        if(tv){
            card.name = watching.title
            card.original_name = watching.title
        }
        else card.title = watching.title

        panel.find('.friend-profile__movie-title').text(watching.title)
        panel.find('.friend-profile__movie-meta').text(Lang.translate(tv ? 'friends_feed_tv' : 'friends_feed_movie'))

        if(watching.img){
            Utils.imgLoad(panel.find('.friend-profile__movie-img img'), TMDB.img(watching.img, 'w300'), ()=>{
                panel.find('.friend-profile__movie-img').addClass('loaded')
            }, ()=>{})
        }

        panel.find('.friend-profile__movie').on('hover:focus', ()=>{
            last = panel.find('.friend-profile__movie')[0]

            lscroll.update(panel, false)
        }).on('hover:enter', ()=>{
            Router.call('full', card)
        })
    }

    // Открыто другу: мои разрешения для него (строка friends/list), только просмотр
    this.opened = function(){
        let panel = html.find('.friend-profile__opened')
        let box   = panel.find('.friend-profile__tags')

        if(!friend.friend_id) return

        let open = PERMS.filter((p)=>friend[p[0]])

        if(open.length) open.forEach((p)=>box.append(elem('friend-profile__tag', Lang.translate(p[1]))))
        else box.append(elem('friend-profile__tag-none', Lang.translate('friends_opened_none')))

        panel.removeClass('hide')
    }

    this.tabs = function(){
        let current = TABS.indexOf(object.tab) >= 0 ? object.tab : TABS[0]

        TABS.forEach((name, i)=>{
            let button = $('<div class="navigation-tabs__button selector"></div>').text(Lang.translate('friends_tab_' + name))

            button.attr('data-tab', name)

            button.on('hover:enter', ()=>{
                if(view && view.name == name) return

                this.open(name)
            }).on('hover:focus', ()=>{
                last = button[0]
            })

            if(i > 0) tabs.append('<div class="navigation-tabs__split">|</div>')

            tabs.append(button)
        })

        this.open(current, true)
    }

    /**
     * Открыть вкладку
     * @param {string} name
     * @param {boolean} [first] - при построении экрана: фокус ставит start()
     */
    this.open = function(name, first){
        object.tab = name

        this.clear()

        tabs.find('.navigation-tabs__button').removeClass('active')
        tabs.find('[data-tab="' + name + '"]').addClass('active')

        view = {name, token: ++token, page: 1, next: '', loading: false, done: false, items: [], cards: [], type: ''}

        // sections.feed нет у сервера до правки friends/user — тогда ленту решает сам friends/feed (p_activity)
        let open = name == 'feed' ? sections.feed !== false : name == 'bookmarks' ? sections.bookmarks : sections.history

        if(!open) this.closed()
        else if(name == 'bookmarks') this.bookmarks()
        else this.more()

        if(!first) this.collection(tabs.find('.active')[0])
    }

    // Убрать содержимое вкладки и карточки
    this.clear = function(){
        if(view) view.cards.forEach((card)=>card.destroy())
        if(view && view.tiles) view.tiles.destroy()

        content.empty()

        scroll.reset()
    }

    this.closed = function(){
        // закрытый раздел не подгружаем: иначе scroll.onEnd вызовет more() и данные встанут под заглушку
        view.done = true

        content.append(elem('friend-profile__empty').append(
            elem('friend-profile__empty-title', text('friends_closed', {name: user.name || ''})),
            elem('friend-profile__empty-text', Lang.translate('friends_closed_text'))
        ))
    }

    this.empty = function(key){
        content.find('.friend-profile__list, .friend-profile__cards').last().after(elem('friend-profile__empty').append(elem('friend-profile__empty-text', Lang.translate(key))))
    }

    /**
     * Обновить коллекцию пульта: новые элементы, фокус на target
     */
    this.collection = function(target){
        if(!Controller.own(this)) return

        this.collect()

        if(target) Controller.collectionFocus(target, scroll.render(true))
    }

    // все элементы экрана (левая колонка, вкладки, содержимое); скрытая на узком экране левая колонка — не в навигации
    this.collect = function(){
        let movie = html.find('.friend-profile__movie')[0]

        Controller.collectionSet(html)

        if(movie && movie.offsetParent === null) Navigator.remove(movie)
    }

    this.append = function(items){
        if(!items.length) return

        if(Controller.own(this)) Controller.collectionAppend(items)

        Layer.visible(scroll.render(true))
    }

    // Подгрузить следующую страницу текущей вкладки
    this.more = function(){
        if(!view || view.loading || view.done) return

        let name  = view.name
        let state = view

        if(name == 'bookmarks' && !state.type) return

        let wait = elem('friend-profile__wait')

        state.loading = true

        content.append(wait)

        let done = ()=>{
            state.loading = false

            wait.remove()
        }

        let error = (e)=>{
            if(state !== view || destroyed) return

            done()

            // первая страница — сообщение вместо списка, следующие — тихо
            if(state.page == 1) content.append(elem('friend-profile__empty').append(elem('friend-profile__empty-text', failed(e))))

            state.done = true
        }

        if(name == 'feed'){
            Account.Api.load('friends/feed?friend_id=' + id + (state.next ? '&before=' + encodeURIComponent(state.next) : '')).then((result)=>{
                if(state !== view || destroyed) return

                done()

                if(!result || !result.secuses) return error(result)

                // только события этого друга: сервер без friend_id отдаёт ленту всех друзей
                this.feed((result.feed || []).filter((event)=>!event.user || event.user.id == id))

                state.next = result.next || ''
                state.done = !state.next
                state.page++

                if(!state.items.length) this.empty('friends_empty_feed')
            }).catch(error)
        }
        else if(name == 'history'){
            Account.Api.watchHistory({friend_id: id, page: state.page, group: 'card'}, (data)=>{
                if(state !== view || destroyed) return

                done()

                data.results.forEach((card)=>{
                    card.params = {module: CardModule.toggle(CardModule.MASK.base, 'History')}
                })

                this.cards(data.results)

                state.done = state.page >= (data.total_pages || 1)
                state.page++

                if(!state.cards.length) this.empty('friends_empty_history')
            }, error)
        }
        else{
            Account.Api.load('friends/bookmarks?friend_id=' + id + '&type=' + state.type + '&page=' + state.page).then((result)=>{
                if(state !== view || destroyed) return

                done()

                if(!result || !result.secuses) return error(result)

                this.cards((result.bookmarks || []).map((row)=>row.card).filter((card)=>card && card.id))

                state.done = state.page >= (result.total_pages || 1)
                state.page++

                if(!state.cards.length) this.empty('friends_empty_bookmarks')
            }).catch(error)
        }
    }

    /**
     * Карточки в сетке (История, Закладки)
     */
    this.cards = function(list){
        let grid = content.find('.friend-profile__cards')
        let add  = []
        let cols = Storage.field('light_version') ? (window.innerWidth < 768 ? 5 : 4) : 5

        if(!grid.length){
            grid = elem('friend-profile__cards mapping--grid cols--' + cols)

            content.append(grid)
        }

        list.forEach((data)=>{
            try{
                let card = Utils.createInstance(Card, data)

                card.use({
                    onEnter: ()=>{
                        Router.call('full', data)
                    },
                    onFocus: ()=>{
                        last = card.render(true)

                        scroll.update(card.render(true), true)

                        Background.change(Utils.cardImgBackground(data))
                    }
                })

                card.create()

                grid.append(card.render(true))

                view.cards.push(card)

                add.push(card.render(true))
            }
            catch(e){
                console.log('Friend', 'card error', e.message)
            }
        })

        this.append(add)
    }

    // Закладки: плитки категорий (как в «Избранном»), под ними карточки активной категории
    this.bookmarks = function(){
        let books = counts.bookmarks || {}
        let types = BOOKMARKS.filter((type)=>books[type] > 0)
        let line  = elem('friend-profile__registers')
        // плитки — один ряд с прокруткой вбок, как в «Избранном»
        let tiles = new Scroll({horizontal: true, nopadding: true, step: 300})

        if(!types.length){
            content.append(elem('friend-profile__empty').append(elem('friend-profile__empty-text', Lang.translate('friends_empty_bookmarks'))))

            return
        }

        view.tiles = tiles

        line.append(tiles.render())

        content.append(line)

        types.forEach((type)=>{
            let tile = Utils.createInstance(Register, {
                title: Lang.translate('title_' + type),
                count: books[type],
                params: {
                    module: RegisterModule.only('Line', 'Callback'),
                    emit: {
                        onEnter: ()=>{
                            this.category(type)
                        },
                        onFocus: ()=>{
                            last = tile.render(true)

                            scroll.update(line, false)
                            tiles.update(tile.render(true), true)
                        }
                    }
                }
            })

            tile.create()

            tile.render(true).setAttribute('data-type', type)

            tiles.append(tile.render(true))

            view.cards.push(tile)
        })

        this.category(types.indexOf(object.bookmark) >= 0 ? object.bookmark : types[0], true)
    }

    /**
     * Переключить категорию закладок на этой же странице
     */
    this.category = function(type, first){
        if(view.type == type) return

        object.bookmark = type

        // карточки прежней категории убираем, плитки остаются
        view.cards = view.cards.filter((card)=>{
            if(card instanceof Register) return true

            card.destroy()

            return false
        })

        content.find('.friend-profile__cards, .friend-profile__empty, .friend-profile__wait').remove()
        content.find('.friend-profile__registers .register').removeClass('active')
        content.find('.friend-profile__registers [data-type="' + type + '"]').addClass('active')

        view.token   = ++token
        view.type    = type
        view.page    = 1
        view.done    = false
        view.loading = false

        // новый объект состояния: ответ прежней категории не попадёт в новую
        view = Object.assign({}, view)

        this.more()

        if(!first) this.collection(content.find('.friend-profile__registers .active')[0])
    }

    /**
     * События ленты: аватар, «ник действие», время, деталь с иконкой; справа — название, «Фильм · 2026», постер
     */
    this.feed = function(list){
        let box = content.find('.friend-profile__list')
        let add = []

        if(!box.length){
            box = elem('friend-profile__list')

            content.append(box)
        }

        list.forEach((event)=>{
            let item = Template.get('friend_feed')
            let card = event.card
            let det  = this.detail(event)

            item.addClass('friend-feed--' + event.type)

            item.find('.friend-feed__name').text((event.user && event.user.name) || user.name || '')
            item.find('.friend-feed__action').text(this.action(event))
            item.find('.friend-feed__time').text(this.date(event.time) + ', ' + Utils.parseTime(event.time).time)
            item.find('.friend-feed__detail use').attr('xlink:href', '#' + det.icon)
            item.find('.friend-feed__detail span').text(det.text).toggleClass('hide', !det.text)

            if(event.comment && event.comment.text){
                item.find('.friend-feed__detail').after(elem('friend-feed__comment', event.comment.text))
            }

            Utils.imgLoad(item.find('.friend-feed__avatar img'), Friends.avatar((event.user && event.user.icon) || user.icon), ()=>{}, (img)=>{
                img.src = './img/img_load.svg'
            })

            if(card){
                item.find('.friend-feed__title').text(card.title || card.name || '')
                item.find('.friend-feed__meta').text([Lang.translate(card.name !== undefined ? 'friends_feed_tv' : 'friends_feed_movie'), ((card.release_date || card.first_air_date || '') + '').slice(0, 4)].filter((a)=>a).join(' · '))

                if(card.poster_path){
                    Utils.imgLoad(item.find('.friend-feed__poster img'), TMDB.img(card.poster_path, 'w200'), ()=>{
                        item.find('.friend-feed__poster').addClass('loaded')
                    }, ()=>{})
                }
            }
            else if(event.collection){
                item.find('.friend-feed__title').text(event.collection.title || '')
                item.find('.friend-feed__meta').text(Lang.translate('friends_feed_collection_meta'))
                item.find('.friend-feed__poster').addClass('friend-feed__poster--collection').append('<svg><use xlink:href="#sprite-collection"></use></svg>')
            }
            else item.find('.friend-feed__target').remove()

            item.on('hover:focus', ()=>{
                last = item[0]

                scroll.update(item, true)

                if(card) Background.change(Utils.cardImgBackground(card))
            }).on('hover:enter', ()=>{
                if(card) Router.call('full', card)
            })

            box.append(item)

            view.items.push(event)

            add.push(item[0])
        })

        this.append(add)
    }

    this.action = function(event){
        if(event.type == 'watched') return Lang.translate('friends_feed_watched')
        if(event.type == 'bookmark') return Lang.translate(event.bookmark == 'like' ? 'friends_feed_like' : 'friends_feed_bookmark')
        if(event.type == 'comment') return Lang.translate('friends_feed_comment')
        if(event.type == 'collection') return Lang.translate('friends_feed_collection')

        return ''
    }

    // Строка под временем: иконка и коротко что именно (серии, длительность, категория закладки)
    this.detail = function(event){
        let card = event.card || {}

        if(event.type == 'watched'){
            if(card.name !== undefined){
                let episodes = event.episodes && event.episodes.length ? event.episodes : (event.season ? [{season: event.season, episode: event.episode}] : [])

                return {icon: ICONS.watched, text: this.episodes(episodes)}
            }

            return {icon: ICONS.watched, text: card.runtime ? this.duration(card.runtime) : ''}
        }

        if(event.type == 'bookmark') return {icon: event.bookmark == 'like' ? ICONS.like : ICONS.bookmark, text: BOOKMARKS.indexOf(event.bookmark) >= 0 ? Lang.translate('title_' + event.bookmark) : ''}
        if(event.type == 'comment') return {icon: ICONS.comment, text: ''}
        if(event.type == 'collection') return {icon: ICONS.collection, text: ''}

        return {icon: ICONS.watched, text: ''}
    }

    // Серии [{season, episode}] → «S01 E1–3, 5», несколько сезонов — «S01–S02 · 12»
    this.episodes = function(list){
        if(!list.length) return ''

        let pad     = (n)=>('0' + n).slice(-2)
        let seasons = list.map((e)=>e.season).filter((s, i, all)=>all.indexOf(s) === i)

        if(seasons.length > 1) return 'S' + pad(seasons[0]) + '–S' + pad(seasons[seasons.length - 1]) + ' · ' + text('friends_feed_episodes', {count: list.length})

        let ranges = []

        list.slice().sort((a, b)=>a.episode - b.episode).forEach((e)=>{
            let prev = ranges[ranges.length - 1]

            if(prev && e.episode == prev[1] + 1) prev[1] = e.episode
            else ranges.push([e.episode, e.episode])
        })

        return 'S' + pad(seasons[0]) + ' E' + ranges.map((r)=>r[0] == r[1] ? r[0] : r[0] + '–' + r[1]).join(', ')
    }

    // «30 октября», но «30 October» — как в истории просмотров
    this.date = function(time){
        let date = Utils.parseTime(time).full

        return Lang.selected(['en']) ? date : date.toLowerCase()
    }

    this.duration = function(minutes){
        let h = Math.floor(minutes / 60)
        let m = minutes % 60

        return (h ? h + ' ' + Lang.translate('time_h') + ' ' : '') + (m ? m + ' ' + Lang.translate('time_m') : '')
    }

    this.start = function(){
        if(Activity.active().activity !== this.activity) return

        Controller.add('content', {
            link: this,
            toggle: ()=>{
                this.collect()
                Controller.collectionFocus(last || tabs.find('.active')[0] || false, scroll.render(true))
            },
            // между колонками: «Сейчас смотрит» слева может быть не на одной высоте с фокусом справа
            left: ()=>{
                let movie = html.find('.friend-profile__watching:not(.hide) .friend-profile__movie')[0]

                if(Navigator.canmove('left')) Navigator.move('left')
                else if(movie && movie.offsetParent !== null && last !== movie) Controller.collectionFocus(movie, scroll.render(true))
                else Controller.toggle('menu')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
                else if(last && $(last).closest('.friend-profile__left').length) Controller.collectionFocus(tabs.find('.active')[0], scroll.render(true))
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else if(!this.nearest('up')) Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
                else this.nearest('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    /**
     * Ряды разной ширины (вкладки, плитки, сетка карточек): Navigator не находит элемент строго под/над фокусом —
     * берём ближайший ряд в нужную сторону и в нём ближайший по горизонтали элемент правой колонки
     * @param {string} dir - up | down
     * @returns {boolean} нашли
     */
    this.nearest = function(dir){
        let focus = last && last.parentNode ? last : null

        if(!focus) return false

        let rect  = focus.getBoundingClientRect()
        let all   = Array.from(content[0].querySelectorAll('.selector')).concat(Array.from(tabs[0].querySelectorAll('.selector')))
        let found = null
        let best  = null

        all.forEach((el)=>{
            if(el === focus || el.offsetParent === null) return

            let r  = el.getBoundingClientRect()
            let dy = dir == 'down' ? r.top - rect.bottom : rect.top - r.bottom

            if(dy < -1) return

            let dx = Math.abs((r.left + r.width / 2) - (rect.left + rect.width / 2))

            if(!best || dy < best.dy - 1 || (Math.abs(dy - best.dy) <= 1 && dx < best.dx)){
                best  = {dy, dx}
                found = el
            }
        })

        if(found) Controller.collectionFocus(found, scroll.render(true))

        return Boolean(found)
    }

    this.pause = function(){}

    this.stop = function(){}

    this.render = function(){
        return html
    }

    this.destroy = function(){
        destroyed = true

        if(view) view.cards.forEach((card)=>card.destroy())
        if(view && view.tiles) view.tiles.destroy()

        scroll.destroy()
        lscroll.destroy()

        html.remove()
    }
}

export default Friend
