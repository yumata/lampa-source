import Select from './select'
import Controller from './controller'
import Activity from './activity'
import Lang from '../utils/lang'
import Storage from '../utils/storage'

let data = {}

data.type = {
    title: '#{title_type}',
    items: [
        {
            title: '#{menu_movies}',
            selected: true,
            cat: 'movie'
        },
        {
            title: '#{menu_multmovie}',
            cat: 'multmovie'
        },
        {
            title: '#{menu_tv}',
            cat: 'tv'
        },
        {
            title: '#{menu_multtv}',
            cat: 'multtv'
        },
        {
            title: '#{menu_anime}',
            cat: 'anime'
        }
    ]
}

data.rating = {
    title: '#{title_rating}',
    items: [
        {
            title: '#{filter_any}',
        },
        {
            title: '#{filter_rating_from} 8',
            start: 8
        },
        {
            title: '#{filter_rating_from} 6',
            start: 6
        },
        {
            title: '#{filter_rating_from} 4',
            start: 4
        },
        {
            title: '#{filter_rating_from} 2',
            start: 2
        },
        {
            title: '#{filter_rating_from} 1 #{filter_rating_to} 3',
            voite: '1-3'
        },
        {
            title: '#{filter_rating_from} 3 #{filter_rating_to} 6',
            voite: '3-6'
        },
        {
            title: '#{filter_rating_from} 6 #{filter_rating_to} 8',
            voite: '6-8'
        },
        {
            title: '#{filter_rating_from} 8 #{filter_rating_to} 9',
            voite: '8-9'
        }
    ]
}

data.pgrating = {
    title: '#{title_pgrating}',
    items: [
        {
            title: '#{filter_any}',
        }
    ]
}

