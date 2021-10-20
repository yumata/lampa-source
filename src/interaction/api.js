import Reguest from '../utils/reguest'
import Favorite from '../utils/favorite'
import Utils from '../utils/math'
import Arrays from '../utils/arrays'
import Storage from '../utils/storage'

let baseurl = Utils.protocol() + 'api.themoviedb.org/3/'
let baseimg = Utils.protocol() + 'image.tmdb.org/t/p/w300/'
let network = new Reguest()
let key     = '4ef0d7355d9ffb5151e987764708ce96'

function url(u, params = {}){
    u = add(u, 'api_key='+key)
    u = add(u, 'language='+Storage.field('tmdb_lang'))

    if(params.genres)  u = add(u, 'with_genres='+params.genres)
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

function img(src, size){
    let path = baseimg

    if(size) path = path.replace(/w300/g,size)

    return src ? path + src : '';
}

function Status(need){
    this.data = {}
    this.work = 0;

    this.check = function(){
        if(this.work >= need) this.onComplite(this.data)
    }

    this.append = function(name, json){
        this.work++

        this.data[name] = json

        this.check()
    }

    this.error = function(){
        this.work++

        this.check()
    }
}

function main(params = {}, oncomplite, onerror){
    let status = new Status(8)

    status.onComplite = ()=>{
        let fulldata = []

        if(status.data.wath) fulldata.push(status.data.wath)
        if(status.data.trend_day) fulldata.push(status.data.trend_day)
        if(status.data.trend_week) fulldata.push(status.data.trend_week)
        if(status.data.upcoming) fulldata.push(status.data.upcoming)
        if(status.data.popular) fulldata.push(status.data.popular)
        if(status.data.popular_tv) fulldata.push(status.data.popular_tv)
        if(status.data.top) fulldata.push(status.data.top)
        if(status.data.top_tv) fulldata.push(status.data.top_tv)

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get('movie/now_playing',params,(json)=>{
        append('Сейчас смотрят','wath', json)
    },status.error.bind(status))

    get('trending/moviews/day',params,(json)=>{
        append('Сегодня в тренде','trend_day', json)
    },status.error.bind(status))

    get('trending/moviews/week',params,(json)=>{
        append('В тренде за неделю','trend_week', json)
    },status.error.bind(status))

    get('movie/upcoming',params,(json)=>{
        append('Смотрите в кинозалах','upcoming', json)
    },status.error.bind(status))

    get('movie/popular',params,(json)=>{
        append('Популярные фильмы','popular', json)
    },status.error.bind(status))

    get('tv/popular',params,(json)=>{
        append('Популярные сериалы','popular_tv', json)
    },status.error.bind(status))

    get('movie/top_rated',params,(json)=>{
        append('Топ фильмы','top', json)
    },status.error.bind(status))

    get('tv/top_rated',params,(json)=>{
        append('Топ сериалы','top_tv', json)
    },status.error.bind(status))
}

function category(params = {}, oncomplite, onerror){
    let status = new Status(6)

    status.onComplite = ()=>{
        let fulldata = []

        if(status.data.wath && status.data.wath.results.length)      fulldata.push(status.data.wath)
        if(status.data.popular && status.data.popular.results.length)   fulldata.push(status.data.popular)
        if(status.data.new && status.data.new.results.length)   fulldata.push(status.data.new)
        if(status.data.tv_today && status.data.tv_today.results.length)  fulldata.push(status.data.tv_today)
        if(status.data.tv_air && status.data.tv_air.results.length)    fulldata.push(status.data.tv_air)
        if(status.data.top && status.data.top.results.length)       fulldata.push(status.data.top)

        if(fulldata.length) oncomplite(fulldata)
        else onerror()
    }
    
    let append = function(title, name, json){
        json.title = title

        status.append(name, json)
    }

    get(params.url+'/now_playing',params,(json)=>{
        append('Сейчас смотрят','wath', json)
    },status.error.bind(status))

    get(params.url+'/popular',params,(json)=>{
        append('Популярное','popular', json)
    },status.error.bind(status))

    let date = new Date()
    let nparams = Arrays.clone(params)
        nparams.filter = {
            sort_by: 'release_date.desc',
            year: date.getFullYear(),
            first_air_date_year: date.getFullYear(),
            'vote_average.gte': 7
        }

    get('discover/'+params.url,nparams,(json)=>{
        json.filter = nparams.filter

        append('Новинки','new', json)
    },status.error.bind(status))

    get(params.url+'/airing_today',params,(json)=>{
        append('Сегодня в эфире','tv_today', json)
    },status.error.bind(status))

    get(params.url+'/on_the_air',params,(json)=>{
        append('На этой неделе','tv_air', json)
    },status.error.bind(status))

    get(params.url+'/top_rated',params,(json)=>{
        append('В топе','top', json)
    },status.error.bind(status))
}

function full(params = {}, oncomplite, onerror){
    let status = new Status(5)
        status.onComplite = oncomplite

    get(params.method+'/'+params.id,params,(json)=>{
        status.append('movie', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/credits',params,(json)=>{
        status.append('actors', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
        status.append('recomend', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/similar',params,(json)=>{
        status.append('simular', json)
    },status.error.bind(status))

    get(params.method+'/'+params.id+'/videos',params,(json)=>{
        status.append('videos', json)
    },status.error.bind(status))
}

function categoryFull(params = {}, oncomplite, onerror){
    let u = url(params.url, params)

    network.silent(u,oncomplite, onerror)
}

function get(method, params = {}, oncomplite, onerror){
    let u = url(method, params)
    
    network.silent(u,(json)=>{
        json.url = method

        oncomplite(json)
    }, onerror)
}

function search(params = {}, oncomplite, onerror){
    let status = new Status(2)
        status.onComplite = oncomplite

    get('search/movie',params,(json)=>{
        json.title = 'Фильмы'

        status.append('movie', json)
    },status.error.bind(status))

    get('search/tv',params,(json)=>{
        json.title = 'Сериалы'

        status.append('tv', json)
    },status.error.bind(status))
}

function searchFilter(find, params = {}){
    let finded

    let filter = (items)=>{
        for(let i = 0; i < items.length; i++){
            let item = items[i]

            if(params.original_title == item.original_title){
                finded = item; break;
            }
        }
    }

    if(find.movie && find.movie.results.length)      filter(find.movie.results)
    if(find.tv && find.tv.results.length && !finded) filter(find.tv.results)

    return finded
}

function actor(params = {}, oncomplite, onerror){
    let convert = (json)=>{
        let results = json.cast.map((a)=>{
            a.year = parseInt((a.release_date || a.first_air_date || '0000').slice(0,4))

            return a
        })

        results.sort((a,b) => b.year - a.year)

        return {
            results: results.slice(0,40)
        }
    }

    let status = new Status(3)
        status.onComplite = ()=>{
            let fulldata = {}

            if(status.data.actor) fulldata.actor = status.data.actor

            if(status.data.movie && status.data.movie.cast.length) fulldata.movie = convert(status.data.movie)
            if(status.data.tv && status.data.tv.cast.length)       fulldata.tv = convert(status.data.tv)

            oncomplite(fulldata)
        }

    get('person/'+params.id,params,(json)=>{
        status.append('actor', json)
    },status.error.bind(status))

    get('person/'+params.id+'/movie_credits',params,(json)=>{
        status.append('movie', json)
    },status.error.bind(status))

    get('person/'+params.id+'/tv_credits',params,(json)=>{
        status.append('tv', json)
    },status.error.bind(status))
}

function favorite(params = {}, oncomplite, onerror){
    let data = {}

    data.results = Favorite.get(params)

    data.total_pages = Math.ceil(data.results.length / 20)
    data.page = Math.min(params.page, data.total_pages)

    let offset = data.page - 1

    data.results = data.results.slice(20 * offset,20 * offset + 20)

    if(data.results.length) oncomplite(data)
    else onerror()
}

function genres(params = {}, oncomplite, onerror){
    let u = url('genre/movie/list',params)

    network.silent(u,oncomplite, onerror)
}

function company(params = {}, oncomplite, onerror){
    let u = url('company/'+params.id,params)

    network.silent(u,oncomplite, onerror)
}

function loadSeasons(tv, seasons, oncomplite){
    let status = new Status(seasons.length)
        status.onComplite = oncomplite

    seasons.forEach(season => {
        get('tv/'+tv.id+'/season/'+season,{},(json)=>{
            status.append(''+season, json)
        },status.error.bind(status))
    })
}

function screensavers(oncomplite, onerror) {
    get('trending/all/week', {page: Math.round(Math.random() * 30)}, (json) => {
        oncomplite(json.results.filter(entry => entry.backdrop_path));
    }, onerror)
}

function relise(oncomplite, onerror){
    network.native('https://ndr.neocities.org/ndr.html',(str)=>{
        let math  = str.replace(/\n|\r/g,'').match(new RegExp('data-releaseDate[^>]+>(.*?)<\/div>[ ]+<div class="block2','g'))
        let items = []

        if(math){
            math.slice(1).forEach(element => {
                element = element.replace(/<img/g,'<imb')

                let voite = element.match(/>([0-9|.]+)/)
                let div   = $('<div ' + element.replace('<div class="block2','')),
                    item  = {}

                    item.title          = $('.moviename',div).text()
                    item.original_title = $('[itemprop="alternativeHeadline"]',div).text()
                    item.release_date   = div.attr('data-releasedate')
                    item.poster         = $('[itemprop="image"]',div).attr('src')
                    item.vote_average   = voite ? parseFloat(voite[1]) : 0

                items.push(item)
            })
        }

        oncomplite(items)
    }, onerror, false, {dataType: 'text'})
}

function collections(params, oncomplite, onerror){
    let from = 20 * (params.page - 1),
        to   = from + 19

    if(params.source == 'ivi'){
        let uri = 'https://api.ivi.ru/mobileapi/collections/v5/?app_version=870&from='+from+'&tags_exclude=goodmovies&to='+to

        if(params.id) uri = 'https://api.ivi.ru/mobileapi/collection/catalog/v5/?id='+params.id+'&withpreorderable=true&fake=false&from='+from+'&to='+to+'&sort=priority_in_collection&fields=id%2Civi_pseudo_release_date%2Corig_title%2Ctitle%2Cfake%2Cpreorderable%2Cavailable_in_countries%2Chru%2Cposter_originals%2Crating%2Ccontent_paid_types%2Ccompilation_hru%2Ckind%2Cadditional_data%2Crestrict%2Chd_available%2Chd_available_all%2C3d_available%2C3d_available_all%2Cuhd_available%2Cuhd_available_all%2Chdr10_available%2Chdr10_available_all%2Cdv_available%2Cdv_available_all%2Cfullhd_available%2Cfullhd_available_all%2Chdr10plus_available%2Chdr10plus_available_all%2Chas_5_1%2Cshields%2Cseasons_count%2Cseasons_content_total%2Cseasons%2Cepisodes%2Cseasons_description%2Civi_rating_10_count%2Cseasons_extra_info%2Ccount%2Cgenres%2Cyears%2Civi_rating_10%2Crating%2Ccountry%2Cduration_minutes%2Cyear&app_version=870'

        network.native(uri,(json)=>{
            let items = []

            if(json.result){
                json.result.forEach(element => {
                    let item = {
                        id: element.id,
                        url: element.hru,
                        title: element.title,
                        poster: element.images && element.images.length ? element.images[0].path : 'https://www.ivi.ru/images/stubs/collection_preview_stub.jpeg'
                    }

                    if(params.url){
                        item.original_title = element.orig_title
                        item.release_date   = element.ivi_pseudo_release_date
                        item.vote_average   = element.ivi_rating_10
                        item.poster         = element.poster_originals && element.poster_originals[0] ? element.poster_originals[0].path + '/300x456/' : ''
                    }

                    items.push(item)
                })
            }

            oncomplite(items)
        }, onerror)
    }
    else if(params.source == 'okko'){
        let uri = 'https://ctx.playfamily.ru/screenapi/v1/noauth/collection/web/1?elementAlias='+(params.url || 'collections_web')+'&elementType=COLLECTION&limit=20&offset='+from+'&withInnerCollections=true&includeProductsForUpsale=false&filter=%7B%22sortType%22%3A%22RANK%22%2C%22sortOrder%22%3A%22ASC%22%2C%22useSvodFilter%22%3Afalse%2C%22genres%22%3A%5B%5D%2C%22yearsRange%22%3Anull%2C%22rating%22%3Anull%7D'
        
        let findPoster = (images)=>{
            for (let index = 0; index < images.length; index++) {
                const img = images[index];
                
                if(img.imageType == 'PORTRAIT') return img.url
            }

            return ''
        }
        network.native(uri,(json)=>{
            let items = []

            if(json.element){
                json.element.collectionItems.items.forEach(elem => {
                    let element = elem.element
                    let item = {
                        url: element.alias,
                        title: element.name,
                        poster: element.basicCovers && element.basicCovers.items.length ? element.basicCovers.items[0].url + '?width=300&scale=1&quality=80&mediaType=jpeg' : 'https://www.ivi.ru/images/stubs/collection_preview_stub.jpeg'
                    }

                    if(params.url){
                        item.original_title = element.originalName
                        item.release_date   = '0000'
                        item.vote_average   = 0
                        item.poster         = element.basicCovers && element.basicCovers.items.length ? (findPoster(element.basicCovers.items) || element.basicCovers.items[0].url) + '?width=300&scale=1&quality=80&mediaType=jpeg' : ''
                    }

                    items.push(item)
                })
            }

            oncomplite(items)
        }, onerror)
    }
    else onerror()
}

function clear(){
    network.clear()
}

export default {
    main,
    img,
    full,
    categoryFull,
    genres,
    category,
    search,
    clear,
    company,
    actor,
    favorite,
    loadSeasons,
    screensavers,
    relise,
    collections,
    searchFilter
}