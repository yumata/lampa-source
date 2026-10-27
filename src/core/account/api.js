import Permit from './permit'
import Utils from '../../utils/utils'
import Manifest from '../manifest'
import Reguest from '../../utils/reguest'
import Arrays from '../../utils/arrays'
import Storage from '../storage/storage'
import Modal from './modal'

let network = new Reguest()

function url(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

function load(path, params = {}, post = false){
    return new Promise((resolve, reject)=>{
        if(Permit.token){
            let account = Permit.account

            Arrays.extend(params, {
                headers: {
                    token: account.token,
                    profile: account.profile.id
                },
                timeout: 8000
            })

            let u = params.url ? params.url : url() + path

            network.silent(u, resolve, reject, post, params)
        }
        else{
            reject({decode_code: 403})
        }
    })
}

function persons(secuses, error){
    if(Permit.access && !window.lampa_settings.disable_features.persons){
        load('person/list').then((data)=>{
            Storage.set('person_subscribes_id', data.results.map(a=>a.person_id))

            if(secuses) secuses(data.results)
        }).catch(error ? error : ()=>{})
    }
    else if(error) error({decode_code: 403})
}

function user(secuses, error){
    if(Permit.access){
        load('users/get?device_name=' + decodeURIComponent(Storage.get('device_name'))).then((data)=>{
            Storage.set('account_user', JSON.stringify(data.user))

            if(secuses) secuses(data.user)
        }).catch(error ? error : ()=>{})
    }
    else if(error) error({decode_code: 403})
}

function plugins(call){
    if(Permit.access){
        load('plugins/all', {timeout: 3000}).then((result)=>{
            if(result.secuses){
                Storage.set('account_plugins', result.plugins)

                call(result.plugins)
            }
            else{
                call(Storage.get('account_plugins','[]'))
            }
        }).catch(()=>{
            call(Storage.get('account_plugins','[]'))
        })
    }
    else call([])
}

function pluginToggle(plugin, status){
    if(Permit.access){
        load((plugin.author ? 'extensions' : 'plugins') + '/status', {}, {
            id: plugin.id,
            status
        }).catch(()=>{})
    }
}

function notices(call){
    if(Permit.access){
        load('notice/all', {
            cache: 1000 * 60 * 10
        }).then((result)=>{
            if(result.secuses){
                Storage.set('account_notice', result.notice.map(n=>n))

                call(result.notice)
            }
            else call([])
        }).catch(()=>{
            call([])
        })
    }
    else call([])
}

function subscribes(params = {}, secuses, error){
    if(Permit.access){
        load('notifications/all').then((result)=>{
            if(params.to_card_subscribe){
                let cards = []

                result.notifications.forEach(n => {
                    let card = Arrays.decodeJson(n.card, {})
                        card.subscribe = n

                        delete card.subscribe.card

                    cards.push(card)
                })

                secuses({
                    results: cards
                })
            }
            else{
                secuses({
                    results: result.notifications.map(r=> Arrays.decodeJson(r.card,{}))
                })
            }
        }).catch(error ? error : ()=>{})
    }
    else if(error) error({decode_code: 403})
}

function subscribeToTranslation(params = {}, call, error){
    if(Permit.access && params.voice){
        load('notifications/add', {}, {
            voice: params.voice,
            data: JSON.stringify(Utils.clearCard(params.card)),
            episode: params.episode,
            season: params.season
        }).then((result)=>{
            if(result.limited) Modal.limited()
            else if(call) call()
        }).catch(error ? error : ()=>{})
    }
    else if(error) error({decode_code: 403})
}

/**
 * История просмотров CUB (watch_history), сгруппированная сервером: group 'card' — одна запись на карточку (все серии, последняя серия, число дней),
 * 'day' — карточка за день (серии за день, число просмотров). Старая история (закладка history) работает как раньше, эта — только с сервера
 * @param {{page:integer, filter:string, group:string}} params - filter: '' | 'movie' | 'tv', group: 'card' | 'day' (по умолчанию)
 * @param {function} secuses - {results: [card + card.watch_history], page, total_pages, total}
 * @param {function} error
 */
function watchHistory(params = {}, secuses, error){
    if(Permit.access){
        let page = params.page || 1
        let type = params.filter == 'movie' || params.filter == 'tv' ? '&type=' + params.filter : ''

        // группы считает сервер по часовому поясу устройства
        let group = '&group=' + (params.group == 'card' ? 'card' : 'day') + '&tz=' + new Date().getTimezoneOffset()

        load('history/list?page=' + page + type + group).then((result)=>{
            let results = (result.history || []).map(item=>{
                let card = Arrays.clone(item.card || {})

                card.watch_history = {
                    id: item.id,
                    card_id: item.card_id,
                    season: item.season,
                    episode: item.episode,
                    watched_at: item.watched_at,
                    first_at: item.first_at || item.watched_at,
                    source: item.source,
                    episodes: item.episodes || [],
                    last: item.last || null,
                    views: item.views || 1,
                    days: item.days || 1
                }

                return card
            }).filter(card=>card.id)

            secuses({
                results,
                page: result.page,
                total_pages: result.total_pages,
                total: result.total
            })
        }).catch(error ? error : ()=>{})
    }
    else if(error) error({decode_code: 403})
}

/**
 * Все просмотры одной карточки (до 1000, новые первыми) — для «Истории по дням»
 * @param {string} card_id - tv_1399 / movie_603
 * @param {function} secuses - [{id, season, episode, watched_at, source}]
 * @param {function} error
 */
function watchHistoryCard(card_id, secuses, error){
    if(Permit.access){
        load('history/card?card_id=' + encodeURIComponent(card_id)).then((result)=>{
            secuses(result.history || [])
        }).catch(error ? error : ()=>{})
    }
    else if(error) error({decode_code: 403})
}

export default {
    url,
    watchHistory,
    watchHistoryCard,
    load,
    user,
    persons,
    plugins,
    pluginToggle,
    subscribes,
    notices,
    subscribeToTranslation,
    clear: network.clear
}