data.language = {
    title: '#{title_language}',
    items: [{
        title: '#{filter_lang_ru}',
        code: 'ru'
    }, {
        title: '#{filter_lang_uk}',
        code: 'uk'
    }, {
        title: '#{filter_lang_en}',
        code: 'en'
    }, {
        title: '#{filter_lang_be}',
        code: 'be'
    }, {
        title: '#{filter_lang_zh}',
        code: 'zh|cn'
    }, {
        title: '#{filter_lang_ja}', 
        code: 'ja'
    }, {
        title: '#{filter_lang_ko}', 
        code: 'ko'
    }, {
        title: '#{filter_lang_af}',
        code: 'af'
    }, {
        title: '#{filter_lang_sq}',
        code: 'sq'
    }, {
        title: '#{filter_lang_ar}',
        code: 'ar'
    }, {
        title: '#{filter_lang_az}',
        code: 'az'
    }, {
        title: '#{filter_lang_hy}',
        code: 'hy'
    }, {
        title: '#{filter_lang_ba}',
        code: 'ba'
    }, {
        title: '#{filter_lang_bg}',
        code: 'bg'
    }, {
        title: '#{filter_lang_bn}',
        code: 'bn'
    }, {
        title: '#{filter_lang_bs}',
        code: 'bs'
    }, {
        title: '#{filter_lang_ca}',
        code: 'ca'
    }, {
        title: '#{filter_lang_ce}',
        code: 'ce'
    }, {
        title: '#{filter_lang_cs}',
        code: 'cs'
    }, {
        title: '#{filter_lang_da}',
        code: 'da'
    }, {
        title: '#{filter_lang_ka}',
        code: 'ka'
    }, {
        title: '#{filter_lang_de}',
        code: 'de'
    }, {
        title: '#{filter_lang_el}',
        code: 'el'
    }, {
        title: '#{filter_lang_es}',
        code: 'es'
    }, {
        title: '#{filter_lang_et}',
        code: 'et'
    }, {
        title: '#{filter_lang_fa}',
        code: 'fa'
    }, {
        title: '#{filter_lang_fi}',
        code: 'fi'
    }, {
        title: '#{filter_lang_fr}',
        code: 'fr'
    }, {
        title: '#{filter_lang_ga}',
        code: 'ga'
    }, {
        title: '#{filter_lang_gl}',
        code: 'gl'
    }, {
        title: '#{filter_lang_gn}',
        code: 'gn'
    }, {
        title: '#{filter_lang_he}',
        code: 'he'
    }, {
        title: '#{filter_lang_hi}',
        code: 'hi'
    }, {
        title: '#{filter_lang_hr}',
        code: 'hr'
    }, {
        title: '#{filter_lang_hu}',
        code: 'hu'
    }, {
        title: '#{filter_lang_id}',
        code: 'id'
    }, {
        title: '#{filter_lang_is}',
        code: 'is'
    }, {
        title: '#{filter_lang_it}',
        code: 'it'
    }, {
        title: '#{filter_lang_kk}',
        code: 'kk'
    }, {
        title: '#{filter_lang_ks}',
        code: 'ks'
    }, {
        title: '#{filter_lang_ku}',
        code: 'ku'
    }, {
        title: '#{filter_lang_ky}',
        code: 'ky'
    }, {
        title: '#{filter_lang_lt}',
        code: 'lt'
    }, {
        title: '#{filter_lang_lv}',
        code: 'lv'
    }, {
        title: '#{filter_lang_mi}',
        code: 'mi'
    }, {
        title: '#{filter_lang_mk}',
        code: 'mk'
    }, {
        title: '#{filter_lang_mn}',
        code: 'mn'
    }, {
        title: '#{filter_lang_mo}',
        code: 'mo'
    }, {
        title: '#{filter_lang_mt}',
        code: 'mt'
    }, {
        title: '#{filter_lang_no}',
        code: 'no|nb|nn'
    }, {
        title: '#{filter_lang_ne}',
        code: 'ne'
    }, {
        title: '#{filter_lang_nl}',
        code: 'nl'
    }, {
        title: '#{filter_lang_pa}',
        code: 'pa'
    }, {
        title: '#{filter_lang_pl}',
        code: 'pl'
    }, {
        title: '#{filter_lang_ps}',
        code: 'ps'
    }, {
        title: '#{filter_lang_pt}',
        code: 'pt'
    }, {
        title: '#{filter_lang_ro}',
        code: 'ro'
    }, {
        title: '#{filter_lang_si}',
        code: 'si'
    }, {
        title: '#{filter_lang_sk}',
        code: 'sk'
    }, {
        title: '#{filter_lang_sl}',
        code: 'sl'
    }, {
        title: '#{filter_lang_sm}',
        code: 'sm'
    }, {
        title: '#{filter_lang_so}',
        code: 'so'
    }, {
        title: '#{filter_lang_sr}',
        code: 'sr'
    }, {
        title: '#{filter_lang_sv}',
        code: 'sv'
    }, {
        title: '#{filter_lang_sw}',
        code: 'sw'
    }, {
        title: '#{filter_lang_ta}',
        code: 'ta'
    }, {
        title: '#{filter_lang_tg}',
        code: 'tg'
    }, {
        title: '#{filter_lang_th}',
        code: 'th'
    }, {
        title: '#{filter_lang_tk}',
        code: 'tk'
    }, {
        title: '#{filter_lang_tr}',
        code: 'tr'
    }, {
        title: '#{filter_lang_tt}',
        code: 'tt'
    }, {
        title: '#{filter_lang_ur}',
        code: 'ur'
    }, {
        title: '#{filter_lang_uz}',
        code: 'uz'
    }, {
        title: '#{filter_lang_vi}',
        code: 'vi'
    }, {
        title: '#{filter_lang_yi}',
        code: 'yi'
    }]
}

data.genres_movie = {
    title: '#{title_genre}',
    items: [
        {"id":28,"title":"#{filter_genre_ac}",checkbox: true},
        {"id":12,"title":"#{filter_genre_ad}",checkbox: true},
        {"id":16,"title":"#{filter_genre_mv}",checkbox: true},
        {"id":35,"title":"#{filter_genre_cm}",checkbox: true},
        {"id":80,"title":"#{filter_genre_cr}",checkbox: true},
        {"id":99,"title":"#{filter_genre_dc}",checkbox: true},
        {"id":18,"title":"#{filter_genre_dr}",checkbox: true},
        {"id":10751,"title":"#{filter_genre_fm}",checkbox: true},
        {"id":14,"title":"#{filter_genre_fe}",checkbox: true},
        {"id":36,"title":"#{filter_genre_hi}",checkbox: true},
        {"id":27,"title":"#{filter_genre_ho}",checkbox: true},
        {"id":10402,"title":"#{filter_genre_mu}",checkbox: true},
        {"id":9648,"title":"#{filter_genre_de}",checkbox: true},
        {"id":10749,"title":"#{filter_genre_md}",checkbox: true},
        {"id":878,"title":"#{filter_genre_fa}",checkbox: true},
        {"id":10770,"title":"#{filter_genre_tv}",checkbox: true},
        {"id":53,"title":"#{filter_genre_tr}",checkbox: true},
        {"id":10752,"title":"#{filter_genre_mi}",checkbox: true},
        {"id":37,"title":"#{filter_genre_ve}",checkbox: true}
    ]
}

