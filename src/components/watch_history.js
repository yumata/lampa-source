import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import CardModule from '../interaction/card/module/module'
import Background from '../interaction/background'
import Utils from '../utils/utils'
import Router from '../core/router'
import Lang from '../core/lang'
import Account from '../core/account/account'
import Api from '../core/api/api'
import Manifest from '../core/manifest'
import Reguest from '../utils/reguest'
import TimeTable from '../core/timetable'
import Timeline from '../interaction/timeline'
import Head from '../interaction/head/head'
import Select from '../interaction/select'
import Controller from '../core/controller'
import Loading from '../interaction/loading'
import Bell from '../interaction/bell'
import EmptyRouter from '../interaction/empty/module/router'
import Info from '../utils/watch_history_info'

const DAY = 1000 * 60 * 60 * 24

let details = {} // карточки из idsview на время работы приложения: серии в сезонах (seasons {"1": 13, ...})

/**
 * «История» при синхронизации с CUB (открывается через Favorite.historyActivity): карточка на сериал/фильм
 * с датой последнего просмотра и последней серией (модуль карточки History). OK на карточке — панель:
 * прогресс, сезоны «досмотрены / сейчас / впереди», «Продолжить» и просмотры по дням.
 * Если сервер историю не отдаёт (старый сервер, нет сети) — прежняя история из закладок, как экран favorite
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

    let network   = new Reguest()
    let legacy    = false // показываем прежнюю историю из закладок
    let destroyed = false
    let button

    let text = (name, values = {})=>{
        let result = Lang.translate(name)

        for(let key in values) result = result.replace('{' + key + '}', values[key])

        return result
    }

    let count = (n, forms)=>n + ' ' + Info.plural(n, Lang.translate(forms))

    let ofTotal = (watched, total)=>text('watch_history_of_total', {watched, total, episodes: Info.plural(total, Lang.translate('watch_history_episodes_of'))})

    let elem = (cls, value)=>{
        let node = $('<div></div>').addClass(cls)

        if(value !== undefined) node.text(value)

        return node
    }

    let tmdb = (card)=>card.original_name && (card.source == 'tmdb' || card.source == 'cub')

    function params(){
        return Object.assign({}, object, {group: 'card'})
    }

    function prepare(data){
        data.results.forEach(card=>{
            card.params = {
                module: CardModule.toggle(CardModule.MASK.base, 'History')
            }
        })

        seasons(data.results)

        return data
    }

    /**
     * Серии в сезонах для страницы — один запрос idsview на все её сериалы (TMDB/CUB), заранее: панель открывается без ожидания
     * @param {array} cards
     * @param {function} [call] - после ответа (и при ошибке)
     */
    function seasons(cards, call){
        let ids = cards.filter(card=>tmdb(card) && !details[card.id]).map(card=>card.id).filter((id, i, all)=>all.indexOf(id) == i)

        if(!ids.length) return call && call()

        let url = Utils.protocol() + 'tmdb.' + Manifest.cub_domain + '/idsview?ids=' + ids.map(id=>id + ':tv').join(',')

        network.silent(url, (json)=>{
            ;(json.results || []).forEach(card=>{
                if(card && card.id && card.seasons) details[card.id] = card
            })

            if(call) call()
        }, ()=>{
            if(call) call()
        })
    }

    /**
     * Прогресс сериала: серии из истории + серии без отметки с тайм-кодом больше 1% (updated тайм-кода — дата просмотра)
     * @returns {{counts:object, extra:array, shown:object, progress:object}}
     */
    function progressOf(card){
        let history = card.watch_history
        let counts  = Info.seasons(details[card.id], TimeTable.get(card))
        let extra   = Info.fromTimeline(counts, history.episodes, (season, episode)=>Timeline.watchedEpisode(card, season, episode, true))
        let shown   = Info.merge(history, extra)

        return {counts, extra, shown, progress: Info.progress(shown, counts, card)}
    }

    /**
     * Сезоны: «✓ 1–14 сезоны · 313 серий · досмотрены», «15 сезон · сейчас · 10 из 22 серий», «16–36 сезоны · впереди · 445 серий»
     */
    function chips(progress){
        let box = elem('watch-history-days__seasons')

        progress.groups.forEach(group=>{
            let one   = group.from == group.to
            let title = one ? text('watch_history_season_n', {n: group.from}) : text('watch_history_seasons_range', {from: group.from, to: group.to})
            let chip  = elem('watch-history__season watch-history__season--' + group.type + (group.type == 'done' && !group.complete ? ' watch-history__season--partial' : ''))
            let descr

            if(group.type == 'done'){
                if(group.complete) title = '✓ ' + title

                descr = group.complete ? count(group.total, 'watch_history_episodes') + ' · ' + Lang.translate(one ? 'watch_history_done_one' : 'watch_history_done') : ofTotal(group.watched, group.total)
            }
            else if(group.type == 'now'){
                title += ' · ' + Lang.translate('watch_history_now')
                descr  = group.total ? ofTotal(group.watched, group.total) : count(group.watched, 'watch_history_episodes')
            }
            else descr = Lang.translate('watch_history_ahead') + ' · ' + count(group.total, 'watch_history_episodes')

            chip.append(elem('watch-history__season-title', title), elem('watch-history__season-descr', descr))

            if(group.type == 'now' && group.total) chip.append($('<div class="watch-history__season-bar"><div></div></div>').find('div').css('width', Math.min(100, Math.round(group.watched / group.total * 100)) + '%').end())

            box.append(chip)
        })

        return box
    }

    /**
     * Панель карточки: прогресс, сезоны, «Продолжить» и все просмотры по дням (серии подряд за вечер — одной строкой)
     */
    function panel(card){
        let history   = card.watch_history
        let tv        = Boolean(card.original_name)
        let cancelled = false
        let wait      = 2
        let list      = []
        let enabled   = Controller.enabled().name

        Loading.start(()=>{
            cancelled = true

            Loading.stop()
        })

        let ready = ()=>{
            if(--wait || cancelled || destroyed) return

            Loading.stop()

            let calc     = tv ? progressOf(card) : null
            let progress = calc ? calc.progress : null
            let latest   = calc ? calc.shown.last : null

            // серии из тайм-кодов с датой просмотра — в своих днях
            if(calc) list = list.concat(calc.extra.filter(e=>e.watched_at > 0))

            let days   = Info.days(list)
            let items  = []
            let poster = $('<div class="watch-history-days__poster"><img></div>')
            let head   = elem('watch-history-days__head')
            let texts  = elem('watch-history-days__texts')
            let first  = list.length ? Math.min.apply(null, list.map(r=>r.watched_at)) : history.first_at

            texts.append(elem('watch-history-days__title', card.name || card.title || ''))

            if(progress){
                let parts = [progress.total ? ofTotal(progress.watched, progress.total) : count(progress.watched, 'watch_history_episodes')]

                if(progress.seasons) parts.push(count(progress.seasons, 'watch_history_seasons'))
                if(progress.total) parts.push(progress.percent + '%')

                texts.append(elem('watch-history-days__text', parts.join(' · ')))
            }
            else texts.append(elem('watch-history-days__text', count(list.length || history.views, 'watch_history_views')))

            texts.append(elem('watch-history-days__text', text('watch_history_watched_since', {days: count(days.length || history.days, 'watch_history_days'), date: Utils.parseTime(first).full.toLowerCase()})))

            if(latest){
                texts.append(elem('watch-history-days__text', Lang.translate('watch_history_last_episode') + ': ' + text('watch_history_season_n', {n: latest.season}) + ', ' + text('watch_history_episode_n', {n: latest.episode}).toLowerCase()))
            }

            head.append(poster, texts)

            Utils.imgLoad(poster.find('img'), Api.img(card.poster_path, 'w200'), ()=>{}, ()=>poster.find('img').remove())

            items.push({html: head, noenter: true})

            if(progress && progress.total){
                items.push({html: $('<div class="watch-history-days__bar"><div></div></div>').find('div').css('width', progress.percent + '%').end(), noenter: true})
            }

            // какие сезоны просмотрены
            if(progress && progress.groups.length) items.push({html: chips(progress), noenter: true})

            // продолжить — следующая серия, у фильма и досмотренного сериала — открыть карточку
            let next = progress ? progress.next : null
            let open = $('<div class="watch-history-days__continue selector"></div>')

            open.append(
                elem('watch-history-days__continue-title', next ? Lang.translate('title_continue_two') : Lang.translate('watch_history_open')),
                elem('watch-history-days__continue-value', next ? text('watch_history_season_n', {n: next.season}) + ', ' + text('watch_history_episode_n', {n: next.episode}).toLowerCase() : (progress && progress.finished ? Lang.translate('watch_history_finished') : ''))
            )

            items.push({html: open, open: true})

            let today = new Date()

            today.setHours(0, 0, 0, 0)

            days.forEach(day=>{
                let date  = Utils.parseTime(day.time)
                let block = $('<div class="watch-history-days__day selector"></div>')
                let top   = elem('watch-history-days__day-head')
                let name  = day.time >= today.getTime() ? Lang.translate('watch_history_today') : day.time >= today.getTime() - DAY ? Lang.translate('watch_history_yesterday') : date.week

                top.append(
                    elem('watch-history-days__day-name', Utils.capitalizeFirstLetter(name)),
                    elem('watch-history-days__day-date', date.full.toLowerCase()),
                    elem('watch-history-days__day-count', count(day.count, tv ? 'watch_history_episodes' : 'watch_history_views'))
                )

                block.append(top)

                day.items.forEach(one=>{
                    let line = elem('watch-history-days__line')
                    let what = one.from === null ? Lang.translate('watch_history_view') : one.from == one.to ? text('watch_history_episode_n', {n: one.from}) : text('watch_history_episodes_range', {from: one.from, to: one.to})

                    line.append(
                        elem('watch-history-days__time', Utils.parseTime(one.time).time),
                        elem('watch-history-days__season', one.season !== null ? text('watch_history_season_n', {n: one.season}) : ''),
                        elem('watch-history-days__episodes', what)
                    )

                    block.append(line)
                })

                items.push({html: block, noenter: true})
            })

            Select.show({
                title: Lang.translate('watch_history_by_days'),
                items,
                nomark: true,
                onSelect: (a)=>{
                    Controller.toggle(enabled)

                    if(a.open) Router.call('full', card)
                },
                onBack: ()=>{
                    Controller.toggle(enabled)
                }
            })
        }

        Account.Api.watchHistoryCard(history.card_id, (rows)=>{
            list = rows

            ready()
        }, ()=>{
            if(cancelled) return

            cancelled = true

            Loading.stop()

            Bell.push({text: Lang.translate('title_error')})
        })

        // сезоны обычно уже загружены вместе со страницей
        if(tv) seasons([card], ready)
        else ready()
    }

    comp.use(EmptyRouter, 0)

    comp.use({
        onCreate: function(){
            Account.Api.watchHistory(params(), (data)=>{
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
            else Account.Api.watchHistory(params(), (data)=>resolve(prepare(data)), reject)
        },
        onInstance: function(item, data){
            item.use({
                onEnter: ()=>{
                    if(legacy || !data.watch_history) Router.call('full', data)
                    else panel(data)
                },
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
            destroyed = true

            network.clear()

            if(button) button.remove()
        }
    })

    return comp
}

export default component
