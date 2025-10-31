import Storage from './storage/storage'
import Favorite from './favorite'
import TMDB from './api/sources/tmdb'
import Arrays from '../utils/arrays'
import Utils from '../utils/utils'
import Account from './account/account'
import Cache from '../utils/cache'
import ContentRows from './content_rows'
import Lang from './lang'
import Episode from '../interaction/episode/episode'
import EpisodeModule from '../interaction/episode/module/module'
import Background from '../interaction/background'
import Router from './router'
import Timer from './timer'

let data     = []
let object   = false
let limit    = 300
let started  = Date.now()
let debug    = false

/**
 * Запуск
 */
function init(){
    data = Storage.cache('timetable',limit,[])

    Timer.add(1000*60*10, favorites)
    Timer.add(1000*60*(debug ? 0.1 : 0.3), extract)

    Favorite.listener.follow('add,added',(e)=>{
        if(e.card.number_of_seasons && e.where !== 'history') update(e.card)
    })

    Favorite.listener.follow('remove',(e)=>{
        if(e.card.number_of_seasons && e.method == 'id'){
            let find = data.find(a=>a.id == e.card.id)

            if(find){
                Arrays.remove(data,find)

                Storage.set('timetable',data)

                Storage.remove('timetable', find.id)
            }
        }
    })

    Lampa.Listener.follow('worker_storage',(e)=>{
        if(e.type == 'insert' && e.name == 'timetable'){
            data = Storage.get('timetable','[]')
        } 
    })

    ContentRows.add({
        index: 0,
        screen: ['main', 'category'],
        call: (params, screen)=>{
            if(screen == 'category' && params.url == 'movie') return

            let results = lately().slice(0,20)

            if(!results.length) return

            return function(call){
                results.forEach(item=>{
                    item.params = {
                        createInstance: (item)=> new Episode(item),
                        module: EpisodeModule.only('Card', 'Callback'),
                        emit: {
                            onlyEnter: Router.call.bind(Router, 'full', item.card),
                            onlyFocus: ()=>{
                                Background.change(Utils.cardImgBackgroundBlur(item.card))
                            }
                        }
                    }

                    Arrays.extend(item, item.episode)
                })

                call({
                    results,
                    title: Lang.translate('title_upcoming_episodes')
                })
            }
        }
    })
}

/**
 * Добавить карточки к парсингу
 * @param {[{id:integer,number_of_seasons:integer}]} elems - карточки
 */
function add(elems){
    if(started + 1000*60*2 > Date.now()) return

    let filtred = elems.filter(elem=>elem.number_of_seasons && typeof elem.id == 'number' && (elem.source == 'tmdb' || elem.source == 'cub'))

    console.log('Timetable', 'add:', elems.length, 'filtred:', filtred.length)

    filtred.forEach(elem=>{
        let find = data.find(a=>a.id == elem.id)

        if(!find){
            data.push({
                id: elem.id,
                season: elem.number_of_seasons,
                episodes: []
            })
        }
    })

    Storage.set('timetable',data)
}

/**
 * Добавить из закладок
 */
function favorites(){
    let category = ['like', 'wath', 'book', 'look', 'viewed', 'scheduled', 'continued', 'thrown']

    category.forEach(a=>{
        add(Favorite.get({type: a}))
    })
}

function filter(episodes){
    let filtred = []
    let fileds  = ['air_date','season_number','episode_number','name','still_path']

    episodes.forEach(episode=>{
        let item = {}

        fileds.forEach(field=>{
            if(typeof episode[field] !== 'undefined') item[field] = episode[field]
        })

        filtred.push(item)
    })

    return filtred
}

/**
 * Парсим карточку
 */
