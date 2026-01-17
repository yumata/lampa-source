import Api from './api.js'

let loaded_last = {}

function start(call){
    let status = new Lampa.Status(3)
        status.onComplite = ()=>{
            // Сохраняем последние загруженные шоты для фильтрации релевантных
            loaded_last.new     = status.data.new
            loaded_last.popular = status.data.popular

            // Фильтруем просмотренные шоты
            status.data.new     = filterViewed(status.data.new)
            status.data.popular = filterViewed(status.data.popular)

            console.log('Shots', 'roll items', 'new', status.data.new.length, 'popular', status.data.popular.length, 'old', status.data.old.length)

            // Убираем дубли между новыми и популярными и старыми
            status.data.popular = status.data.popular.filter(a=>!status.data.new.find(b=>b.id == a.id))
            status.data.old     = status.data.old.filter(a=>!(status.data.new.find(b=>b.id == a.id) || status.data.popular.find(b=>b.id == a.id)))

            console.log('Shots', 'after filter roll items', 'new', status.data.new.length, 'popular', status.data.popular.length, 'old', status.data.old.length)

            // Собираем итоговый список
            let items = [].concat(status.data.new, status.data.popular)

            // Перемешиваем новые и популярные
            items = Lampa.Arrays.shuffle(items)

            // Добавляем метку from_id для старых шотов
            status.data.old.forEach(a=>a.from_id = a.id)

            // Добавляем релевантные старые шоты
            items = items.concat(filterViewed(filterRelevant(status.data.old)))

            console.log('Shots', 'relevant roll items', items.length)

            // Если нет шотов, добавляем несколько старых
            if(!items.length) items = status.data.old.slice(-5)

            call(items)
        }

    Api.lenta({sort: 'new', limit: 50}, status.append.bind(status, 'new'))
    Api.lenta({sort: 'popular', limit: 50}, status.append.bind(status, 'popular'))
    Api.lenta({sort: 'from_id', id: Lampa.Storage.get('shots_lenta_last_id','0'), limit: 50}, status.append.bind(status, 'old'))
}

function filterRelevant(items){
    return items.filter(a=>!(loaded_last.new.find(b=>b.id == a.id) || loaded_last.popular.find(b=>b.id == a.id)))
}

function filterViewed(items){
    let viewed  = Lampa.Storage.cache('shots_viewed', 2000, [])
    let filtred = items.filter(a=>viewed.indexOf(a.id) == -1)

    return filtred
}

function next(call){
    Api.lenta({sort: 'from_id', id: Lampa.Storage.get('shots_lenta_last_id','0'), limit: 50}, (items)=>call(filterRelevant(items)))
}

function viewedRegister(shot){
    if(!shot.from_id) Lampa.Storage.add('shots_viewed', shot.id)

    Api.shotsViewed(shot.id)
}

function saveFromId(id){
    Lampa.Storage.set('shots_lenta_last_id', id)
}

export default {
    start,
    next,
    viewedRegister,
    saveFromId
}