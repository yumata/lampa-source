import Reguest from '../reguest'
import Utils from '../math'
import Storage from '../storage'
import Status from '../status'
import Favorite from '../../utils/favorite'
import Recomends from '../../utils/recomend'
import Arrays from '../../utils/arrays'
import VideoQuality from '../video_quality'
import Lang from '../lang'
import TMDB from './tmdb'
import TMDBApi from '../tmdb'

let baseurl   = Utils.protocol() + 'tmdb.cub.watch/'
let network   = new Reguest()

function url(u, params = {}){
    if(params.genres)  u = add(u, 'genre='+params.genres)
    if(params.page)    u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)

    if(params.filter){
        for(let i in params.filter){
            u = add(u, i+'='+params.filter[i])
        }
    }

    return baseurl + u
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
}

function get(method, params = {}, oncomplite, onerror){
    let u = url(method, params)
    
    network.silent(u,(json)=>{
        json.url = method

        oncomplite(json)
    }, onerror)
}

function list(params = {}, oncomplite, onerror){
    let u = url(params.url, params)

    network.silent(u,oncomplite, onerror)
}

function main(params = {}, oncomplite, onerror){
    let status = new Status(11)

    status.onComplite = ()=>{
        let fulldata = []
        let data     = status.data

        for(let i = 1; i <= 11; i++){
            let ipx = 's'+i

            if(data[ipx] && data[ipx].results.length) fulldata.push(data[ipx])
        }

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get('?sort=now_playing',params,(json)=>{
        append(Lang.translate('title_now_watch'),'s1', json)

        VideoQuality.add(json.results)
    },status.error.bind(status))

    get('?sort=latest',params,(json)=>{
        append(Lang.translate('title_latest'),'s2', json)
    },status.error.bind(status))

    get('movie/now',params,(json)=>{
        append(Lang.translate('menu_movies'),'s3', json)
    },status.error.bind(status))

    get('?sort=now&genre=16',params,(json)=>{
        append(Lang.translate('menu_multmovie'),'s4', json)
    },status.error.bind(status))

    get('tv/now',params,(json)=>{
        append(Lang.translate('menu_tv'),'s5', json)
    },status.error.bind(status))

    get('?sort=now&genre=12',params,(json)=>{
        append(Lang.translate('filter_genre_ad'),'s6', json)
    },status.error.bind(status))

    get('?sort=now&genre=35',params,(json)=>{
        append(Lang.translate('filter_genre_cm'),'s7', json)
    },status.error.bind(status))

    get('?sort=now&genre=10751',params,(json)=>{
        append(Lang.translate('filter_genre_fm'),'s8', json)
    },status.error.bind(status))

    get('?sort=now&genre=27',params,(json)=>{
        append(Lang.translate('filter_genre_ho'),'s9', json)
    },status.error.bind(status))

    get('?sort=now&genre=878',params,(json)=>{
        append(Lang.translate('filter_genre_fa'),'s10', json)
    },status.error.bind(status))

    get('?sort=now&genre=53',params,(json)=>{
        append(Lang.translate('filter_genre_tr'),'s11', json)
    },status.error.bind(status))
}

function category(params = {}, oncomplite, onerror){
    let total = 6

    if(params.url !== 'tv') total--

    let show     = ['tv','movie'].indexOf(params.url) > -1
    let books    = show ? Favorite.continues(params.url) : []
    let recomend = show ? Arrays.shuffle(Recomends.get(params.url)).slice(0,19) : []

    let status = new Status(total)

    status.onComplite = ()=>{
        let fulldata = []
        let data     = status.data

        if(books.length)    fulldata.push({results: books, title: params.url == 'tv' ? Lang.translate('title_continue') : Lang.translate('title_watched')})
        if(recomend.length) fulldata.push({results: recomend, title: Lang.translate('title_recomend_watch')})

        for(let i = 1; i <= total+1; i++){
            let ipx = 's'+i

            if(data[ipx] && data[ipx].results.length) fulldata.push(data[ipx])
        }

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get('?cat='+params.url+'&sort=now_playing',params,(json)=>{
        append(Lang.translate('title_now_watch'),'s1', json)

        if(show) VideoQuality.add(json.results)
    },status.error.bind(status))

    if(params.url == 'tv'){
        get('?cat='+params.url+'&sort=update',params,(json)=>{
            append(Lang.translate('title_new_episodes'),'s2', json)
        },status.error.bind(status))
    }

    get('?cat='+params.url+'&sort=top',params,(json)=>{
        append(Lang.translate('title_popular'),'s3', json)

        if(show) VideoQuality.add(json.results)
    },status.error.bind(status))

    get('?cat='+params.url+'&sort=latest',params,(json)=>{
        append(Lang.translate('title_latest'),'s4', json)
    },status.error.bind(status))

    get('?cat='+params.url+'&sort=now',params,(json)=>{
        append(Lang.translate('title_new_this_year'),'s5', json)
    },status.error.bind(status))

    get('?cat='+params.url+'&sort=latest&vote=7',params,(json)=>{
        append(Lang.translate('title_hight_voite'),'s6', json)
    },status.error.bind(status))
}

function full(params, oncomplite, onerror){
    let status = new Status(7)
        status.onComplite = oncomplite

    get('3/'+params.method+'/'+params.id+'?api_key='+TMDBApi.key()+'&append_to_response=content_ratings,release_dates&language='+Storage.field('tmdb_lang'),params,(json)=>{
        json.source = 'tmdb'

        if(params.method == 'tv'){
            let season = Utils.countSeasons(json)

            TMDB.get('tv/'+json.id+'/season/'+season,{},(ep)=>{
                status.append('episodes', ep)
            },status.error.bind(status))
        }
        else status.need--

        if(json.belongs_to_collection){
            TMDB.get('collection/'+json.belongs_to_collection.id,{},(collection)=>{
                collection.results = collection.parts.slice(0,19)

                status.append('collection', collection)
            },status.error.bind(status))
        }
        else status.need--

        status.append('movie', json)
    },()=>{
        status.need -= 2

        status.error()
    })

    if(Storage.field('light_version')){
        status.need -= 3
    }
    else{
        TMDB.get(params.method+'/'+params.id+'/credits',params,(json)=>{
            status.append('persons', json)
        },status.error.bind(status))

        TMDB.get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
            status.append('recomend', json)
        },status.error.bind(status))

        TMDB.get(params.method+'/'+params.id+'/similar',params,(json)=>{
            status.append('simular', json)
        },status.error.bind(status))
    }

    TMDB.get(params.method+'/'+params.id+'/videos',params,(json)=>{
        status.append('videos', json)
    },status.error.bind(status))
}

