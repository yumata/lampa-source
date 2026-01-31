import Select from '../select'
import Controller from '../../core/controller'
import Activity from '../activity/activity'
import Lang from '../../core/lang'
import Storage from '../../core/storage/storage'
import Permit from '../../core/account/permit'
import data from './data'

/**
 * Главное меню фильтрации
 */
function main(){
    for(var i in data) selected(data[i])

    let cat  = data.type.items.find(s=>s.selected).cat
    let type = cat.indexOf('movie') >= 0 ? 'movie' : 'tv'

    let items = [{
        title: Lang.translate('search_start'),
        search: true
    },data.type,data.rating,data['genres_'+type],data.language,data.year]

    if(Storage.field('source') == 'cub') items.push(data.pgrating,data.sort,data.quality)

    items.forEach(itm=>{
        itm.title = Lang.translate(itm.title)

        if(itm.subtitle) itm.subtitle = Lang.translate(itm.subtitle)

        if(itm.items){
            itm.items.forEach(inr=>{
                inr.title = Lang.translate(inr.title)
            })
        }
    })

    Select.show({
        title: Lang.translate('title_filter'),
        items: items,
        onBack: ()=>{
            Controller.toggle('content')
        },
        onSelect: (a)=>{
            if(a.search) search()
            else submenu(a)
        }
    })
}

/**
 * Запрос для TMDB
 * @returns {string} - строка запроса
 */
function queryForTMDB(){
    let query    = []
    let cat      = data.type.items.find(s=>s.selected).cat
    let type     = cat.indexOf('movie') >= 0 ? 'movie' : 'tv'
    let genres   = []
    let languages = []

    data.rating.items.forEach(a=>{
        if(a.selected && (a.voite || a.start)){
            if(a.start){
                query.push('vote_average.gte='+a.start)
            }
            else{
                query.push('vote_average.gte='+a.voite.split('-')[0])
                query.push('vote_average.lte='+a.voite.split('-')[1])
            }
        }
    })

    data.language.items.forEach(a=>{
        if(a.checked) languages.push(a.code)
    })

    data.year.items.forEach(a=>{
        if(a.selected && !a.any){
            let need = type == 'movie' ? 'primary_release_date' : 'first_air_date'

            if(a.title.indexOf('-') >= 0){
                query.push(need+'.lte='+a.title.split('-')[0]+'-12-31')
                query.push(need+'.gte='+a.title.split('-')[1]+'-01-01')
            }
            else{
                query.push((type == 'movie' ? 'primary_release_year' : 'first_air_date_year') + '=' + a.title)
            }
        }
    })

    data['genres_'+type].items.forEach(a=>{
        if(a.checked)  genres.push(a.id)
    })

    if(cat == 'multmovie' || cat == 'multtv' && genres.indexOf(16) == -1) genres.push(16)
    
    if(cat == 'movie' || cat == 'tv') query.push('without_genres=16')

    if(genres.length){
        query.push('with_genres='+genres.join(','))
    }

    if(cat == 'anime' && languages.indexOf('ja') == -1) languages.push('ja')

    if(languages.length){
        query.push('with_original_language='+languages.join('|'))
    }

    return 'discover/' + type + '?' + query.join('&')
}

/**
 * Запрос для CUB
 * @returns {string} - строка запроса
 */
function queryForCUB(){
    let query    = []
    let cat      = data.type.items.find(s=>s.selected).cat
    let type     = cat.indexOf('movie') >= 0 ? 'movie' : 'tv'
    let genres   = []
    let sort     = data.sort.items.find(s=>s.selected && s.sort)
    let quality  = data.quality.items.find(s=>s.selected && s.uhd)
    let languages = []

    data.rating.items.forEach(a=>{
        if(a.selected && (a.voite || a.start)){
            if(a.start){
                query.push('vote='+a.start)
            }
            else{
                query.push('vote='+a.voite.split('-')[0]+'-'+a.voite.split('-')[1])
            }
        }
    })

    data.language.items.forEach(a=>{
        if(a.checked) languages.push(a.code.split('|')[0])
    })

    data.year.items.forEach(a=>{
        if(a.selected && !a.any){
            if(a.title.indexOf('-') >= 0){
                query.push('airdate='+a.title.split('-')[1]+'-'+a.title.split('-')[0])
            }
            else{
                query.push('airdate='+a.title)
            }
        }
    })

    data.pgrating.items.forEach(a=>{
        if(a.selected){
            if(a.title.indexOf('-') >= 0){
                query.push('pgrating='+a.pg.split('-')[0]+'-'+a.pg.split('-')[1])
            }
            else{
                query.push('pgrating='+a.pg)
            }
        }
    })

    data['genres_'+type].items.forEach(a=>{
        if(a.checked)  genres.push(a.id)
    })

    if((cat == 'multmovie' || cat == 'multtv' || Permit.child_small) && genres.indexOf(16) == -1) genres.push(16)

    if((cat == 'movie' || cat == 'tv') && !Permit.child_small) query.push('without_genres=16')

    if(genres.length){
        query.push('genre='+genres.join(','))
    }

    if(cat == 'anime') type = 'anime'

    if(languages.length){
        query.push('language='+languages.join(','))
    }

    if(sort) query.push('sort='+sort.sort)

    if(quality) query.push('uhd=true')

    return '?cat=' + type + '&' + query.join('&')
}

/**
 * Запуск поиска
 */
function search(){
    Controller.toggle('content')

    let source = Storage.field('source')
    let query  = source == 'cub' ? queryForCUB() : queryForTMDB()

    let activity = {
        url: query,
        title: Lang.translate('title_filter'),
        component: 'category_full',
        source: source == 'cub' ? 'cub' : 'tmdb',
        card_type: true,
        page: 1
    }

    let object = Activity.active()

    if(object.component == 'category_full' && (object.url.indexOf('discover') == 0 || object.url.indexOf('?cat=') == 0)) Activity.replace(activity, true)
    else Activity.push(activity)
}

/**
 * Выбор элемента
 * @param {Array} where - массив элементов
 * @param {Object} a - выбранный элемент
 */
function select(where, a){
    where.forEach(element => {
        element.selected = false
    })

    a.selected = true
}

/**
 * Обновление подзаголовка
 * @param {Object} where - объект с массивом items
 */
function selected(where){
    let title = []

    where.items.forEach((a)=>{
        if(a.selected || a.checked) title.push(a.title)
    })

    where.subtitle = title.length ? title.join(', ') : Lang.translate('nochoice')
}

/**
 * Подменю
 * @param {Object} item - объект элемента
 */
function submenu(item){
    Select.show({
        title: item.title,
        items: item.items,
        onBack: main,
        onSelect: (a)=>{
            select(item.items, a)

            main()
        }
    })
}

/**
 * Запуск фильтра
 */
function show(){
    main()
}

export default {
    show
}