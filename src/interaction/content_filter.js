import Select from './select'
import Controller from './controller'
import Activity from './activity'
import Lang from '../utils/lang'

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
        }
    ]
}

data.country = {
    title: '#{title_country}',
    items: [{
        title: '#{filter_country_uk}',
        code: 'uk'
    }, {
        title: '#{filter_country_en}',
        code: 'en'
    }, {
        title: '#{filter_country_ru}',
        code: 'ru'
    }, {
        title: '#{filter_country_ja}', 
        code: 'ja'
    }, {
        title: '#{filter_country_ko}', 
        code: 'ko'
    }, {
        title: '#{filter_country_az}',
        code: 'az'
    }, {
        title: '#{filter_country_sq}',
        code: 'sq'
    }, {
        title: '#{filter_country_be}',
        code: 'be'
    }, {
        title: '#{filter_country_bg}',
        code: 'bg'
    }, {
        title: '#{filter_country_de}',
        code: 'de'
    }, {
        title: '#{filter_country_ka}',
        code: 'ka'
    }, {
        title: '#{filter_country_da}',
        code: 'da'
    }, {
        title: '#{filter_country_et}',
        code: 'et'
    }, {
        title: '#{filter_country_ga}',
        code: 'ga'
    }, {
        title: '#{filter_country_es}',
        code: 'es'
    }, {
        title: '#{filter_country_it}',
        code: 'it'
    }, {
        title: '#{filter_country_zh}',
        code: 'zh'
    }, {
        title: '#{filter_country_lv}',
        code: 'lv'
    }, {
        title: '#{filter_country_ne}',
        code: 'ne'
    }, {
        title: '#{filter_country_no}',
        code: 'no'
    }, {
        title: '#{filter_country_pl}',
        code: 'pl'
    }, {
        title: '#{filter_country_ro}',
        code: 'ro'
    }, {
        title: '#{filter_country_sr}',
        code: 'sr'
    }, {
        title: '#{filter_country_sk}',
        code: 'sk'
    }, {
        title: '#{filter_country_sl}',
        code: 'sl'
    }, {
        title: '#{filter_country_tg}',
        code: 'tg'
    }, {
        title: '#{filter_country_tr}',
        code: 'tr'
    }, {
        title: '#{filter_country_uz}',
        code: 'uz'
    }, {
        title: '#{filter_country_fi}',
        code: 'fi'
    }, {
        title: '#{filter_country_fr}',
        code: 'fr'
    }, {
        title: '#{filter_country_hr}',
        code: 'hr'
    }, {
        title: '#{filter_country_cs}',
        code: 'cs'
    }, {
        title: '#{filter_country_sv}',
        code: 'sv'
    }, {
        title: '#{filter_country_et}',
        code: 'et'
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

while (i-=5) {
    let end = y - (99 - i)

    data.year.items.push({
        title: (end + 5)+'-'+end
    })
}

data.country.items.forEach(i=>i.checkbox = true)

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
    },data.type,data.rating,data['genres_'+type],data.country,data.year]

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

function search(){
    Controller.toggle('content')

    let query    = []
    let cat      = data.type.items.find(s=>s.selected).cat
    let type     = cat.indexOf('movie') >= 0 ? 'movie' : 'tv'
    let genres   = []
    let countrys = []

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

    data.country.items.forEach(a=>{
        if(a.checked) countrys.push(a.code)
    })

    data.year.items.forEach(a=>{
        if(a.selected && !a.any){
            let need = type == 'movie' ? 'release_date' : 'air_date'

            query.push(need+'.lte='+a.title.split('-')[0]+'-01-01')
            query.push(need+'.gte='+a.title.split('-')[1]+'-01-01')
        }
    })

    data['genres_'+type].items.forEach(a=>{
        if(a.checked)  genres.push(a.id)
    })

    if(cat == 'multmovie' || cat == 'multtv' && genres.indexOf(16) == -1) genres.push(16)
    
    if(cat == 'movie') query.push('without_genres=16')

    if(genres.length){
        query.push('with_genres='+genres.join(','))
    }

    if(cat == 'anime' && countrys.indexOf('ja') == -1) countrys.push('ja')

    if(countrys.length){
        query.push('with_original_language='+countrys.join('|'))
    }

    let url = 'discover/' + type + '?' + query.join('&')

    let activity = {
        url: url,
        title: Lang.translate('title_filter'),
        component: 'category_full',
        source: 'tmdb',
        card_type: true,
        page: 1
    }

    let object = Activity.active()

    if(object.component == 'category_full' && object.url.indexOf('discover') == 0) Activity.replace(activity)
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