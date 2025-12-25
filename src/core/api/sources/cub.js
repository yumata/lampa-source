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
    let parts_data  = [
        (call)=>{
            get('?sort=now_playing',params,(json)=>{
                json.title = Lang.translate('title_now_watch')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            get('?sort=latest',params,(json)=>{
                json.title = Lang.translate('title_latest')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            get('top/fire/movie',params,(json)=>{
                json.title = Lang.translate('title_fire')
                
                json.icon_svg     = Template.string('icon_fire')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#fd4518'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            get('?cat='+params.url+'&sort=latest&uhd=true',params,(json)=>{
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
        },
        (call)=>{
            get('top/hundred/movie',params,(json)=>{
                json.title  = Lang.translate('title_top_100') + ' - ' + Lang.translate('menu_movies')
                
                json.icon_svg     = Template.string('icon_top')
                json.icon_bgcolor = '#e02129'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            get('top/hundred/tv',params,(json)=>{
                json.title  = Lang.translate('title_top_100') + ' - ' + Lang.translate('menu_tv')
                
                json.icon_svg     = Template.string('icon_top')
                json.icon_bgcolor = '#e02129'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            trailers('added',call,call)
        }
    ]

    ContentRows.call('main', params, parts_data)

    let start_shuffle = parts_data.length + 1

    Arrays.insert(parts_data, 0, Api.partPersons(parts_data, parts_limit, 'movie', start_shuffle))

    TMDB.genres.movie.forEach(genre=>{
        let event = (call)=>{
            get('?sort=now&genre='+genre.id,params,(json)=>{
                json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                call(json)
            },call, {life: day * 7})
        }

        parts_data.push(event)
    })

    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/collections/list?category=new',(data)=>{
        data.results.forEach((collection,index)=>{
            let event = (call_inner)=>{
                get('collections/'+collection.id,{},(json)=>{
                    json.title        = Utils.capitalizeFirstLetter(collection.title)
                    json.icon_svg     = Template.string('icon_collection')
                    json.icon_color   = '#fff'
                    json.icon_bgcolor = 'rgba(255,255,255,0.15)'

                    json.params = {
                        module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                    }
    
                    call_inner(json)
                },call_inner, {life: day * 3})
            }

            parts_data.push(event)
        })

        Arrays.shuffleArrayFromIndex(parts_data, start_shuffle)
    },false, false, {cache:  {life: day * 3}})

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
            if(params.url == 'anime' || !fullcat) call()
            else{
                get('top/fire/'+params.url,params,(json)=>{
                    json.title        = Lang.translate('title_fire')
                    json.icon_svg     = Template.string('icon_fire')
                    json.icon_bgcolor = '#fff'
                    json.icon_color   = '#fd4518'

                    json.params = {
                        module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                    }

                    call(json)
                },call, {life: day * 7})
            }
        },
        (call)=>{
            if(params.url == 'anime' || !fullcat) call()
            else{
                get('top/hundred/'+params.url,params,(json)=>{
                    json.title        = Lang.translate('title_top_100')
                    json.icon_svg     = Template.string('icon_top')
                    json.icon_bgcolor = '#e02129'

                    json.params = {
                        module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                    }

                    call(json)
                },call, {life: day * 7})
            }
        },
        (call)=>{
            if(params.url == 'movie' && fullcat) trailers('added',call,call)
            else call()
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

    // Дух Рождества
    if(params.url !== 'anime'){
        Arrays.insert(parts_data, 1, Api.partKeyword({id: 207317, title: '#{filter_keyword_christmas}'}, params.url, params))
    }

    ContentRows.call('category', params, parts_data)

    let start_shuffle = parts_data.length + 2

    if(params.url == 'anime'){
        Arrays.insert(parts_data, 0, Api.partKeywords(parts_data, 'tv', start_shuffle, [], {
            genres: 16,
            orig_lang: 'ja'
        }))
    }
    else{
        Arrays.insert(parts_data, 0, Api.partKeywords(parts_data, params.url, start_shuffle, [], params))
    }
    
    if(fullcat){
        Arrays.insert(parts_data, 0, Api.partPersons(parts_data, parts_limit + 3, params.url, start_shuffle))
    } 
    
    if(TMDB.genres[params.url] && fullcat){
        TMDB.genres[params.url].filter(a=>!(a.id == 10763 || a.id == 10767)).forEach(genre=>{
            let event = (call)=>{
                get('?cat='+params.url+'&sort=top&genre='+genre.id,params,(json)=>{
                    json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                    call(json)
                },call, {life: day * 7})
            }

            parts_data.push(event)
        })
    }
    else if(params.url == 'anime'){
        TMDB.genres.tv.filter(a=>!(a.id == 99 || a.id == 10766)).forEach(genre=>{
            let event = (call)=>{
                get('?cat='+params.url+'&sort=top&genre='+genre.id,params,(json)=>{
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

function full(params, oncomplite, onerror){
    let status = new Status(8)
        status.onComplite = oncomplite

    if(Utils.dcma(params.method, params.id)) return onerror()

    get('3/'+params.method+'/'+params.id+'?api_key='+TMDBApi.key()+'&append_to_response=content_ratings,release_dates,keywords,alternative_titles&language='+Storage.field('tmdb_lang'),params,(json)=>{
        if(json.status_code) return status.stop(),onerror()

        json.source = 'cub'

        if(params.method == 'tv'){
            let season = Utils.countSeasons(json)

            TMDB.get('tv/'+json.id+'/season/'+season,{},(ep)=>{
                status.append('episodes', ep)
            },status.error.bind(status), {life: day * 3})
        }
        else status.need--

        if(json.belongs_to_collection){
            TMDB.get('collection/'+json.belongs_to_collection.id,{},(collection)=>{
                collection.results = collection.parts.slice(0,19)

                status.append('collection', Utils.addSource(collection, 'tmdb'))
            },status.error.bind(status), {life: day * 7})
        }
        else status.need--

        status.append('movie', json)
    },()=>{
        status.need -= 2

        status.error()
    }, {life: day * 7})

    TMDB.get(params.method+'/'+params.id+'/credits',params,(json)=>{
        status.append('persons', json)
    },status.error.bind(status), {life: day * 7})

    TMDB.get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
        status.append('recomend', json)
    },status.error.bind(status), {life: day * 7})

    TMDB.get(params.method+'/'+params.id+'/similar',params,(json)=>{
        status.append('simular', json)
    },status.error.bind(status), {life: day * 7})

    TMDB.videos(params, (json)=>{
        status.append('videos', json)
    },status.error.bind(status))

    reactionsGet(params, (json)=>{
        status.append('reactions', json)
    })

    if(Lang.selected(['ru','uk','be']) && window.lampa_settings.account_use){
        status.need++

        discussGet(params, (json)=>{
            status.append('discuss', json)
        },status.error.bind(status))
    }
}

function trailers(type, oncomplite){
    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/trailers/short/trailers/' + type, (result)=>{
        result.title = Lang.translate('title_trailers') + ' - ' + Lang.translate('title_new')

        result.results.forEach(card=>{
            card.params = {
                style: {
                    name: 'wide',
                }
            }
        })

        oncomplite(Utils.addSource(result, source))
    },()=>{
        oncomplite({results: []})
    }, false, {cache:  {life: day * 2}})
}

function reactionsGet(params, oncomplite){
    if(window.lampa_settings.disable_features.reactions) return oncomplite({result: []})
    
    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/reactions/get/' + params.method + '_' + params.id, oncomplite,()=>{
        oncomplite({result: []})
    }, false, {timeout: 1000 * 5})
}

function discussGet(params, oncomplite, onerror){
    if(window.lampa_settings.disable_features.discuss) return onerror()
    
    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/discuss/get/'+params.method+'_'+params.id+'/' + (params.page || 1) + '/' + Storage.field('language'), oncomplite, onerror, false, {timeout: 1000 * 5})
}

function reactionsAdd(params, oncomplite, onerror){
    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/reactions/add/' + params.method + '_' + params.id + '/' + params.type + '?uid=' + Storage.get('lampa_uid','none'), oncomplite, onerror)
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
    let status = new Status(3)
        status.onComplite = (data)=>{
            let items = []

            if(data.movie && data.movie.results.length) items.push(data.movie)
            if(data.tv && data.tv.results.length)       items.push(data.tv)
            if(data.anime && data.anime.results.length) items.push(data.anime)

            oncomplite(items)
        }

    get('search/movie',params,(json)=>{
        json.title = Lang.translate('menu_movies')
        json.type = 'movie'

        status.append('movie', json)
    },status.error.bind(status))

    get('search/tv',params,(json)=>{
        json.title = Lang.translate('menu_tv')
        json.type = 'tv'

        status.append('tv', json)
    },status.error.bind(status))

    get('search/anime',params,(json)=>{
        json.title = Lang.translate('menu_anime')
        json.type = 'anime'

        status.append('anime', json)
    },status.error.bind(status))
}

function discovery(){
    return {
        title: 'CUB',
        search: search,
        params: {
            save: true
        },
        onMore: (params, close)=>{
            close()

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

function extensions(call){
    let headers = {}

    if(Permit.token && window.lampa_settings.account_use){
        headers = {
            headers: {
                token: Permit.token,
                profile: Permit.account.profile.id
            }
        }
    }
    
    network.timeout(5000)
    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/extensions/list', (result)=>{
        if(result.secuses){
            Storage.set('account_extensions', result)

            call(result)
        }
        else{
            call(Storage.get('account_extensions','{}'))
        }
    },()=>{
        call(Storage.get('account_extensions','{}'))
    },false, headers)
    
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
    menuCategory,
    discovery,
    reactionsGet,
    reactionsAdd,
    discussGet,
    extensions
}
