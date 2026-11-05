import Api from './api.js'

let roll_next = (call)=>call([])

function start(call){
    let status = new Lampa.Status(3)
        status.onComplite = ()=>{
            // Курсор считаем только по хронологической части, в популярных могут быть старые id
            let cursor = minId(status.data.old)

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

            // Добавляем старые шоты
            items = items.concat(status.data.old)

            console.log('Shots', 'relevant roll items', items.length)

            roll_next = pager({limit: 50}, items, cursor)

            // Если нет шотов, сразу идем дальше, вплоть до уже просмотренных
            if(!items.length) return roll_next(call)

            call(items)
        }

    Api.lenta({sort: 'new', limit: 50}, status.append.bind(status, 'new'))
    Api.lenta({sort: 'popular', limit: 50}, status.append.bind(status, 'popular'))
    Api.lenta({sort: 'from_id', id: 0, limit: 50}, status.append.bind(status, 'old'))
}

function minId(items){
    return items.length ? Math.min.apply(null, items.map(a=>a.id)) : 0
}

function filterViewed(items){
    let viewed  = Lampa.Storage.cache('shots_viewed', 2000, [])
    let filtred = items.filter(a=>viewed.indexOf(a.id) == -1)

    return filtred
}

// Загрузка по курсору: сначала все непросмотренные, затем по второму кругу уже просмотренные.
// Курсор живет только в рамках ленты, поэтому при следующем запуске ничего не теряется.
function pager(query, loaded = [], cursor = minId(loaded)){
    let known       = {}
    let with_viewed = false
    let ended       = false

    loaded.forEach(a=>known[a.id] = true)

    function next(call){
        if(ended) return call([])

        let params = Object.assign({}, query, {sort: 'from_id', id: cursor})

        if(with_viewed) params.with_viewed = 1

        Api.lenta(params, (items)=>{
            if(!items.length){
                if(with_viewed){
                    ended = true

                    return call([])
                }

                with_viewed = true
                cursor      = 0

                return next(call)
            }

            cursor = minId(items)

            let fresh = items.filter(a=>!known[a.id])

            if(!fresh.length) return next(call)

            fresh.forEach(a=>known[a.id] = true)

            call(fresh)
        }, ()=>{
            call([])
        })
    }

    return next
}

function next(call){
    roll_next(call)
}

function viewedRegister(shot){
    Lampa.Storage.add('shots_viewed', shot.id)

    Api.shotsViewed(shot.id)
}

function skipRegister(shot){
    Lampa.Storage.add('shots_viewed', shot.id)

    Api.shotsSkipped(shot.id)
}

export default {
    start,
    next,
    pager,
    viewedRegister,
    skipRegister
}
