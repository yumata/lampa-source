import Permit from './permit'
import Api from './api'
import Utils from '../../utils/utils'
import WatchInfo from '../../utils/watch_history_info'
import Storage from '../storage/storage'
import Head from '../../interaction/head/head'
import Manifest from '../manifest'
import Controller from '../controller'
import Select from '../../interaction/select'
import Modal from '../../interaction/modal'
import Noty from '../../interaction/noty'
import Loading from '../../interaction/loading'
import Bell from '../../interaction/bell'
import Lang from '../lang'
import TMDB from '../api/sources/tmdb'
import Template from '../../interaction/template'
import Platform from '../platform'
import Device from './device'
import Socket from '../socket'
import Activity from '../../interaction/activity/activity'

let icon
let rows     = {}  // friend_id -> {item, friend}
let requests = null // DOM счётчика заявок в открытом списке
let timer
let current  // активный объект Select (для остановки обновления)

let REFRESH = 1000 * 45
let EVENTS  = ['request', 'accept', 'invite', 'recommend']
let BELL    = '<svg width="30" height="30"><use xlink:href="#sprite-friends"></use></svg>'

function init(){
    if(!window.lampa_settings.account_use || window.lampa_settings.disable_features.friends) return

    icon = $('<div class="head__action selector open--friends"><svg><use xlink:href="#sprite-friends"></use></svg></div>')

    icon.on('hover:enter', ()=>{
        show()
    })

    let head    = Head.render()
    let profile = head.find('.open--profile')

    if(profile.length) profile.before(icon)
    else head.find('.full--screen').before(icon)

    Storage.listener.follow('change', (e)=>{
        if(e.name == 'account') update()
    })

    Select.listener.follow('fullshow', (e)=>{
        current = e.active
    })

    Select.listener.follow('close', (e)=>{
        if(e.active && e.active.friends_main) stop()
    })

    // CUB шлёт friends: {pending: [created_at…]} после check_token,
    // notice: {events: [{type: friend_request|friend_accept|friend_invite|friend_recommend, name, text, card, time}]} — сразу после события (cub utils/notify.js)
    Socket.listener.follow('message', (result)=>{
        if(!result || !result.data || typeof result.data !== 'object') return

        if(result.method == 'friends') notice(result.data)

        if(result.method == 'notice' && Array.isArray(result.data.events)){
            let events = result.data.events.filter((event)=>event && typeof event.type == 'string' && event.type.indexOf('friend_') == 0).map((event)=>{
                return {type: event.type.slice(7), name: event.name, text: event.text, card: event.card, time: event.time}
            })

            if(events.length) notice({events})
        }
    })

    update()
}

/**
 * Время последней заявки, о которой уже сказали (своё у каждого аккаунта) — чтобы не повторять Bell при каждом подключении
 * @param {number} [time] - записать
 * @returns {number}
 */
function notified(time){
    let email = Permit.account.email || ''
    let saved = Storage.get('friends_notified', '{}')

    if(!saved || typeof saved !== 'object' || saved.email !== email) saved = {email, time: 0}

    if(time){
        saved.time = Math.max(parseInt(saved.time) || 0, time)

        Storage.set('friends_notified', saved)
    }

    return parseInt(saved.time) || 0
}

/**
 * Уведомления о заявках через Bell
 * @param {object} data - {pending} или {events}
 */
function notice(data){
    if(!Permit.token || !icon) return

    let seen = notified()

    if(Array.isArray(data.pending)){
        let times = data.pending.map((t)=>parseInt(t) || 0)
        let fresh = times.filter((t)=>t > seen)

        icon.toggleClass('active', times.length > 0)

        if(fresh.length){
            Bell.push({icon: BELL, text: Lang.translate('friends_notice_pending').replace('{count}', fresh.length), time: 10*1000})

            notified(Math.max.apply(null, fresh))
        }
    }

    if(Array.isArray(data.events)){
        data.events.forEach((event)=>{
            let time = parseInt(event && event.time) || 0

            if(!event || EVENTS.indexOf(event.type) == -1) return

            if(event.type == 'request'){
                // уже показали списком pending при подключении
                if(time && time <= seen) return

                seen = Math.max(seen, time)

                notified(time)

                icon.addClass('active')
            }

            let name = '<b>' + escapeHtml(event.name || '') + '</b>'

            if(event.type == 'recommend'){
                let title = event.card && event.card.title ? escapeHtml(event.card.title) : ''

                return Bell.push({icon: BELL, text: Lang.translate('friends_notice_recommend').replace('{name}', name).replace('{title}', title) + (event.text ? '<br>' + escapeHtml(String(event.text).slice(0, 120)) : ''),time: 10*1000})
            }

            Bell.push({icon: BELL, text: Lang.translate('friends_notice_' + event.type).replace('{name}', name),time: 10*1000})
        })

        // список открыт — сразу обновить число заявок и статусы
        if(timer) refresh()
    }
}

