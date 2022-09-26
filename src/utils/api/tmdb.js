import Reguest from '../reguest'
import Arrays from '../arrays'
import Storage from '../storage'
import Status from '../status'
import Favorite from '../../utils/favorite'
import Recomends from '../../utils/recomend'
import VideoQuality from '../video_quality'
import Lang from '../lang'
import Activity from '../../interaction/activity'
import TMDB from '../tmdb'
import Utils from '../math'


let network   = new Reguest()
let menu_list = []

function url(u, params = {}){
    u = add(u, 'api_key='+TMDB.key())
    u = add(u, 'language='+Storage.field('tmdb_lang'))

    if(params.genres)  u = add(u, 'with_genres='+params.genres)
    if(params.page)    u = add(u, 'page='+params.page)
    if(params.query)   u = add(u, 'query='+params.query)

    if(params.filter){
        for(let i in params.filter){
            u = add(u, i+'='+params.filter[i])
        }
    }

    return TMDB.api(u)
}

function add(u, params){
    return u + (/\?/.test(u) ? '&' : '?') + params;
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
        append(Lang.translate('title_now_watch'),'wath', json)

        VideoQuality.add(json.results)
    },status.error.bind(status))

    get('trending/movie/day',params,(json)=>{
        append(Lang.translate('title_trend_day'),'trend_day', json)
    },status.error.bind(status))

    get('trending/movie/week',params,(json)=>{
        append(Lang.translate('title_trend_week'),'trend_week', json)
    },status.error.bind(status))

    get('movie/upcoming',params,(json)=>{
        append(Lang.translate('title_upcoming'),'upcoming', json)
    },status.error.bind(status))

    get('movie/popular',params,(json)=>{
        append(Lang.translate('title_popular_movie'),'popular', json)

        VideoQuality.add(json.results)
    },status.error.bind(status))

    get('tv/popular',params,(json)=>{
        append(Lang.translate('title_popular_tv'),'popular_tv', json)
    },status.error.bind(status))

    get('movie/top_rated',params,(json)=>{
        append(Lang.translate('title_top_movie'),'top', json)
    },status.error.bind(status))

    get('tv/top_rated',params,(json)=>{
        append(Lang.translate('title_top_tv'),'top_tv', json)
    },status.error.bind(status))
}

function category(params = {}, oncomplite, onerror){
    let show     = ['movie','tv'].indexOf(params.url) > -1 && !params.genres
    let quality  = ['movie'].indexOf(params.url) > -1 && !params.genres
    let books    = show ? Favorite.continues(params.url) : []
    let recomend = show ? Arrays.shuffle(Recomends.get(params.url)).slice(0,19) : []
    
    let status = new Status(6)

    status.onComplite = ()=>{
        let fulldata = []

        if(books.length) fulldata.push({results: books,title: params.url == 'tv' ? Lang.translate('title_continue') : Lang.translate('title_watched')})
        if(recomend.length) fulldata.push({results: recomend,title: Lang.translate('title_recomend_watch')})

        if(status.data.continue && status.data.continue.results.length)      fulldata.push(status.data.continue)
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
        append(Lang.translate('title_now_watch'),'wath', json)

        if(quality) VideoQuality.add(json.results)
    },status.error.bind(status))

    get(params.url+'/popular',params,(json)=>{
        append(Lang.translate('title_popular'),'popular', json)

        if(quality) VideoQuality.add(json.results)
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

        append(Lang.translate('title_new'),'new', json)
    },status.error.bind(status))

    get(params.url+'/airing_today',params,(json)=>{
        append(Lang.translate('title_tv_today'),'tv_today', json)
    },status.error.bind(status))

    get(params.url+'/on_the_air',params,(json)=>{
        append(Lang.translate('title_this_week'),'tv_air', json)
    },status.error.bind(status))

    get(params.url+'/top_rated',params,(json)=>{
        append(Lang.translate('title_in_top'),'top', json)
    },status.error.bind(status))
}

