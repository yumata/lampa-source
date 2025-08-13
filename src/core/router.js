import Activity from '../interaction/activity'
import Storage from '../utils/storage'
import Arrays from '../utils/arrays'
import Lang from '../utils/lang'

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
            return route.callback
        }
        else {
            console.error(`Route "${name}" not found.`)

            return null
        }
    }

    call(name, ...args) {
        const route = this.get(name)

        if (route) {
            let data   = args[0] || {}
            let extend = args.slice(1)
        
            extend.forEach((agr)=>{
                if(Arrays.isObject(agr)){
                    Arrays.extend(data, agr)
                }
            })

            route(data)
        } 
        else {
            console.error(`Cannot call route "${name}" because it does not exist.`)
        }
    }
}

const router = new Router()

router.add('full', (data) => {
    Activity.push({
        url: data.url,
        component: 'full',
        id: data.id,
        method: data.name ? 'tv' : 'movie',
        card: data,
        source: data.source || Storage.field('source')
    })
})

router.add('category_full', (data) => {
    Activity.push({
        url: data.url,
        title: data.title || Lang.translate('title_category'),
        component: 'category_full',
        page: 1,
        source: data.source || Storage.field('source')
    })
})

router.add('favorite', (data) => {
    Activity.push({
        url: data.url || '',
        page: data.page || 1,
        title: data.title || Lang.translate('title_' + data.type),
        component: 'favorite',
        type: data.type,
    })
})

router.add('episodes', (data) => {
    Activity.push({
        url: '',
        title: Lang.translate('title_episodes'),
        component: 'episodes',
        card: data,
        page: 1
    })
})

export default router