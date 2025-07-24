import Base from './base'
import Items from './module/items'
import Cards from './module/cards'
import More from './module/more'
import Event from './module/event'

const module_map = {
    items: Items,
    cards: Cards,
    more: More,
    event: Event
}

const module_masks = {
    items: ['items'],
    cards: ['items', 'cards', 'more'],
    all: ['items', 'cards', 'more', 'event']
}

class Line extends Base {
    constructor(data, params = {}, modules = 'all') {
        super(data, params)

        let module_keys = []

        if (typeof modules === 'string') {
            module_keys = module_masks[modules] || []
        } 
        else if (Array.isArray(modules)) {
            module_keys = modules
        }

        module_keys.forEach(key => {
            module_map[key] && this.use(module_map[key])
        })

        this.emit('init')
    }
}

export default Line