data.genres_tv = {
    title: '#{title_genre}',
    items: [
        {"id": 10759,"title": "#{filter_genre_aa}",checkbox: true},
        {"id": 16,"title": "#{filter_genre_mv}",checkbox: true},
        {"id": 35,"title": "#{filter_genre_cm}",checkbox: true},
        {"id": 80,"title": "#{filter_genre_cr}",checkbox: true},
        {"id": 99,"title": "#{filter_genre_dc}",checkbox: true},
        {"id": 18,"title": "#{filter_genre_dr}",checkbox: true},
        {"id": 10751,"title": "#{filter_genre_fm}",checkbox: true},
        {"id": 10762,"title": "#{filter_genre_ch}",checkbox: true},
        {"id": 9648,"title": "#{filter_genre_de}",checkbox: true},
        {"id": 10763,"title": "#{filter_genre_nw}",checkbox: true},
        {"id": 10764, "title": "#{filter_genre_rs}",checkbox: true},
        {"id": 10765,"title": "#{filter_genre_hf}",checkbox: true},
        {"id": 10766,"title": "#{filter_genre_op}",checkbox: true},
        {"id": 10767,"title": "#{filter_genre_tc}",checkbox: true},
        {"id": 10768,"title": "#{filter_genre_mp}",checkbox: true},
        {"id": 37,"title": "#{filter_genre_ve}",checkbox: true}
    ]
}

data.year = {
    title: '#{title_year}',
    items: [
        {
            title: '#{filter_any}',
            any: true
        }
    ]
}

let i = 100,
    y = (new Date()).getFullYear()

for(let a = 0; a < 5; a++) {
    data.year.items.push({
        title: y - a
    })
}

while (i-=5) {
    let end = y - (99 - i)

    data.year.items.push({
        title: (end + 5)+'-'+end
    })
}

for(let a = 18; a >= 0; a-=3){
    data.pgrating.items.push({
        title: a + '+',
        pg: a
    })
}

for(let a = 15; a >= 0; a-=3){
    data.pgrating.items.push({
        title: '#{filter_rating_from} '+a+' #{filter_rating_to} '+(a+3),
        pg: a + '-' + (a+3)
    })
}


data.language.items.forEach(i=>i.checkbox = true)

function select(where, a){
    where.forEach(element => {
        element.selected = false
    })

    a.selected = true
}

function selected(where){
    let title = []

    where.items.forEach((a)=>{
        if(a.selected || a.checked) title.push(a.title)
    })

    where.subtitle = title.length ? title.join(', ') : Lang.translate('nochoice')
}

function main(){
    for(var i in data) selected(data[i])

    let cat  = data.type.items.find(s=>s.selected).cat
    let type = cat.indexOf('movie') >= 0 ? 'movie' : 'tv'

    let items = [{
        title: Lang.translate('search_start'),
        search: true
    },data.type,data.rating,data['genres_'+type],data.language,data.year]

    if(Storage.field('source') == 'cub') items.push(data.pgrating)

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
            let need = type == 'movie' ? 'release_date' : 'air_date'

            if(a.title.indexOf('-') >= 0){
                query.push(need+'.lte='+a.title.split('-')[0]+'-01-01')
                query.push(need+'.gte='+a.title.split('-')[1]+'-01-01')
            }
            else{
                query.push(need+'.gte='+a.title+'-01-01')
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


function queryForCUB(){
    let query    = []
    let cat      = data.type.items.find(s=>s.selected).cat
    let type     = cat.indexOf('movie') >= 0 ? 'movie' : 'tv'
    let genres   = []
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
        if(a.checked) languages.push(a.code)
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

    if(cat == 'multmovie' || cat == 'multtv' && genres.indexOf(16) == -1) genres.push(16)

    if(cat == 'movie' || cat == 'tv') query.push('without_genres=16')

    if(genres.length){
        query.push('genre='+genres.join(','))
    }

    if(cat == 'anime') type = 'anime'

    if(languages.length){
        query.push('language='+languages.join(','))
    }

    return '?cat=' + type + '&' + query.join('&')
}

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

    if(object.component == 'category_full' && (object.url.indexOf('discover') == 0 || object.url.indexOf('?cat=') == 0)) Activity.replace(activity)
    else Activity.push(activity)
}

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

function show(){
    main()
}

export default {
    show
}