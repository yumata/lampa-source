import Activity from '../interaction/activity/activity'
import Storage from './storage/storage'
import Arrays from '../utils/arrays'
import Lang from './lang'

class Router {
    constructor() {
        this.routes = []
    }

    add(name, callback) {
        if (typeof name === 'string' && typeof callback === 'function') {
            this.routes.push({ name, callback })
        } 
        else {
            console.error('Invalid route definition. Expected a string and a function.')
        }
    }

    get(name) {
        const route = this.routes.find(route => route.name === name)

        if (route) {
            return route
        }
        else {
            console.error(`Route "${name}" not found.`)

            return null
        }
    }

    call(name, data) {
        const route = this.get(name)

        if (route) {
            let push = route.callback(data)

            Arrays.extend(push, {
                url: data.url || '',
                component: route.name,
                source: data.source || Storage.field('source'),
                page: data.page || 1
            })

            Activity.push(push)
        } 
        else {
            console.error(`Cannot call route "${name}" because it does not exist.`)
        }
    }
}

const router = new Router()

router.add('full', (data) => ({
    id: data.id,
    method: data.name ? 'tv' : 'movie',
    card: data
}))

router.add('category_full', (data) => ({
    genres: data.genres || '',
    keywords: data.keywords || '',
    query: data.query || '',
    filter: data.filter || '',
    title: data.title || Lang.translate('title_category')
}))

router.add('category', (data) => ({
    ...data,
    title: data.title || Lang.translate('title_category')
}))

router.add('favorite', (data) => ({
    title: data.title || Lang.translate('title_' + data.type),
    type: data.type,
    filter: data.filter || '',
}))

router.add('episodes', (data) => ({
    title: Lang.translate('title_episodes'),
    card: data
}))

router.add('discuss', (data) => ({
    card: data,
    id: data.id,
    method: data.name ? 'tv' : 'movie',
    page: data.page || 2
}))

router.add('company', (data) => ({
    url: data.url || (data.card.name ? 'tv': 'movie'),
    id: data.id,
    source: data.card.source,
    title: Lang.translate('title_company')
}))

router.add('actor', (data) => ({
    id: data.id
}))

export default router