function menuCategory(params, oncomplite){
    let menu = []

    menu.push({
        title: Lang.translate('title_now_watch'),
        url: '?cat='+params.action+'&sort=now_playing'
    })

    if(params.action == 'tv'){
        menu.push({
            title: Lang.translate('title_new_episodes'),
            url: '?cat='+params.action+'&sort=update'
        })
    }

    menu.push({
        title: Lang.translate('title_popular'),
        url: '?cat='+params.action+'&sort=top'
    })

    menu.push({
        title: Lang.translate('title_latest'),
        url: '?cat='+params.action+'&sort=latest'
    })

    menu.push({
        title: Lang.translate('title_new_this_year'),
        url: '?cat='+params.action+'&sort=now'
    })

    menu.push({
        title: Lang.translate('title_hight_voite'),
        url: '?cat='+params.action+'&sort=latest&vote=7'
    })

    oncomplite(menu)
}

function search(params = {}, oncomplite){
    let status = new Status(2)
        status.onComplite = (data)=>{
            let items = []

            for(let i in data){
                let item = data[i]

                if(item.results.length) items.push(item)
            }

            oncomplite(items)
        }

    get('search/movie',params,(json)=>{
        json.title = Lang.translate('menu_movies')

        status.append('movie', json)
    },status.error.bind(status))

    get('search/tv',params,(json)=>{
        json.title = Lang.translate('menu_tv')

        status.append('tv', json)
    },status.error.bind(status))
}

function discovery(){
    return {
        title: 'CUB',
        search: search,
        params: {
            align_left: true,
            object: {
                source: 'cub'
            }
        },
        onMore: (params)=>{
            Activity.push({
                url: 'search/' + params.data.type,
                title: Lang.translate('search') + ' - ' + params.query,
                component: 'category_full',
                page: 2,
                query: encodeURIComponent(params.query),
                source: 'cub'
            })
        },
        onCancel: network.clear.bind(network)
    }
}

function person(params, oncomplite, onerror){
    TMDB.person(params, oncomplite, onerror)
}

function menu(params, oncomplite){
    TMDB.menu(params, oncomplite)
}

function seasons(tv, from, oncomplite){
    TMDB.seasons(tv, from, oncomplite)
}

function clear(){
    network.clear()
}

export default {
    main,
    menu,
    full,
    list,
    category,
    clear,
    person,
    seasons,
    menuCategory
}
