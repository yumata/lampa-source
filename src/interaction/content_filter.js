import Select from './select'
import Controller from './controller'
import Activity from './activity'

let data = {}

data.type = {
    title: 'Тип',
    items: [
        {
            title: 'Фильмы',
            selected: true,
            cat: 'movie'
        },
        {
            title: 'Мультфильмы',
            cat: 'multmovie'
        },
        {
            title: 'Сериалы',
            cat: 'tv'
        },
        {
            title: 'Мультсериалы',
            cat: 'multtv'
        },
        {
            title: 'Аниме',
            cat: 'anime'
        }
    ]
}

data.rating = {
    title: 'Рейтинг',
    items: [
        {
            title: 'Любой',
        },
        {
            title: 'от 0 до 3',
            voite: '0-3'
        },
        {
            title: 'от 3 до 6',
            voite: '3-6'
        },
        {
            title: 'от 6 до 8',
            voite: '6-8'
        },
        {
            title: 'от 8 до 10',
            voite: '8-10'
        }
    ]
}

data.country = {
    title: 'Страна',
    items: [{
        title: 'Украина',
        code: 'uk'
    }, {
        title: 'США',
        code: 'en'
    }, {
        title: 'Россия',
        code: 'ru'
    }, {
        title: 'Япония', 
        code: 'ja'
    }, {
        title: 'Корея', 
        code: 'ko'
    }, {
        title: 'Азербайджан',
        code: 'az'
    }, {
        title: 'Албания',
        code: 'sq'
    }, {
        title: 'Беларусь',
        code: 'be'
    }, {
        title: 'Болгария',
        code: 'bg'
    }, {
        title: 'Германия',
        code: 'de'
    }, {
        title: 'Грузия',
        code: 'ka'
    }, {
        title: 'Дания',
        code: 'da'
    }, {
        title: 'Естония',
        code: 'et'
    }, {
        title: 'Ирландия',
        code: 'ga'
    }, {
        title: 'Испания',
        code: 'es'
    }, {
        title: 'Италия',
        code: 'it'
    }, {
        title: 'Китай',
        code: 'zh'
    }, {
        title: 'Латвия',
        code: 'lv'
    }, {
        title: 'Непал',
        code: 'ne'
    }, {
        title: 'Норвегия',
        code: 'no'
    }, {
        title: 'Польша',
        code: 'pl'
    }, {
        title: 'Румуния',
        code: 'ro'
    }, {
        title: 'Сербия',
        code: 'sr'
    }, {
        title: 'Словакия',
        code: 'sk'
    }, {
        title: 'Словения',
        code: 'sl'
    }, {
        title: 'Таджикистан',
        code: 'tg'
    }, {
        title: 'Турция',
        code: 'tr'
    }, {
        title: 'Узбекистан',
        code: 'uz'
    }, {
        title: 'Финляндия',
        code: 'fi'
    }, {
        title: 'Франция',
        code: 'fr'
    }, {
        title: 'Хорватия',
        code: 'hr'
    }, {
        title: 'Чешская Республика',
        code: 'cs'
    }, {
        title: 'Швеция',
        code: 'sv'
    }, {
        title: 'Эстония',
        code: 'et'
    }]
}

data.genres = {
    title: 'Жанр',
    items: [
        {"id":28,"title":"боевик",checkbox: true},
        {"id":12,"title":"приключения",checkbox: true},
        {"id":16,"title":"мультфильм",checkbox: true},
        {"id":35,"title":"комедия",checkbox: true},
        {"id":80,"title":"криминал",checkbox: true},
        {"id":99,"title":"документальный",checkbox: true},
        {"id":18,"title":"драма",checkbox: true},
        {"id":10751,"title":"семейный",checkbox: true},
        {"id":14,"title":"фэнтези",checkbox: true},
        {"id":36,"title":"история",checkbox: true},
        {"id":27,"title":"ужасы",checkbox: true},
        {"id":10402,"title":"музыка",checkbox: true},
        {"id":9648,"title":"детектив",checkbox: true},
        {"id":10749,"title":"мелодрама",checkbox: true},
        {"id":878,"title":"фантастика",checkbox: true},
        {"id":10770,"title":"телевизионный фильм",checkbox: true},
        {"id":53,"title":"триллер",checkbox: true},
        {"id":10752,"title":"военный",checkbox: true},
        {"id":37,"title":"вестерн",checkbox: true}
    ]
}

data.year = {
    title: 'Год',
    items: [
        {
            title: 'Любой',
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

    where.subtitle = title.length ? title.join(', ') : 'Не выбрано'
}

function main(){
    for(var i in data) selected(data[i])

    let items = [{
        title: 'Начать поиск',
        search: true
    },data.type,data.rating,data.genres,data.country,data.year]

    Select.show({
        title: 'Фильтр',
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
        if(a.selected && a.voite){
            query.push('vote_average.gte='+a.voite.split('-')[0])
            query.push('vote_average.lte='+a.voite.split('-')[1])
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

    data.genres.items.forEach(a=>{
        if(a.checked)  genres.push(a.id)
    })

    if(cat == 'multmovie' || cat == 'multtv' && genres.indexOf(16) == -1) genres.push(16)

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
        title: 'Фильтр',
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