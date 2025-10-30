import Reguest from '../../../utils/reguest'
import Arrays from '../../../utils/arrays'
import Storage from '../../storage/storage'
import Status from '../../../utils/status'
import Lang from '../../lang'
import Activity from '../../../interaction/activity/activity'
import TMDB from '../../tmdb/tmdb'
import Utils from '../../../utils/utils'
import Api from '../api'
import CardModule from '../../../interaction/card/module/module'
import ContentRows from '../../content_rows'
import Template from '../../../interaction/template'
import LineModule from '../../../interaction/items/line/module/module'


let network   = new Reguest()
let menu_list = []
let day       = 60 * 24
let source    = 'tmdb'

let genres = {
    movie: [
        {"id":28,"title":"#{filter_genre_ac}"},
        {"id":12,"title":"#{filter_genre_ad}"},
        {"id":16,"title":"#{filter_genre_mv}"},
        {"id":35,"title":"#{filter_genre_cm}"},
        {"id":80,"title":"#{filter_genre_cr}"},
        {"id":99,"title":"#{filter_genre_dc}"},
        {"id":18,"title":"#{filter_genre_dr}"},
        {"id":10751,"title":"#{filter_genre_fm}"},
        {"id":14,"title":"#{filter_genre_fe}"},
        {"id":36,"title":"#{filter_genre_hi}"},
        {"id":27,"title":"#{filter_genre_ho}"},
        {"id":10402,"title":"#{filter_genre_mu}"},
        {"id":9648,"title":"#{filter_genre_de}"},
        {"id":10749,"title":"#{filter_genre_md}"},
        {"id":878,"title":"#{filter_genre_fa}"},
        {"id":10770,"title":"#{filter_genre_tv}"},
        {"id":53,"title":"#{filter_genre_tr}"},
        {"id":10752,"title":"#{filter_genre_mi}"},
        {"id":37,"title":"#{filter_genre_ve}"}
    ],
    tv: [
        {"id": 10759,"title": "#{filter_genre_aa}"},
        {"id": 16,"title": "#{filter_genre_mv}"},
        {"id": 35,"title": "#{filter_genre_cm}"},
        {"id": 80,"title": "#{filter_genre_cr}"},
        {"id": 99,"title": "#{filter_genre_dc}"},
        {"id": 18,"title": "#{filter_genre_dr}"},
        {"id": 10751,"title": "#{filter_genre_fm}"},
        {"id": 10762,"title": "#{filter_genre_ch}"},
        {"id": 9648,"title": "#{filter_genre_de}"},
        {"id": 10763,"title": "#{filter_genre_nw}"},
        {"id": 10764, "title": "#{filter_genre_rs}"},
        {"id": 10765,"title": "#{filter_genre_hf}"},
        {"id": 10766,"title": "#{filter_genre_op}"},
        {"id": 10767,"title": "#{filter_genre_tc}"},
        {"id": 10768,"title": "#{filter_genre_mp}"},
        {"id": 37,"title": "#{filter_genre_ve}"}
    ]
}

function url(u, params = {}){
    let ln = [Storage.field('tmdb_lang')]

    if(params.langs) ln = typeof params.langs == 'string' ? [params.langs] : ln.concat(params.langs.filter(n=>n !== ln[0]))

    u = add(u, 'api_key='+TMDB.key())
    u = add(u, 'language='+ln.join(','))

    // Оставлю на потом для детского профиля
    //if(!params.networks) u = add(u, 'certification_country=RU&certification.lte=18')

    if(params.genres && u.indexOf('with_genres') == -1)  u = add(u, 'with_genres='+params.genres)
    if(params.page)    u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)
    if(params.keywords)u = add(u, 'with_keywords='+params.keywords)
    if(params.watch_region) u = add(u, 'watch_region='+params.watch_region)
    if(params.watch_providers) u = add(u, 'with_watch_providers='+params.watch_providers)
    if(params.companies) u = add(u, 'with_companies='+params.companies)
    if(params.networks) u = add(u, 'with_networks='+params.networks)
    if(params.sort_by) u = add(u, 'sort_by='+params.sort_by)

    if(params.filter){
        for(let i in params.filter){
            u = add(u, i+'='+params.filter[i])
        }
    }

    // Добавляем проверку для запросов по жанрам
    if (params.genres && u.indexOf('discover/') !== 0) {
        u = 'discover/' + u;
    }

    return TMDB.api(u)
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
}