/**
 * Показать / скрыть иконку в шапке
 */
function update(){
    if(icon) icon.toggleClass('hide', !Permit.token)
}

function avatar(name){
    return Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + ((name || 'l_1') + '').replace(/[^a-z0-9_]/gi, '') + '.png'
}

function escapeHtml(str){
    return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/**
 * «Был 2 часа назад»
 * @param {number} time - unix ms
 * @returns {string}
 */
function lastSeen(time){
    time = parseInt(time) || 0

    if(!time) return ''

    let min = Math.floor(Math.max(0, Date.now() - time) / 60000)

    if(min < 1) return Lang.translate('friends_last_seen_now')

    let value = min
    let forms = 'friends_minutes'

    if(min >= 60 * 24){
        value = Math.floor(min / (60 * 24))
        forms = 'friends_days'
    }
    else if(min >= 60){
        value = Math.floor(min / 60)
        forms = 'friends_hours'
    }

    return Lang.translate('friends_last_seen').replace('{time}', value + ' ' + WatchInfo.plural(value, Lang.translate(forms)))
}

function watchingOf(friend){
    let w = friend.watching

    return w && typeof w == 'object' && w.title ? w : null
}

function statusText(friend){
    let watching = watchingOf(friend)

    if(watching) return Lang.translate('friends_watching').replace('{title}', watching.title)
    if(friend.online) return Lang.translate('friends_online')

    return lastSeen(friend.last_seen)
}

/**
 * Порядок: смотрят → в приложении → по времени последнего визита
 */
function sort(friends){
    let weight = (f)=> watchingOf(f) ? 2 : f.online ? 1 : 0

    return friends.slice().sort((a, b)=>{
        let w = weight(b) - weight(a)

        return w || (parseInt(b.last_seen) || 0) - (parseInt(a.last_seen) || 0)
    })
}

/**
 * Обновить строку друга — меняем только то, что изменилось
 */
function draw(row, friend){
    let item     = row.item
    let watching = watchingOf(friend)
    let status   = statusText(friend)
    let img      = watching && watching.img ? TMDB.img(watching.img, 'w300') : ''
    let poster   = item.find('.selectbox-friend__poster')

    if(row.status !== status){
        row.status = status

        item.find('.selectbox-friend__status').text(status).toggleClass('hide', !status)
    }

    if(row.online !== Boolean(friend.online)){
        row.online = Boolean(friend.online)

        item.toggleClass('selectbox-friend--online', row.online)
    }

    if(row.img !== img){
        row.img = img

        item.toggleClass('selectbox-friend--watching', Boolean(img))

        poster.removeClass('loaded')

        if(img){
            Utils.imgLoad(poster.find('img'), img, ()=>{
                poster.addClass('loaded')
            }, ()=>{
                item.removeClass('selectbox-friend--watching')
            })
        }
    }

    row.friend = friend
}

function friendItem(friend){
    return {
        title: escapeHtml(friend.name || ''),
        template: 'selectbox_friend',
        onSelect: ()=>{
            profile(friend)
        },
        onDraw: (item)=>{
            // Select перерисовывает строки и при возврате из вложенного списка — берём последние данные друга
            let prev = rows[friend.friend_id]
            let row  = {item}

            item.find('.selectbox-friend__name').text(friend.name || '')

            Utils.imgLoad(item.find('.selectbox-friend__image'), avatar(friend.icon), ()=>{}, (img)=>{
                img.src = './img/img_load.svg'
            })

            rows[friend.friend_id] = row

            draw(row, prev ? prev.friend : friend)
        }
    }
}

/**
 * Открыть профиль друга: список закрываем, назад из профиля — на прежний экран
 */
function profile(friend){
    stop()

    Select.closeAll()

    Activity.push({
        url: '',
        title: friend.name || '',
        component: 'friend',
        friend_id: friend.friend_id,
        page: 1
    })
}

/**
 * Загрузить список друзей
 */
function load(){
    return Api.load('friends/list')
}

/**
 * Открыть список друзей
 * @param {string} [back] - куда вернуть фокус после закрытия (при повторном открытии из заявок — исходный контроллер, а не закрытый селект)
 */
function show(back){
    if(!Permit.token) return

    stop()

    let enabled = typeof back == 'string' ? back : Controller.enabled().name

    if(enabled == 'select' || enabled == 'loading') enabled = 'head'

    Loading.start(()=>{
        Api.clear()

        Loading.stop()

        Controller.toggle(enabled)
    })

    load().then((result)=>{
        Loading.stop()

        if(!result || !result.secuses) return error(result, enabled)

        build(result, enabled)
    }).catch((e)=>{
        Loading.stop()

        error(e, enabled)
    })
}

/**
 * Текст ошибки: сообщение CUB (`{text}`), иначе разбор ошибки запроса, иначе «Нет подключения к сети»
 */
function errorText(e){
    if(e && e.responseJSON && e.responseJSON.text) return e.responseJSON.text
    if(e && typeof e.text == 'string' && e.text) return e.text
    if(e && typeof e.decode_error == 'string' && e.decode_error) return e.decode_error

    return Lang.translate('network_noconnect')
}

function error(e, enabled){
    Noty.show(errorText(e))

    Controller.toggle(enabled)
}

function build(result, enabled){
    let friends  = sort(result.friends || [])
    let incoming = result.incoming || []
    let items    = []

    rows     = {}
    requests = null

    // incoming = [{
    //     name: 'trollbot'
    // }]

    icon.toggleClass('active', incoming.length > 0)

    if(incoming.length){
        items.push({
            title: Lang.translate('friends_requests'),
            requests: true,
            onDraw: (item)=>{
                item.addClass('selectbox-friends-requests')

                requests = $('<span class="navigation-tabs__badge"></span>').text(incoming.length)

                item.find('.selectbox-item__title').append(requests)
                item.append('<div class="selectbox-friends-requests__arrow"><svg viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>')
            },
            onSelect: ()=>{
                showRequests(incoming, enabled)
            }
        })
    }

    items.push({
        title: Lang.translate('friends_add'),
        template: 'selectbox_icon',
        icon: '<svg class="size-medium"><use xlink:href="#sprite-plus"></use></svg>',
        onSelect: ()=>{
            add(enabled)
        }
    })

    friends.forEach((friend)=>{
        items.push(friendItem(friend))
    })

    Select.show({
        title: Lang.translate('friends_title'),
        items: items,
        nohide: true,
        nomark: true,
        friends: true,
        friends_main: true,
        onBack: ()=>{
            stop()

            Controller.toggle(enabled)
        },
        onFullDraw: (container)=>{
            if(!friends.length) container.append($('<div class="selectbox__text selector"><div>'+Lang.translate('friends_empty_text')+'</div></div>'))
        }
    })

    schedule()
}

/**
 * Пока список открыт — периодически обновляем статусы друзей
 */
function schedule(){
    clearTimeout(timer)

    timer = setTimeout(refresh, REFRESH)
}

function stop(){
    clearTimeout(timer)

    timer = null
}

function refresh(){
    if(!Select.opened() || !current || !current.friends) return stop()

    load().then((result)=>{
        if(!timer || !result || !result.secuses) return

        let incoming = result.incoming || []

        ;(result.friends || []).forEach((friend)=>{
            let row = rows[friend.friend_id]

            if(row && row.item[0].parentNode) draw(row, friend)
            else if(row) row.friend = friend
        })

        if(requests) requests.text(incoming.length)

        icon.toggleClass('active', incoming.length > 0)
    }).catch(()=>{}).then(()=>{
        if(timer) schedule()
    })
}

/**
 * Входящие заявки
 */
function showRequests(incoming, enabled){
    let items = incoming.map((request)=>{
        return {
            title: escapeHtml(request.name || ''),
            subtitle: Lang.translate('friends_wants'),
            template: 'selectbox_icon',
            icon: '<img class="size-medium" src="' + avatar(request.icon) + '" />',
            request: request,
            onDraw: (item)=>{
                // Select делает первую букву заглавной — ник показываем как есть
                item.find('.selectbox-item__title').text(request.name || '')
            }
        }
    })

    Select.show({
        title: Lang.translate('friends_requests'),
        items: items,
        nohide: true,
        nomark: true,
        friends: true,
        onSelect: (a)=>{
            requestActions(a.request, enabled)
        }
    })
}

function requestActions(request, enabled){
    Select.show({
        title: request.name,
        friends: true,
        items: [
            {title: Lang.translate('friends_accept'), action: 'accept'},
            {title: Lang.translate('friends_decline'), action: 'decline'}
        ],
        onSelect: (a)=>{
            stop()

            Loading.start(()=>{
                Loading.stop()

                Controller.toggle(enabled)
            })

            Api.load('friends/' + a.action, {}, {id: request.id}).then((result)=>{
                Loading.stop()

                if(result && result.message) Bell.push({text: escapeHtml(result.message), time: 10*1000})

                show(enabled)
            }).catch((e)=>{
                Loading.stop()

                Noty.show(errorText(e))

                show(enabled)
            })
        }
    })
}

/**
 * «Добавить друга» — список закрывается, окно как у входа в аккаунт: QR (на ТВ) и ссылка на страницу друзей на сайте
 * @param {string} enabled - куда вернуть фокус после закрытия окна
 */
function add(enabled){
    let link = 'https://' + Manifest.cub_site + '/friends'
    let open = Device.opener()
    let html = Template.get('modal_qr', {
        title: Lang.translate('friends_add'),
        text: Lang.translate('friends_add_text'),
        qr_text: Lang.translate('friends_add_qr')
    })

    stop()

    Select.closeAll()

    if(Platform.tv()){
        html.addClass('layer--' + (Platform.mouse() ? 'wheight' : 'height'))

        Utils.qrcode(link, html.find('.account-modal-split__qr-code'), ()=>{
            html.find('.account-modal-split__qr').addClass('hide')
        })
    }
    else html.addClass('account-modal-split--mobile')

    if(open){
        let button = $('<div class="simple-button simple-button--inline selector account-modal-split__open"></div>').text(Lang.translate('account_device_code_open'))

        button.on('hover:enter', ()=>{
            open(link)
        })

        html.find('.account-modal-split__info').append(button)
    }

    Device.copySite(html, ()=>link)

    Modal.open({
        title: '',
        html: html,
        size: Platform.tv() ? 'full' : 'medium',
        scroll: {
            nopadding: true
        },
        onBack: ()=>{
            Modal.close()

            Controller.toggle(enabled)
        }
    })
}

/**
 * Карточка, которую можно посоветовать: только tmdb / cub (сервер принимает movie_{id} / tv_{id})
 * @param {object} card
 * @returns {string} card_id или ''
 */
function recommendId(card){
    if(!card || !card.id) return ''

    let source = (card.source || 'tmdb') + ''
    let id     = parseInt(card.id)

    if((source !== 'tmdb' && source !== 'cub') || !id || isNaN(id)) return ''

    return (card.original_name || card.name ? 'tv' : 'movie') + '_' + id
}

/**
 * Можно ли показать «Посоветовать друзьям» для карточки
 */
function canRecommend(card){
    return Boolean(Permit.token && !window.lampa_settings.disable_features.friends && recommendId(card))
}

/**
 * Окно «Посоветовать фильм / сериал»: «Советовать всем друзьям», выбор друзей галочками, «Посоветовать» → friends/recommend.
 * Кто не принимает советы (accepts_recommendations) — неактивен с подписью
 * @param {object} card
 * @param {string} [back] - куда вернуть фокус (по умолчанию content)
 */
function recommend(card, back){
    let card_id = recommendId(card)

    if(!Permit.token || !card_id) return

    let enabled = back || 'content'

    Loading.start(()=>{
        Api.clear()

        Loading.stop()

        Controller.toggle(enabled)
    })

    load().then((result)=>{
        Loading.stop()

        if(!result || !result.secuses) return error(result, enabled)

        picker(card, card_id, sort(result.friends || []), enabled)
    }).catch((e)=>{
        Loading.stop()

        error(e, enabled)
    })
}

function picker(card, card_id, friends, enabled){
    let tv       = card_id.indexOf('tv_') == 0
    let open     = friends.filter((f)=>f.accepts_recommendations == 1)
    let selected = {}
    let checks   = {} // friend_id -> строка друга
    let sending  = false
    let html     = Template.get('friend_recommend')
    let all      = html.find('.friend-recommend__all')
    let counter  = html.find('.friend-recommend__selected')
    let list     = html.find('.friend-recommend__list')

    let close = ()=>{
        Modal.close()

        Controller.toggle(enabled)
    }

    // одна правка DOM на переключение: счётчик и галочка «всем»
    let refresh = ()=>{
        let n = Object.keys(selected).length

        counter.text(Lang.translate('friends_recommend_selected').replace('{count}', n))

        all.toggleClass('active', open.length > 0 && n == open.length)
    }

    let set = (friend_id, value)=>{
        if(value) selected[friend_id] = true
        else delete selected[friend_id]

        if(checks[friend_id]) checks[friend_id].toggleClass('active', value)
    }

    let send = ()=>{
        if(sending) return

        let ids = Object.keys(selected)

        if(!ids.length) return Noty.show(Lang.translate('friends_recommend_none'))

        sending = true

        // карточка целиком — название и обложка на языке пользователя (как в bookmarks/add), а не из общей cards на сервере
        Api.load('friends/recommend', {}, {card_id, friend_ids: ids.join(','), data: JSON.stringify(Utils.clearCard(card))}).then((result)=>{
            sending = false

            if(!result || !result.secuses) return Noty.show(errorText(result))

            let sent    = result.sent || []
            let skipped = (result.skipped || []).map((s)=>(s.name || '') + ' — ' + Lang.translate('friends_recommend_reason_' + (['disabled', 'repeat', 'not_friend'].indexOf(s.reason) >= 0 ? s.reason : 'disabled')))
            let message = sent.length == 1 ? Lang.translate('friends_recommend_sent_one') : Lang.translate('friends_recommend_sent').replace('{count}', sent.length)

            if(skipped.length) message += '. ' + Lang.translate('friends_recommend_skipped').replace('{list}', skipped.join(', '))

            close()

            Bell.push({icon: BELL, text: message, time: 10*1000})
        }).catch((e)=>{
            sending = false

            Noty.show(errorText(e))
        })
    }

    if(!friends.length){
        html.empty().append($('<div class="friend-recommend__empty"></div>').text(Lang.translate('friends_empty_text')))
    }

    all.find('.friend-recommend__total').text(open.length + ' ' + WatchInfo.plural(open.length, Lang.translate('friends_count')))

    // некого отметить — строка «всем» не в фокусе
    if(!open.length) all.removeClass('selector').addClass('friend-recommend--disabled')
    else all.on('hover:enter', ()=>{
        let value = Object.keys(selected).length < open.length

        open.forEach((f)=>set(f.friend_id, value))

        refresh()
    })

    friends.forEach((friend)=>{
        let accepts = friend.accepts_recommendations == 1
        let item    = Template.get('friend_recommend_item')
        let status  = accepts ? statusText(friend) : Lang.translate('friends_recommend_disabled')

        item.toggleClass('friend-recommend__item--online', Boolean(friend.online))
        item.find('.friend-recommend__name').text(friend.name || '')
        item.find('.friend-recommend__status').text(status).toggleClass('hide', !status)

        Utils.imgLoad(item.find('.friend-recommend__avatar img'), avatar(friend.icon), ()=>{}, (img)=>{
            img.src = './img/img_load.svg'
        })

        // кто не принимает советы — виден, но без фокуса и выбора
        if(!accepts) item.removeClass('selector').addClass('friend-recommend--disabled')
        else{
            checks[friend.friend_id] = item

            item.on('hover:enter', ()=>{
                set(friend.friend_id, !selected[friend.friend_id])

                refresh()
            })
        }

        list.append(item)
    })

    refresh()

    Modal.open({
        title: Lang.translate(tv ? 'friends_recommend_title_tv' : 'friends_recommend_title_movie'),
        html: html,
        size: 'small',
        // кнопка внутри прокрутки: при «outside» Modal переводит «вниз» сразу на кнопку, если список короче окна
        buttons: friends.length ? [{
            name: Lang.translate('friends_recommend_send'),
            onSelect: send
        }] : null,
        select: open.length ? all[0] : false,
        onBack: close
    })
}

export default {
    init: Utils.onceInit(init),
    show,
    update,
    avatar,
    recommend,
    canRecommend
}