function parse(to_database){
    let check = Favorite.check(object)
    let any   = Favorite.checkAnyNotHistory(check)

    console.log('Timetable', 'parse:', object.id, 'any:', any, 'season:', object.season)

    if(any || to_database){
        TMDB.get('tv/'+object.id+'/season/'+object.season,{},(ep)=>{
            if(!ep.episodes) return save()
            
            object.episodes = filter(ep.episodes)

            Cache.getData('timetable',object.id).then(obj=>{
                if(obj) obj.episodes = object.episodes
                else    obj = Arrays.clone(object)

                Cache.rewriteData('timetable', object.id, obj).then(()=>{}).catch(()=>{})

                Lampa.Listener.send('state:changed', {
                    target: 'timetable',
                    reason: 'parse',
                    id: object.id
                })
            }).catch(e=>{})

            save()
        },save, {life: 60 * 24 * 3})
    }
    else{
        Arrays.remove(data, object)

        Storage.remove('timetable', object.id)

        save()
    }
}

/**
 * Получить карточку для парсинга
 */
function extract(){
    let ids = debug ? data.filter(e=>!e.scaned) : data.filter(e=>!e.scaned && (e.scaned_time || 0) + (60 * 60 * 12 * 1000) < Date.now())

    console.log('Timetable', 'extract:', ids.length, 'total:', data.length)

    if(ids.length){
        object = ids[0]

        parse()
    }
    else{
        data.forEach(a=>a.scaned = 0)
    }

    Storage.set('timetable',data)
}

/**
 * Сохранить состояние
 */
function save(){
    if(object){
        object.scaned = 1
        object.scaned_time = Date.now()

        Storage.set('timetable',data)
    }
}

/**
 * Получить эпизоды для карточки если есть
 * @param {{id:integer}} elem - карточка
 * @returns {array}
 */
function get(elem, callback){
    let fid = data.filter(e=>e.id == elem.id)
    let res = (fid.length ? fid[0] : {}).episodes || []

    if(typeof callback == 'function'){
        if(res.length) return callback(res)

        Cache.getData('timetable',elem.id).then(obj=>{
            callback(obj ? (obj.episodes || []) : [], true)
        }).catch(e=>{
            callback(res, true)
        })
    }
    else{
        return res
    }
}

/**
 * Добавить карточку в парсинг самостоятельно
 * @param {{id:integer,number_of_seasons:integer}} elem - карточка
 */
function update(elem){
    if(elem.number_of_seasons && typeof elem.id == 'number' && (elem.source == 'tmdb' || elem.source == 'cub')){
        let check = Favorite.check(elem)
        let any   = Favorite.checkAnyNotHistory(check)
        let id    = data.filter(a=>a.id == elem.id)
        let item  = {
            id: elem.id,
            season: Utils.countSeasons(elem),
            episodes: []
        }

        TMDB.clear()

        if(any){
            if(!id.length){
                console.log('Timetable', 'push:', elem.id)

                data.push(item)

                Storage.set('timetable',data)

                object = item
            }
            else{
                object = id[0]
                object.season = Utils.countSeasons(elem)
            }

            parse()
        }
        else{
            object = item

            parse(true)
        }
    }
}

/**
 * Получить все данные
 * @returns {[{id:integer,season:integer,episodes:[]}]}
 */
function all(){
    return data
}

function lately(){
    let fav = Favorite.full().card

    if(Account.Permit.sync) fav = Account.Bookmarks.all()

    fav = fav.filter(f=>f.number_of_seasons)

    let now_date = new Date()
        now_date.setHours(0,0,0)

    let now_time = now_date.getTime()
    let cards = []

    data.filter(d=>fav.find(c=>c.id == d.id)).forEach(season=>{
        let episodes = season.episodes.filter(ep=>Lampa.Utils.parseToDate(ep.air_date).getTime() >= now_time)
        
        if(episodes.length){
            cards.push({
                card: Arrays.clone(fav.find(c=>c.id == season.id)),
                episode: episodes[0],
                time: Lampa.Utils.parseToDate(episodes[0].air_date).getTime(),
                season
            })
        }
    })

    cards = cards.sort((a,b)=>{
        if(a.time > b.time) return 1
        else if(a.time < b.time) return -1
        else return 0
    })
    
    return cards
}

export default {
    init,
    get,
    add,
    all,
    update,
    lately
}