function get(method, params = {}, oncomplite, onerror, cache = false){
    let u = url(method, params)
    
    network.timeout(1000 * 10)
    network.silent(u,(json)=>{
        json.url = method
        json.source = source

        oncomplite(Utils.addSource(json, source))
    }, onerror, false, {
        cache: cache
    })
}

function img(src, size){
    let poster_size  = Storage.field('poster_size')
    let baseimg      = 't/p/'+poster_size+'/'
    let path         = baseimg

    if(size) path = path.replace(new RegExp(poster_size,'g'),size)

    return src ? TMDB.image(path + src) : '';
}

function find(find, params = {}){
    let finded

    let filtred = (items)=>{
        for(let i = 0; i < items.length; i++){
            let item = items[i]

            if(params.original_title == item.original_title || params.title == item.title){
                finded = item; break;
            }
        }
    }

    if(find.movie && find.movie.results.length)      filtred(find.movie.results)
    if(find.tv && find.tv.results.length && !finded) filtred(find.tv.results)

    return finded
}

function main(params = {}, oncomplite, onerror){
    let parts_limit = 6
    let parts_data  = [
        (call)=>{
            get('movie/now_playing',params,(json)=>{
                json.title = Lang.translate('title_now_watch')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            get('trending/movie/day',params,(json)=>{
                json.title = Lang.translate('title_trend_day')

                call(json)
            },call, {life: day * 2})
        },
        (call)=>{
            get('trending/movie/week',params,(json)=>{
                json.title = Lang.translate('title_trend_week')

                call(json)
            },call, {life: day * 3})
        },
        (call)=>{
            get('movie/upcoming',params,(json)=>{
                json.title = Lang.translate('title_upcoming')

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            get('movie/popular',params,(json)=>{
                json.title        = Lang.translate('title_popular_movie')
                json.icon_svg     = Template.string('icon_fire')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#fd4518'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 3})
        },
        (call)=>{
            get('trending/tv/week',params,(json)=>{
                json.title        = Lang.translate('title_popular_tv')
                json.icon_svg     = Template.string('icon_fire')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#fd4518'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 3})
        },
        (call)=>{
            get('movie/top_rated',params,(json)=>{
                json.title        = Lang.translate('title_top_movie')
                json.icon_svg     = Template.string('icon_top')
                json.icon_bgcolor = '#e02129'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            get('tv/top_rated',params,(json)=>{
                json.title        = Lang.translate('title_top_tv')
                json.icon_svg     = Template.string('icon_top')
                json.icon_bgcolor = '#e02129'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        }
    ]

    ContentRows.call('main', params, parts_data)

    let start_shuffle = parts_data.length + 1

    Arrays.insert(parts_data, 0, Api.partPersons(parts_data, parts_limit, 'movie', start_shuffle))

    genres.movie.forEach(genre=>{
        let event = (call)=>{
            get('discover/movie?with_genres='+genre.id,params,(json)=>{
                json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                call(json)
            },call, {life: day * 7})
        }

        parts_data.push(event)
    })

    function loadPart(partLoaded, partEmpty){
        Api.partNext(parts_data, parts_limit, partLoaded, partEmpty)
    }

    loadPart(oncomplite, onerror)

    return loadPart
}

function category(params = {}, oncomplite, onerror){
    let fullcat  = !(params.genres || params.keywords)
    
    let parts_limit = 6
    let parts_data  = [
        (call)=>{
            if(params.url == 'movie'){
                get('discover/' + params.url + '?with_release_type=1',params,(json)=>{
                    json.title = Lang.translate('title_now_watch')

                    call(json)
                },call, {life: day * 2})
            }
            else call()
        },
        (call)=>{
            get(params.url == 'movie' ? 'trending/movie/week' : 'trending/tv/week',params,(json)=>{
                json.title        = Lang.translate('title_popular')
                json.icon_svg     = Template.string('icon_fire')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#fd4518'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 3})
        },
        (call)=>{
            get('discover/' + params.url + '?'+(params.url == 'movie' ? 'primary_release_year' : 'first_air_date_year')+'=' + (new Date().getFullYear() - 1),params,(json)=>{
                json.title = Lang.translate('title_last_year')

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            let lte = (new Date().getFullYear() - 2) + '-12-31'
            let gte = (new Date().getFullYear() - 7) + '-01-01'
            let reg = (params.url == 'movie' ? 'primary_release_date' : 'first_air_date')

            lte = reg + '.lte=' + lte
            gte = reg + '.gte=' + gte

            get('discover/' + params.url + '?' + lte + '&' + gte,params,(json)=>{
                json.title = Lang.translate('title_worth_rewatch')

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            let lte = (new Date().getFullYear() - 2) + '-12-31'
            let gte = (new Date().getFullYear() - 7) + '-01-01'
            let reg = (params.url == 'movie' ? 'primary_release_date' : 'first_air_date')

            lte = reg + '.lte=' + lte
            gte = reg + '.gte=' + gte

            get('discover/' + params.url + '?' + lte + '&' + gte + '&vote_average.gte=8&vote_average.lte=9',params,(json)=>{
                json.title        = Lang.translate('title_hight_voite')
                json.icon_svg     = Template.string('icon_star')
                json.icon_bgcolor = '#fff'
                json.icon_color   = '#212121'

                json.params = {
                    module: LineModule.toggle(LineModule.MASK.base, 'Icon')
                }

                call(json)
            },call, {life: day * 7})
        },
        (call)=>{
            if(params.genres) return call()

            if(params.url == 'tv'){
                get('trending/tv/week',params,(json)=>{
                    json.title = Lang.translate('title_this_week')
    
                    call(json)
                },call, {life: day * 3})
            }
            else{
                get('movie/upcoming',params,(json)=>{
                    json.title = Lang.translate('title_upcoming')

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
        }
    ]

    ContentRows.call('category', params, parts_data)

    let start_shuffle = parts_data.length + 1

    if(fullcat) Arrays.insert(parts_data, 0, Api.partPersons(parts_data, parts_limit, params.url, start_shuffle))

    genres[params.url].forEach(genre=>{
        let gen = params.genres ? [].concat(params.genres, genre.id) : [genre.id]

        if(params.genres && params.genres == genre.id) return

        let event = (call)=>{
            get('discover/' + params.url+'?with_genres='+gen.join(','),params,(json)=>{
                json.title = Lang.translate(genre.title.replace(/[^a-z_]/g,''))

                call(json)
            },call, {life: day * 7})
        }

        parts_data.push(event)

        Arrays.shuffleArrayFromIndex(parts_data, start_shuffle)
    })

    function loadPart(partLoaded, partEmpty){
        Api.partNext(parts_data, parts_limit, partLoaded, partEmpty)
    }

    loadPart(oncomplite, onerror)

    return loadPart
}

function full(params = {}, oncomplite, onerror){
    let status = new Status(8)
        status.onComplite = oncomplite

    if(Utils.dcma(params.method, params.id)) return onerror()

    get(params.method+'/'+params.id+'?append_to_response=content_ratings,release_dates,external_ids,keywords,alternative_titles',params,(json)=>{
        json.source = 'tmdb'

        if(json.external_ids){
            json.imdb_id = json.external_ids.imdb_id
        }
        
        if(params.method == 'tv'){
            let season = Utils.countSeasons(json)

            get('tv/'+json.id+'/season/'+season,{},(ep)=>{
                status.append('episodes', ep)
            },status.error.bind(status), {life: day * 3})
        }
        else status.need--

        if(json.belongs_to_collection){
            get('collection/'+json.belongs_to_collection.id,{},(collection)=>{
                collection.results = collection.parts.slice(0,19)

                status.append('collection', collection)
            },status.error.bind(status), {life: day * 7})
        }
        else status.need--

        status.append('movie', json)
    },()=>{
        status.need -= 2

        status.error()
    }, {life: day * 7})

    get(params.method+'/'+params.id+'/credits',params,(json)=>{
        status.append('persons', json)
    },status.error.bind(status), {life: day * 7})

    get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
        status.append('recomend', json)
    },status.error.bind(status), {life: day * 7})

    get(params.method+'/'+params.id+'/similar',params,(json)=>{
        status.append('simular', json)
    },status.error.bind(status), {life: day * 7})

    videos(params, (json)=>{
        status.append('videos', json)
    },status.error.bind(status))

    Api.sources.cub.reactionsGet(params,(json)=>{
        status.append('reactions', json)
    })

    if(Lang.selected(['ru','uk','be']) && window.lampa_settings.account_use){
        status.need++

        Api.sources.cub.discussGet(params, (json)=>{
            status.append('discuss', json)
        },status.error.bind(status))
    }
}

function videos(params = {}, oncomplite, onerror){
    let lg = Storage.field('tmdb_lang')
    let status = new Status(lg == 'en' ? 1 : 2)
        status.onComplite = (res)=>{
            let data = []

            if(res.one && res.one.results && res.one.results.length) data = data.concat(res.one.results)
            if(res.two && res.two.results && res.two.results.length) data = data.concat(res.two.results)

            oncomplite({results: data})
        }

    get(params.method+'/'+params.id+'/videos',{langs: Storage.field('tmdb_lang')},(json)=>{
        status.append('one', json)
    },status.error.bind(status), {life: day * 7})

    if(lg !== 'en'){
        get(params.method+'/'+params.id+'/videos',{langs: 'en'},(json)=>{
            status.append('two', json)
        },status.error.bind(status), {life: day * 7})
    }
}

function list(params = {}, oncomplite, onerror){
    let u = url(params.url, params)

    network.silent(u, (data)=>{
        oncomplite(Utils.addSource(data, source))
    }, onerror, false, {
        cache: {life: day * 2}
    })
}

function search(params = {}, oncomplite){
    let status = new Status(3)
        status.onComplite = (data)=>{
            let items = []

            if(data.movie && data.movie.results.length) items.push(data.movie)
            if(data.tv && data.tv.results.length) items.push(data.tv)
            if(data.person && data.person.results.length) items.push(data.person)

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

    get('search/person',params,(json)=>{
        json.title = Lang.translate('title_actors')
        json.type = 'person'

        json.results.forEach(person=>{
            person.params = {
                module: CardModule.only('Card', 'Release', 'Callback'),
                emit: {
                    onlyEnter: ()=>{
                        console.log('Person card focused:', person);
                    }
                }
            }
        })

        status.append('person', json)
    },status.error.bind(status))
}

function discovery(){
    return {
        title: 'TMDB',
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
                source: source
            })
        },
        onCancel: network.clear.bind(network)
    }
}

function person(params = {}, oncomplite, onerror){
    const sortCredits = (credits) => {
        return Utils.addSource(credits
            .map((a) => {
                a.year = parseInt(((a.release_date || a.first_air_date || '0000') + '').slice(0,4))
                return a;
            })
            .sort((a, b) => b.vote_average - a.vote_average && b.vote_count - a.vote_count) //сортируем по оценке и кол-ву голосов (чтобы отсечь мусор с 1-2 оценками)
        , source);
    }

    const convert = (credits, person_data) => {
        if(params.only_credits){
            let cast  = sortCredits(credits.cast)
            let result = {}

            result[params.only_credits] = sortCredits(cast.filter(media => media.media_type === params.only_credits))

            return result
        }
        else{
            let department = ['directing','writing','editing','creator']

            credits.crew.forEach((a) => {
                a.department = Lang.translate(department.indexOf(a.department.toLowerCase()) == -1 ? 'settings_main_rest' : 'full_' + a.department.toLowerCase())
            })

            let cast  = sortCredits(credits.cast),
                crew  = sortCredits(credits.crew),
                tv    = sortCredits(cast.filter(media => media.media_type === 'tv')),
                movie = sortCredits(cast.filter(media => media.media_type === 'movie')),
                knownFor

            //Наиболее известные работы человека
            //1. Группируем все работы по департаментам (Актер, Режиссер, Сценарист и т.д.)
            knownFor = Arrays.groupBy(crew, 'department')

            if(movie.length > 0) knownFor[Lang.translate('menu_movies')] = movie;
            if(tv.length > 0) knownFor[Lang.translate('menu_tv')] = tv;

            //2. Для каждого департамента суммируем кол-ва голосов (вроде бы сам TMDB таким образом определяет knownFor для людей)
            knownFor = Object.entries(knownFor).map(([depIdx, dep]) => {
                //убираем дубликаты (человек может быть указан в одном департаменте несколько раз на разных должностях (job))
                let set = {},
                    credits = dep.filter(credit => set.hasOwnProperty(credit.original_title || credit.original_name) ?
                        false : (credit.original_title ? set[credit.original_title] = true : set[credit.original_name] = true));
                return {
                    name: depIdx,
                    credits,
                    vote_count: dep.reduce((a, b) => a + b.vote_count, 0)
                }
            //3. Сортируем департаменты по кол-ву голосов
            }).sort((a, b) => b.credits.length - a.credits.length);

            return {
                raw: credits, cast, crew, tv, movie, knownFor
            }
        }
    }

    let status = new Status(params.only_credits ? 1 : 2)
        status.onComplite = ()=>{
            let fulldata = {}

            if(status.data.person) fulldata.person = status.data.person

            if(status.data.credits) fulldata.credits = convert(status.data.credits, status.data.person || {})

            oncomplite(fulldata)
        }
    
    if(!params.only_credits){
        get('person/'+params.id,params,(json)=>{
            status.append('person', json)
        },status.error.bind(status), {life: day * 7})
    }

    get('person/'+params.id+'/combined_credits',params,(json)=>{
        status.append('credits', json)
    },status.error.bind(status), {life: day * 7})
}

function menu(params = {}, oncomplite){
    if(menu_list.length) oncomplite(menu_list)
    else{
        let u = url('genre/movie/list',params)

        network.silent(u,(j)=>{
            j.genres.forEach((g)=>{
                menu_list.push({
                    title: g.name,
                    id: g.id
                })
            })

            oncomplite(menu_list)
        })
    }
}

function menuCategory(params, oncomplite){
    let menu = []

    if(params.action !== 'tv'){
        menu.push({
            title: Lang.translate('title_now_watch'),
            url: params.action+'/now_playing'
        })
    }

    menu.push({
        title: Lang.translate('title_popular'),
        url: params.action+'/popular'
    })

    let date  = new Date()
    let query = []
        query.push('sort_by=release_date.desc')
        query.push('year='+date.getFullYear())
        query.push('first_air_date_year='+date.getFullYear())
        query.push('vote_average.gte=7')

    menu.push({
        title: Lang.translate('title_new'),
        url: 'discover/'+params.action+'?'+query.join('&')
    })

    if(params.action == 'tv'){
        menu.push({
            title: Lang.translate('title_tv_today'),
            url: params.action+'/airing_today'
        })

        menu.push({
            title: Lang.translate('title_this_week'),
            url: params.action+'/on_the_air'
        })
    }

    menu.push({
        title: Lang.translate('title_in_top'),
        url: params.action+'/top_rated'
    })

    oncomplite(menu)
}

function external_ids(params = {}, oncomplite, onerror){
    get((params.type || 'tv') + '/'+params.id+'/external_ids', params, oncomplite, onerror, {life: day * 7})
}

function external_imdb_id(params = {}, oncomplite){
    get(params.type+'/'+params.id+'/external_ids', params, (ids)=>{
        oncomplite(ids.imdb_id || '')
    }, ()=>{
        oncomplite('')
    }, {life: day * 7})
}

function company(params = {}, oncomplite, onerror) {
    let status = new Status(3)
        status.onComplite = ()=>{
            function sortResultsByVoteAverage(results) {
                return results.sort((a, b) => b.vote_average - a.vote_average)
            }

            if(status.data.company){
                let fulldata = {
                    company: status.data.company,
                    lines: []
                }

                if(status.data.movie && status.data.movie.results.length) fulldata.lines.push({
                    total_pages: status.data.movie.total_pages, 
                    url: 'discover/movie', 
                    title: Lang.translate('menu_movies') + ' (' + status.data.movie.total_results + ')', 
                    results: sortResultsByVoteAverage(status.data.movie.results),
                    total_results: status.data.movie.total_results
                })

                if(status.data.tv && status.data.tv.results.length)       fulldata.lines.push({
                    total_pages: status.data.tv.total_pages, 
                    url: 'discover/tv', 
                    title: Lang.translate('menu_tv') + ' (' + status.data.tv.total_results + ')', 
                    results: sortResultsByVoteAverage(status.data.tv.results),
                    total_results: status.data.tv.total_results
                })

                oncomplite(fulldata)
            }
            else onerror()
        }

    get('company/' + params.id,params,(json)=>{
        status.append('company', json)
    },status.error.bind(status), {life: day * 7})

    get('discover/movie?sort_by=vote_count.desc&with_companies=' + params.id,params,(json)=>{
        status.append('movie', json)
    },status.error.bind(status), {life: day * 7})

    get('discover/tv?sort_by=vote_count.desc&with_companies=' + params.id,params,(json)=>{
        status.append('tv', json)
    },status.error.bind(status), {life: day * 7})
}

function seasons(tv, from, oncomplite){
    let status = new Status(from.length)
        status.onComplite = oncomplite

    from.forEach(season => {
        get('tv/'+tv.id+'/season/'+season,{},(json)=>{
            status.append(''+season, json)
        },status.error.bind(status), {life: day * 3})
    })
}

function parsePG(movie){
    let pg
    let cd = Storage.field('language')

    if(movie.content_ratings){
        try{
            let find = movie.content_ratings.results.find(a=>a.iso_3166_1 == cd.toUpperCase())

            if(!find) find = movie.content_ratings.results.find(a=>a.iso_3166_1 == 'US')
            
            if(find) pg = Utils.decodePG(find.rating)
        }
        catch(e){}
    }
    
    if(movie.release_dates && movie.release_dates.results && !pg){
        try{
            let find = movie.release_dates.results.find(a=>a.iso_3166_1 == cd.toUpperCase())

            if(!find) find = movie.release_dates.results.find(a=>a.iso_3166_1 == 'US')

            if(find && find.release_dates.length){
                pg = Utils.decodePG(find.release_dates[0].certification)
            }
        }
        catch(e){}
    }
    
    if(movie.restrict) pg = movie.restrict + '+'

    return pg
}

function parseCountries(movie){
    let iso_countries = {
        'AD' : Lang.translate('country_ad'),
        'AE' : Lang.translate('country_ae'),
        'AF' : Lang.translate('country_af'),
        //'AG' : 'Antigua And Barbuda',
        //'AI' : 'Anguilla',
        'AL' : Lang.translate('country_al'),
        'AM' : Lang.translate('country_am'),
        //'AN' : 'Netherlands Antilles',
        'AO' : Lang.translate('country_ao'),
        //'AQ' : 'Antarctica',
        'AR' : Lang.translate('country_ar'),
        //'AS' : 'American Samoa',
        'AT' : Lang.translate('country_at'),
        'AU' : Lang.translate('country_au'),
        'AW' : Lang.translate('country_aw'),
        'AZ' : Lang.translate('country_az'),
        'BA' : Lang.translate('country_ba'),
        //'BB' : 'Barbados',
        'BD' : Lang.translate('country_bd'),
        'BE' : Lang.translate('country_be'),
        //'BF' : 'Burkina Faso',
        'BG' : Lang.translate('country_bg'),
        'BH' : Lang.translate('country_bh'),
        'BI' : Lang.translate('country_bi'),
        'BJ' : Lang.translate('country_bj'),
        //'BL' : 'Saint Barthelemy',
        //'BM' : 'Bermuda',
        //'BN' : 'Brunei Darussalam',
        'BO' : Lang.translate('country_bo'),
        'BR' : Lang.translate('country_br'),
        'BS' : Lang.translate('country_bs'),
        'BT' : Lang.translate('country_bt'),
        //'BV' : 'Bouvet Island',
        'BW' : Lang.translate('country_bw'),
        'BY' : Lang.translate('country_by'),
        //'BZ' : 'Belize',
        'CA' : Lang.translate('country_ca'),
        //'CC' : 'Cocos (Keeling) Islands',
        //'CD' : 'Congo, Democratic Republic',
        //'CF' : 'Central African Republic',
        //'CG' : 'Congo',
        'CH' : Lang.translate('country_ch'),
        //'CI' : 'Cote D\'Ivoire',
        //'CK' : 'Cook Islands',
        'CL' : Lang.translate('country_cl'),
        'CM' : Lang.translate('country_cm'),
        'CN' : Lang.translate('country_cn'),
        'CO' : Lang.translate('country_co'),
        'CR' : Lang.translate('country_cr'),
        'CU' : Lang.translate('country_cu'),
        'CV' : Lang.translate('country_cv'),
        //'CX' : 'Christmas Island',
        'CY' : Lang.translate('country_cy'),
        'CZ' : Lang.translate('country_cz'),
        'DE' : Lang.translate('country_de'),
        'DJ' : Lang.translate('country_dj'),
        'DK' : Lang.translate('country_dk'),
        //'DM' : 'Dominica',
        'DO' : Lang.translate('country_do'),
        'DZ' : Lang.translate('country_dz'),
        'EC' : Lang.translate('country_ec'),
        'EE' : Lang.translate('country_ee'),
        'EG' : Lang.translate('country_eg'),
        //'EH' : 'Western Sahara',
        //'ER' : 'Eritrea',
        'ES' : Lang.translate('country_es'),
        'ET' : Lang.translate('country_et'),
        'FI' : Lang.translate('country_fi'),
        //'FJ' : 'Fiji',
        //'FK' : 'Falkland Islands (Malvinas)',
        //'FM' : 'Micronesia, Federated States Of',
        'FO' : Lang.translate('country_fo'),
        'FR' : Lang.translate('country_fr'),
        'GA' : Lang.translate('country_ga'),
        'GB' : Lang.translate('country_gb'),
        //'GD' : 'Grenada',
        'GE' : Lang.translate('country_ge'),
        //'GF' : 'French Guiana',
        //'GG' : 'Guernsey',
        'GH' : Lang.translate('country_gh'),
        //'GI' : 'Gibraltar',
        'GL' : Lang.translate('country_gl'),
        //'GM' : 'Gambia',
        //'GN' : 'Guinea',
        'GP' : Lang.translate('country_gp'),
        //'GQ' : 'Equatorial Guinea',
        'GR' : Lang.translate('country_gr'),
        //'GS' : 'South Georgia And Sandwich Isl.',
        'GT' : Lang.translate('country_gt'),
        //'GU' : 'Guam',
        //'GW' : 'Guinea-Bissau',
        //'GY' : 'Guyana',
        'HK' : Lang.translate('country_hk'),
        //'HM' : 'Heard Island & Mcdonald Islands',
        //'HN' : 'Honduras',
        'HR' : Lang.translate('country_hr'),
        'HT' : Lang.translate('country_ht'),
        'HU' : Lang.translate('country_hu'),
        'ID' : Lang.translate('country_id'),
        'IE' : Lang.translate('country_ie'),
        'IL' : Lang.translate('country_il'),
        //'IM' : 'Isle Of Man',
        'IN' : Lang.translate('country_in'),
        //'IO' : 'British Indian Ocean Territory',
        'IQ' : Lang.translate('country_iq'),
        'IR' : Lang.translate('country_ir'),
        'IS' : Lang.translate('country_is'),
        'IT' : Lang.translate('country_it'),
        //'JE' : 'Jersey',
        'JM' : Lang.translate('country_jm'),
        'JO' : Lang.translate('country_jo'),
        'JP' : Lang.translate('country_jp'),
        'KE' : Lang.translate('country_ke'),
        'KG' : Lang.translate('country_kg'),
        'KH' : Lang.translate('country_kh'),
        //'KI' : 'Kiribati',
        //'KM' : 'Comoros',
        //'KN' : 'Saint Kitts And Nevis',
        'KP' : Lang.translate('country_kp'),
        'KR' : Lang.translate('country_kr'),
        'KW' : Lang.translate('country_kw'),
        //'KY' : 'Cayman Islands',
        'KZ' : Lang.translate('country_kz'),
        'LA' : Lang.translate('country_la'),
        'LB' : Lang.translate('country_lb'),
        //'LC' : 'Saint Lucia',
        'LI' : Lang.translate('country_li'),
        'LK' : Lang.translate('country_lk'),
        'LR' : Lang.translate('country_lr'),
        //'LS' : 'Lesotho',
        'LT' : Lang.translate('country_lt'),
        'LU' : Lang.translate('country_lu'),
        'LV' : Lang.translate('country_lv'),
        'LY' : Lang.translate('country_ly'),
        'MA' : Lang.translate('country_ma'),
        'MC' : Lang.translate('country_mc'),
        'MD' : Lang.translate('country_md'),
        'ME' : Lang.translate('country_me'),
        //'MF' : 'Saint Martin',
        //'MG' : 'Madagascar',
        //'MH' : 'Marshall Islands',
        'MK' : Lang.translate('country_mk'),
        //'ML' : 'Mali',
        'MM' : Lang.translate('country_mm'),
        'MN' : Lang.translate('country_mn'),
        'MO' : Lang.translate('country_mo'),
        //'MP' : 'Northern Mariana Islands',
        //'MQ' : 'Martinique',
        //'MR' : 'Mauritania',
        //'MS' : 'Montserrat',
        'MT' : Lang.translate('country_mt'),
        'MU' : Lang.translate('country_mu'),
        'MV' : Lang.translate('country_mv'),
        'MW' : Lang.translate('country_mw'),
        'MX' : Lang.translate('country_mx'),
        'MY' : Lang.translate('country_my'),
        'MZ' : Lang.translate('country_mz'),
        'NA' : Lang.translate('country_na'),
        //'NC' : 'New Caledonia',
        'NE' : Lang.translate('country_ne'),
        //'NF' : 'Norfolk Island',
        'NG' : Lang.translate('country_ng'),
        'NI' : Lang.translate('country_ni'),
        'NL' : Lang.translate('country_nl'),
        'NO' : Lang.translate('country_no'),
        'NP' : Lang.translate('country_np'),
        //'NR' : 'Nauru',
        //'NU' : 'Niue',
        'NZ' : Lang.translate('country_nz'),
        'OM' : Lang.translate('country_om'),
        'PA' : Lang.translate('country_pa'),
        'PE' : Lang.translate('country_pe'),
        //'PF' : 'French Polynesia',
        'PG' : Lang.translate('country_pg'),
        'PH' : Lang.translate('country_ph'),
        'PK' : Lang.translate('country_pk'),
        'PL' : Lang.translate('country_pl'),
        //'PM' : 'Saint Pierre And Miquelon',
        //'PN' : 'Pitcairn',
        'PR' : Lang.translate('country_pr'),
        'PS' : Lang.translate('country_ps'),
        'PT' : Lang.translate('country_pt'),
        //'PW' : 'Palau',
        'PY' : Lang.translate('country_py'),
        'QA' : Lang.translate('country_qa'),
        //'RE' : 'Reunion',
        'RO' : Lang.translate('country_ro'),
        'RS' : Lang.translate('country_rs'),
        'RU' : Lang.translate('country_ru'),
        'RW' : Lang.translate('country_rw'),
        'SA' : Lang.translate('country_sa'),
        //'SB' : 'Solomon Islands',
        //'SC' : 'Seychelles',
        'SD' : Lang.translate('country_sd'),
        'SE' : Lang.translate('country_se'),
        'SG' : Lang.translate('country_sg'),
        //'SH' : 'Saint Helena',
        'SI' : Lang.translate('country_si'),
        //'SJ' : 'Svalbard And Jan Mayen',
        'SK' : Lang.translate('country_sk'),
        //'SL' : 'Sierra Leone',
        //'SM' : 'San Marino',
        'SN' : Lang.translate('country_sn'),
        //'SO' : 'Somalia',
        //'SR' : 'Suriname',
        //'ST' : 'Sao Tome And Principe',
        'SU' : Lang.translate('country_su'),
        'SV' : Lang.translate('country_sv'),
        'SY' : Lang.translate('country_sy'),
        //'SZ' : 'Swaziland',
        //'TC' : 'Turks And Caicos Islands',
        //'TD' : 'Chad',
        //'TF' : 'French Southern Territories',
        //'TG' : 'Togo',
        'TH' : Lang.translate('country_th'),
        'TJ' : Lang.translate('country_tj'),
        //'TK' : 'Tokelau',
        //'TL' : 'Timor-Leste',
        'TM' : Lang.translate('country_tm'),
        'TN' : Lang.translate('country_tn'),
        //'TO' : 'Tonga',
        'TR' : Lang.translate('country_tr'),
        //'TT' : 'Trinidad And Tobago',
        //'TV' : 'Tuvalu',
        'TW' : Lang.translate('country_tw'),
        'TZ' : Lang.translate('country_tz'),
        'UA' : Lang.translate('country_ua'),
        'UG' : Lang.translate('country_ug'),
        //'UM' : 'United States Outlying Islands',
        'US' : Lang.translate('country_us'),
        'UY' : Lang.translate('country_uy'),
        'UZ' : Lang.translate('country_uz'),
        //'VA' : 'Holy See (Vatican City State)',
        //'VC' : 'Saint Vincent And Grenadines',
        'VE' : Lang.translate('country_ve'),
        //'VG' : 'Virgin Islands, British',
        //'VI' : 'Virgin Islands, U.S.',
        'VN' : Lang.translate('country_vn'),
        //'VU' : 'Vanuatu',
        //'WF' : 'Wallis And Futuna',
        'WS' : Lang.translate('country_ws'),
        'YE' : Lang.translate('country_ye'),
        //'YT' : 'Mayotte',
        'YU' : Lang.translate('country_yu'),
        'ZA' : Lang.translate('country_za'),
        'ZM' : Lang.translate('country_zm'),
        'ZW' : Lang.translate('country_zw')
    }

    return movie.production_countries ? movie.production_countries.map(a => {
        //let cc = 'country_' + a.iso_3166_1.toLowerCase()
        //return Lang.translate(cc) // FIXME! return a.name as fallback
        if (iso_countries.hasOwnProperty(a.iso_3166_1)) {
          return iso_countries[a.iso_3166_1]
        } else {
          return a.name
        }
    }) : ''
}

function getGenresNameFromIds(card_type, ids){
    let finded = []
    let where  = genres[card_type]
    
    ids.forEach(a=>{
        let find = where.find(i=>i.id == a)

        if(find) finded.push(Utils.capitalizeFirstLetter(Lang.translate(find.title)))
    })

    return finded
}

function clear(){
    network.clear()
}

export default {
    main,
    menu,
    img,
    full,
    list,
    category,
    search,
    clear,
    company,
    person,
    seasons,
    find,
    external_ids,
    get,
    menuCategory,
    discovery,
    parsePG,
    parseCountries,
    genres,
    external_imdb_id,
    getGenresNameFromIds,
    videos
}
