import Reguest from '../../../utils/reguest'
import Utils from '../../../utils/utils'
import Storage from '../../storage/storage'
import Status from '../../../utils/status'
import Arrays from '../../../utils/arrays'
import Lang from '../../lang'
import TMDB from './tmdb'
import TMDBApi from '../../tmdb/tmdb'
import Activity from '../../../interaction/activity/activity'
import Api from '../api'
import Manifest from '../../manifest'
import Template from '../../../interaction/template'
import LineModule from '../../../interaction/items/line/module/module'
import ContentRows from '../../content_rows'
import Permit from '../../account/permit'

let network = new Reguest()
let day     = 60 * 24
let source  = 'cub'

function url(u, params = {}){
    if(params.genres && u.indexOf('genre') == -1)  u = add(u, 'genre='+params.genres)
    if(params.page)    u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)

    if(params.filter){
        for(let i in params.filter){
            u = add(u, i+'='+params.filter[i])
        }
    }

    let email = Storage.get('account','{}').email || ''

    return Utils.addUrlComponent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/' + u, 'email=' + encodeURIComponent(email))
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
}

function get(method, params = {}, oncomplite, onerror, cache = false){
    let u = url(method, params)
    
    network.silent(u,(json)=>{
        json.url = method
        json.source = source

        oncomplite(Utils.addSource(json, source))
    }, onerror, false, {
        cache: cache
    })
}

function list(params = {}, oncomplite, onerror){
    let u = url(params.url, params)

    network.silent(u, (data)=>{
        oncomplite(Utils.addSource(data, source))
    }, onerror, false, {
        cache: {life: day * 2}
    })
}

function main(params = {}, oncomplite, onerror){
    let parts_limit = 6
    let genres      = {genres: 16}
    let parts_data  = [
        (call)=>{
            get('?sort=now_playing',genres,(json)=>{
                json.title = Lang.translate('title_now_watch')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            get('?sort=latest',genres,(json)=>{
                json.title = Lang.translate('title_latest')

                call(json)
            },call, {life: day * 2})
        }
    ]

    ContentRows.call('main', params, parts_data)

    let companys = [
        {id: 3, title: 'Pixar'},
        {id: 6125, title: 'Walt Disney'},
        {id: 6704, title: 'Illumination'},
        {id: 521, title: 'DreamWorks'}
    ]

    companys.forEach(company=>{
        let event = (call)=>{
            TMDB.get('discover/movie?sort_by=vote_count.desc&with_companies='+company.id,genres,(json)=>{
                json.title = company.title

                call(json)
            },call, {life: day * 2})
        }

        parts_data.push(event)
    })

    let start_shuffle = parts_data.length + 2

    Arrays.insert(parts_data, 0, Api.partKeywords(parts_data, 'movie', start_shuffle, [], genres))
    Arrays.insert(parts_data, 0, Api.partKeywords(parts_data, 'tv', start_shuffle, [], genres))

    function loadPart(partLoaded, partEmpty){
        Api.partNext(parts_data, parts_limit, partLoaded, partEmpty)
    }

    loadPart(oncomplite, onerror)

    return loadPart
}

function category(params = {}, oncomplite, onerror){
    let fullcat  = !(params.genres || params.keywords)
    let airdate  = params.url == 'anime' ? '&airdate=' + (new Date()).getFullYear() : ''
    let years    = [2000, 2010, 2015]

    params.genres = params.genres ? params.genres + (params.genres == '16' ? '' : ',16') : '16'
    
    let parts_limit = 6
    let parts_data  = [
        (call)=>{
            get('?cat='+params.url+'&sort=now_playing'+airdate,params,(json)=>{
                json.title = Lang.translate('title_now_watch')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            if(params.url == 'anime'){
                get('?cat='+params.url+'&sort=top',params,(json)=>{
                    json.title = Lang.translate('title_in_top')

                    json.results.forEach(card=>{
                        card.params = {
                            style: {
                                name: 'wide',
                            }
                        }
                    })

                    json.params = {
                        items: {
                            view: 3
                        }
                    }
    
                    call(json)
                },call, {life: day * 7})
            }
            else{
                get('?cat='+params.url+'&sort=latest&uhd=true'+airdate,params,(json)=>{
                    json.title = Lang.translate('title_in_high_quality')

                    json.results.forEach(card=>{
                        card.params = {
                            style: {
                                name: 'wide',
                            }
                        }
                    })

                    json.params = {
                        items: {
                            view: 3
                        }
                    }

                    call(json)
                },call, {life: day * 3})
            }
        },
        (call)=>{
            if(params.url == 'tv' || params.url == 'anime'){
                get('?cat='+params.url+'&sort=airing'+airdate,params,(json)=>{
                    json.title = Lang.translate('title_ongoing')

                    call(json)
                },call, {life: day * 2})
            }
            else call()
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top'+airdate,params,(json)=>{
                json.title = Lang.translate('title_popular')

                call(json)
            },call, {life: day * 3})
        },
        (call)=>{
            get('?cat='+params.url+'&sort=now&airdate=' + (new Date()).getFullYear(),params,(json)=>{
                json.title = Lang.translate('title_new_this_year')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top&airdate=' + (new Date().getFullYear() - 1),params,(json)=>{
                json.title = Lang.translate('title_last_year')

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top&airdate=' + (new Date().getFullYear() - 7) + '-' + (new Date().getFullYear() - 2) + '&vote=6-8',params,(json)=>{
                json.title = Lang.translate('title_worth_rewatch')

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top&airdate=' + (new Date().getFullYear() - 7) + '-' + (new Date().getFullYear() - 2) + '&vote=8-10',params,(json)=>{
                json.title        = Lang.translate('title_hight_voite')
                json.icon_svg     = Template.string('icon_star')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#212121'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        }
    ]


    ContentRows.call('category', params, parts_data)

    let start_shuffle = parts_data.length + 2

    Arrays.insert(parts_data, 0, Api.partKeywords(parts_data, params.url, start_shuffle, [], params))
    
    if(TMDB.genres[params.url] && fullcat){
        TMDB.genres[params.url].filter(a=>!(a.id == 10763 || a.id == 10767)).forEach(genre=>{
            let event = (call)=>{
                get('?cat='+params.url+'&sort=top&genre='+genre.id+',16',params,(json)=>{
                    json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                    call(json)
                },call, {life: day * 7})
            }

            parts_data.push(event)
        })
    }

    years.forEach(year=>{
        let eventYear = (call)=>{
            get('?cat='+params.url+'&sort=top&airdate='+year+'-'+(year + 5),params,(json)=>{
                json.title = Lang.translate('title_best_of_' + year)

                call(json)
            },call, {life: day * 7})
        }

        parts_data.push(eventYear)
        
        let eventComedy = (call)=>{
            get('?cat='+params.url+'&sort=top&airdate='+year+'-'+(year + 5)+'&genre=35',params,(json)=>{
                json.title = Lang.translate('title_comedy_of_' + year)

                call(json)
            },call, {life: day * 7})
        }

        if(fullcat) parts_data.push(eventComedy)
    })

    Arrays.shuffleArrayFromIndex(parts_data, start_shuffle)

    function loadPart(partLoaded, partEmpty){
        Api.partNext(parts_data, parts_limit, partLoaded, partEmpty)
    }

    loadPart(oncomplite, onerror)

    return loadPart
}


function menu(params, oncomplite){
    TMDB.menu(params, oncomplite)
}

function clear(){
    network.clear()
}

export default {
    main,
    menu,
    list,
    category,
    clear
}