function full(params = {}, oncomplite, onerror){
    let status = new Status(7)
        status.onComplite = oncomplite

    get(params.method+'/'+params.id+'?append_to_response=content_ratings,release_dates',params,(json)=>{
        json.source = 'tmdb'
        
        if(params.method == 'tv'){
            let season = Utils.countSeasons(json)

            get('tv/'+json.id+'/season/'+season,{},(ep)=>{
                status.append('episodes', ep)
            },status.error.bind(status))
        }
        else status.need--

        if(json.belongs_to_collection){
            get('collection/'+json.belongs_to_collection.id,{},(collection)=>{
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
        get(params.method+'/'+params.id+'/credits',params,(json)=>{
            status.append('persons', json)
        },status.error.bind(status))

        get(params.method+'/'+params.id+'/recommendations',params,(json)=>{
            status.append('recomend', json)
        },status.error.bind(status))

        get(params.method+'/'+params.id+'/similar',params,(json)=>{
            status.append('simular', json)
        },status.error.bind(status))
    }

    get(params.method+'/'+params.id+'/videos',params,(json)=>{
        status.append('videos', json)
    },status.error.bind(status))
}

function list(params = {}, oncomplite, onerror){
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

function search(params = {}, oncomplite){
    let status = new Status(2)
        status.onComplite = (data)=>{
            let items = []

            if(data.movie && data.movie.results.length) items.push(data.movie)
            if(data.tv && data.tv.results.length) items.push(data.tv)

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
}

function discovery(){
    return {
        title: 'TMDB',
        search: search,
        params: {
            align_left: true,
            object: {
                source: 'tmdb'
            }
        },
        onMore: (params)=>{
            Activity.push({
                url: 'search/' + params.data.type,
                title: Lang.translate('search') + ' - ' + params.query,
                component: 'category_full',
                page: 2,
                query: encodeURIComponent(params.query),
                source: 'tmdb'
            })
        },
        onCancel: network.clear.bind(network)
    }
}

function person(params = {}, oncomplite, onerror){
    const sortCredits = (credits) => {
        return credits
            .map((a) => {
                a.year = parseInt(((a.release_date || a.first_air_date || '0000') + '').slice(0,4))
                return a;
            })
            .sort((a, b) => b.vote_average - a.vote_average && b.vote_count - a.vote_count) //сортируем по оценке и кол-ву голосов (чтобы отсечь мусор с 1-2 оценками)
    }

    const convert = (credits, person) => {
        credits.crew.forEach(a=>{
            a.department = a.department == 'Production' ? Lang.translate('full_production') : a.department == 'Directing' ? Lang.translate('full_directing') : a.department 
        })

        let cast = sortCredits(credits.cast),
            crew = sortCredits(credits.crew),
            tv = sortCredits(cast.filter(media => media.media_type === 'tv')),
            movie = sortCredits(cast.filter(media => media.media_type === 'movie')),
            knownFor;

        //Наиболее известные работы человека
        //1. Группируем все работы по департаментам (Актер, Режиссер, Сценарист и т.д.)
        knownFor = Arrays.groupBy(crew, 'department');
        let actorGender = person.gender === 1 ? Lang.translate('title_actress') : Lang.translate('title_actor');
        if(movie.length > 0) knownFor[`${actorGender} - ` + Lang.translate('menu_movies')] = movie;
        if(tv.length > 0) knownFor[`${actorGender} - ` + Lang.translate('menu_tv')] = tv;

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
        }).sort((a, b) => b.vote_count - a.vote_count);

        return {
            raw: credits, cast, crew, tv, movie, knownFor
        }
    }

    let status = new Status(2)
        status.onComplite = ()=>{
            let fulldata = {}

            if(status.data.person) fulldata.person = status.data.person

            if(status.data.credits) fulldata.credits = convert(status.data.credits, status.data.person)

            oncomplite(fulldata)
        }

    get('person/'+params.id,params,(json)=>{
        status.append('person', json)
    },status.error.bind(status))

    get('person/'+params.id+'/combined_credits',params,(json)=>{
        status.append('credits', json)
    },status.error.bind(status))
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
    get('tv/'+params.id+'/external_ids', oncomplite, onerror)
}

function company(params = {}, oncomplite, onerror){
    let u = url('company/'+params.id,params)

    network.silent(u,oncomplite, onerror)
}

function seasons(tv, from, oncomplite){
    let status = new Status(from.length)
        status.onComplite = oncomplite

    from.forEach(season => {
        get('tv/'+tv.id+'/season/'+season,{},(json)=>{
            status.append(''+season, json)
        },status.error.bind(status))
    })
}

function screensavers(oncomplite, onerror) {
    get('trending/all/week', {page: Math.round(Math.random() * 30)}, (json) => {
        oncomplite(json.results.filter(entry => entry.backdrop_path && !entry.adult));
    }, onerror)
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
    
    if(movie.release_dates && !pg){
        let find = movie.release_dates.results.find(a=>a.iso_3166_1 == cd.toUpperCase())

        if(!find) find = movie.release_dates.results.find(a=>a.iso_3166_1 == 'US')

        if(find && find.release_dates.length){
            pg = Utils.decodePG(find.release_dates[0].certification)
        }
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

    return movie.production_countries.map(a => {
        //let cc = 'country_' + a.iso_3166_1.toLowerCase()
        //return Lang.translate(cc) // FIXME! return a.name as fallback
        if (iso_countries.hasOwnProperty(a.iso_3166_1)) {
          return iso_countries[a.iso_3166_1]
        } else {
          return a.name
        }
    })
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
    screensavers,
    external_ids,
    get,
    menuCategory,
    discovery,
    parsePG,
    parseCountries
}
