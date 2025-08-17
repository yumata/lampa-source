import Reguest from '../reguest'
import Utils from '../math'
import Storage from '../storage'
import Status from '../status'
import Favorite from '../../utils/favorite'
import Recomends from '../../utils/recomend'
import Arrays from '../../utils/arrays'
import Lang from '../lang'
import TMDB from './tmdb'
import TMDBApi from '../tmdb'
import Activity from '../../interaction/activity'
import Api from '../../interaction/api'
import TimeTable from '../../utils/timetable'
import Episode from '../../interaction/episode'
import Manifest from '../manifest'
import Template from '../../interaction/template'
import LineModule from '../../interaction/items/line/module/module'


let network   = new Reguest()


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
    let parts_limit = 6
    let parts_data  = [
        (call)=>{
            get('?sort=now_playing',params,(json)=>{
                json.title = Lang.translate('title_now_watch')

                call(json)
            },call)
        },
        (call)=>{
            get('?sort=latest',params,(json)=>{
                json.title = Lang.translate('title_latest')

                call(json)
            },call)
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
            },call)
        },
        (call)=>{
            get('?cat='+params.url+'&sort=latest&uhd=true',params,(json)=>{
                json.title = Lang.translate('title_in_high_quality')
                
                json.results.forEach(card=>{
                    card.params = {
                        card_wide: true
                    }
                })

                call(json)
            },call)
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
            },call)
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
            },call)
        },
        (call)=>{
            trailers('added',call,call)
        }
    ]

    let start_shuffle = parts_data.length + 1

    Arrays.insert(parts_data,0,Api.partPersons(parts_data, parts_limit, 'movie', start_shuffle))

    TMDB.genres.movie.forEach(genre=>{
        let event = (call)=>{
            get('?sort=now&genre='+genre.id,params,(json)=>{
                json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                call(json)
            },call)
        }

        parts_data.push(event)
    })

    network.silent(Utils.protocol() + Manifest.cub_domain + '/api/collections/list?category=new',(data)=>{
        data.results.forEach((collection,index)=>{
            let event = (call_inner)=>{
                get('collections/'+collection.id,{},(json)=>{
                    json.title = Utils.capitalizeFirstLetter(collection.title)

                    json.icon_svg     = Template.string('icon_collection')
                    json.icon_color   = '#fff'
                    json.icon_bgcolor = 'rgba(255,255,255,0.15)'

                    json.params = {
                        module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                    }
    
                    call_inner(json)
                },call_inner)
            }

            parts_data.push(event)
        })

        Arrays.shuffleArrayFromIndex(parts_data, start_shuffle)
    })

    function loadPart(partLoaded, partEmpty){
        Api.partNext(parts_data, parts_limit, partLoaded, partEmpty)
    }

    loadPart(oncomplite, onerror)

    return loadPart
}

function category(params = {}, oncomplite, onerror){
    let fullcat  = !(params.genres || params.keywords)
    let show     = ['movie','tv'].indexOf(params.url) > -1 && !params.genres
    let books    = show ? Favorite.continues(params.url) : []
    let recomend = show ? Arrays.shuffle(Recomends.get(params.url)).slice(0,19) : []
    let airdate  = params.url == 'anime' ? '&airdate=' + (new Date()).getFullYear() : ''
    
    let parts_limit = 6
    let parts_data  = [
        (call)=>{
            call({results: books, title: params.url == 'tv' ? Lang.translate('title_continue') : Lang.translate('title_watched')})
        },
        (call)=>{
            call({results: recomend,title: Lang.translate('title_recomend_watch')})
        },
        (call)=>{
            get('?cat='+params.url+'&sort=now_playing'+airdate,params,(json)=>{
                json.title = Lang.translate('title_now_watch')

                call(json)
            },call)
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
    
                    call(json)
                },call)
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

                    call(json)
                },call)
            }
        },
        (call)=>{
            if(params.url == 'tv' || params.url == 'anime'){
                get('?cat='+params.url+'&sort=airing'+airdate,params,(json)=>{
                    json.title = Lang.translate('title_ongoing')

                    call(json)
                },call)
            }
            else call()
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top'+airdate,params,(json)=>{
                json.title = Lang.translate('title_popular')

                call(json)
            },call)
        },
        (call)=>{
            get('?cat='+params.url+'&sort=now&airdate=' + (new Date()).getFullYear(),params,(json)=>{
                json.title = Lang.translate('title_new_this_year')

                call(json)
            },call)
        },
        (call)=>{
            if(params.url == 'anime' || !fullcat) call()
            else{
                get('top/fire/'+params.url,params,(json)=>{
                    json.title = Lang.translate('title_fire')

                    json.icon_svg     = Template.string('icon_fire')
                    json.icon_bgcolor = '#fff'
                    json.icon_color   = '#fd4518'

                    json.params = {
                        module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                    }

                    call(json)
                },call)
            }
        },
        (call)=>{
            if(params.url == 'anime' || !fullcat) call()
            else{
                get('top/hundred/'+params.url,params,(json)=>{
                    json.title = Lang.translate('title_top_100')

                    json.icon_svg     = Template.string('icon_top')
                    json.icon_bgcolor = '#e02129'

                    json.params = {
                        module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                    }

                    call(json)
                },call)
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
            },call)
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top&airdate=' + (new Date().getFullYear() - 7) + '-' + (new Date().getFullYear() - 2) + '&vote=6-8',params,(json)=>{
                json.title = Lang.translate('title_worth_rewatch')

                call(json)
            },call)
        },
        (call)=>{
            get('?cat='+params.url+'&sort=top&airdate=' + (new Date().getFullYear() - 7) + '-' + (new Date().getFullYear() - 2) + '&vote=8-10',params,(json)=>{
                json.title = Lang.translate('title_hight_voite')
                
                json.icon_svg     = Template.string('icon_star')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#212121'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call)
        }
    ]

    let start_shuffle = parts_data.length + 1

    if(fullcat) Arrays.insert(parts_data, 0, Api.partPersons(parts_data, parts_limit + 3, params.url, start_shuffle))

    if(TMDB.genres[params.url]){
        TMDB.genres[params.url].forEach(genre=>{
            let gen = params.genres ? [].concat(params.genres, genre.id) : [genre.id]

            if(params.genres && params.genres == genre.id) return

            let event = (call)=>{
                get('?cat='+params.url+'&sort=top&genre='+gen.join(','),params,(json)=>{
                    json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                    call(json)
                },call)
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
                },call)
            }

            parts_data.push(event)

            Arrays.shuffleArrayFromIndex(parts_data, start_shuffle)
        })
    }
     

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

    TMDB.get(params.method+'/'+params.id+'/credits',params,(json)=>{
        status.append('persons', json)
    },status.error.bind(status))

    TMDB.get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
        status.append('recomend', json)
    },status.error.bind(status))

    TMDB.get(params.method+'/'+params.id+'/similar',params,(json)=>{
        status.append('simular', json)
    },status.error.bind(status))

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
                card_wide: true
            }
        })

        oncomplite(result)
    },()=>{
        oncomplite({results: []})
    })
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
    menuCategory,
    discovery,
    reactionsGet,
    reactionsAdd,
    discussGet
}
