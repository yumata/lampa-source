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

let time_favorites = 1000 * 60 * 10
let time_extract   = 1000 * 30
let time_season    = 1000 * 60 * 60 * 24 * 7 // 7 дней

/**
 * Запуск
 */
function init(){
    data = Storage.cache('timetable',limit,[])

    Timer.add(time_favorites, favorites)
    Timer.add(time_extract, extract)

    // Добавляем поле ssn для хранения времени обновления сезонов
    data.forEach(a=>{a.ssn = a.ssn || 0})

    // Обнуляем эпизоды, будем подгружать из db
    data.forEach(a=>{a.episodes = []})

    Lampa.Listener.follow('state:changed', (e)=>{
        if(e.target == 'favorite' && e.reason == 'update' && (e.method == 'add' || e.method == 'added') && e.type !== 'history'){
            console.log('Timetable', 'favorite changed:', e.reason, e.type, e.card.id)

            if(e.card.original_name && (e.card.source == 'tmdb' || e.card.source == 'cub')) update(e.card)
        }
    })

    Favorite.listener.follow('remove',(e)=>{
        if(e.card.original_name && e.method == 'id'){
            let find = data.find(a=>a.id == e.card.id)

            if(find){
                Arrays.remove(data,find)

                saveData()

                Storage.remove('timetable', find.id)
            }
        }
    })

    Lampa.Listener.follow('worker_storage',(e)=>{
        if(e.type == 'insert' && e.name == 'timetable'){
            data = Storage.get('timetable','[]')
        } 
    })

    // Начальный импорт из закладок
    favorites()

    loadEpisodes()

    ContentRows.add({
        index: 1,
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
 * Загрузить эпизоды из кеша
 * @returns {void}
 */
function loadEpisodes(){
    Cache.getData('timetable').then(all_data=>{
        if(all_data){
            all_data.forEach(obj=>{
                let find = data.find(d=>d.id == obj.id)
                if(find) find.episodes = obj.episodes || []
            })

            console.log('Timetable', 'load episodes from cache:', all_data.length)
        }
    }).catch(e=>{
        console.log('Timetable', 'load episodes from cache error:', e.message)
    })
}

/**
 * Добавить карточки к парсингу
 * @param {[{id:integer,number_of_seasons:integer}]} elems - карточки
 */
function add(elems, log_type){
    let filtred = elems.filter(elem=>elem.original_name && typeof elem.id == 'number' && (elem.source == 'tmdb' || elem.source == 'cub'))

    console.log('Timetable', 'add:', elems.length, 'filtred:', filtred.length, 'type:', log_type || 'unknown')

    filtred.forEach(elem=>{
        let find = data.find(a=>a.id == elem.id)

        if(!find){
            data.push({
                id: elem.id,
                season: elem.number_of_seasons || 0,
                episodes: [],
                ssn: 0
            })
        }
    })

    saveData()
}

/**
 * Сохранить данные без эпизодов
 * @returns {void}
 */
function saveData(){
    let clear_data = Arrays.clone(data)
        clear_data.forEach(a=>{a.episodes = []})

    Storage.set('timetable', clear_data)
}

/**
 * Добавить из закладок
 */
function favorites(){
    let category = ['like', 'wath', 'book', 'look', 'viewed', 'scheduled', 'continued']

    category.forEach(a=>{
        add(Favorite.get({type: a}), a)
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

    if(any || to_database){
        // Если нет сезонов или давно не обновляли количество сезонов
        if(!object.season || Date.now() - object.ssn > time_season){
            console.log('Timetable', 'parse:', object.id, 'old season:', object.season)

            TMDB.get('tv/'+object.id, {}, (json)=>{
                object.season = Utils.countSeasons(json) || 1
                object.ssn    = Date.now()

                parse(to_database)
            }, save, {life: 60 * 24 * 3})
        }
        else{
            console.log('Timetable', 'parse:', object.id, 'new season:', object.season)

            TMDB.get('tv/'+object.id+'/season/'+object.season,{},(ep)=>{
                if(!ep.episodes) return save()
                
                object.episodes = filter(ep.episodes)
                object.next     = getNextEpisode(object.episodes)

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
    }
    else{
        console.log('Timetable', 'remove:', object.id, 'not in favorites anymore')

        Arrays.remove(data, object)

        Storage.remove('timetable', object.id)

        save()
    }
}

/**
 * Получить следующий эпизод из списка
 * @param {[{air_date:string}]} episodes - эпизоды
 * @returns {object|boolean}
 */
function getNextEpisode(episodes){
    let now_date = new Date()
        now_date.setHours(0,0,0)

    let now_time = now_date.getTime()
    let now_year = now_date.getFullYear()
    let nxt_year = now_year + 1

    let any = episodes.filter(ep=>{
        if(ep.air_date){
            if(ep.air_date.indexOf(now_year) === 0 || ep.air_date.indexOf(nxt_year) === 0){
                return Lampa.Utils.parseToDate(ep.air_date).getTime() >= now_time
            }
        }
    })

    return any.length ? any[0] : false
}

/**
 * Получить карточку для парсинга
 */
function extract(){
    let ids = data.filter(e=>!e.scaned)

    console.log('Timetable', 'extract:', ids.length, 'total:', data.length)

    if(ids.length){
        object = ids[0]

        parse()
    }
    else{
        data.forEach(a=>a.scaned = 0)
    }

    saveData()
}

/**
 * Сохранить состояние
 */
function save(){
    if(object){
        object.scaned = 1
        object.scaned_time = Date.now()

        saveData()
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
    if(elem.original_name && typeof elem.id == 'number' && (elem.source == 'tmdb' || elem.source == 'cub')){
        let check = Favorite.check(elem)
        let any   = Favorite.checkAnyNotHistory(check)
        let id    = data.filter(a=>a.id == elem.id)
        let item  = {
            id: elem.id,
            season: elem.number_of_seasons ? Utils.countSeasons(elem) : 0,
            episodes: [],
            ssn: Date.now()
        }

        if(any){
            if(!id.length){
                console.log('Timetable', 'push:', elem.id)

                data.push(item)

                saveData()

                object = item
            }
            else{
                object = id[0]
                object.season = elem.number_of_seasons ? Utils.countSeasons(elem) : object.season || 0
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

    fav = fav.filter(f=>f.original_name && (f.source == 'tmdb' || f.source == 'cub'))

    let cards = []

    data.filter(d=>fav.find(c=>c.id == d.id)).forEach(season=>{
        let episode = season.episodes.length ? getNextEpisode(season.episodes) : season.next
        
        if(episode){
            // Проверка season.next на актуальность
            if(Lampa.Utils.parseToDate(episode.air_date).getTime() >= Date.now()){
                cards.push({
                    card: Arrays.clone(fav.find(c=>c.id == season.id)),
                    episode: episode,
                    time: Lampa.Utils.parseToDate(episode.air_date).getTime(),
                    season
                })
            }
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