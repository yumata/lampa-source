import Base from './base'
import Icons from './module/icons'
import Ratting from './module/ratting'
import Release from './module/release'
import Favorite from './module/favorite'
import Watched from './module/watched'
import Style from './module/style'
import Wide from './module/wide'
import Menu from './module/menu'
import Callback from './module/callback'
import Plugins from './module/plugins'

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

class Card extends Base {
    constructor(data, params = {}) {
        super(data, params)

        let keys = [];

        if (typeof options === 'string') {
            keys = ModuleMasks[options] || [];
        } else if (Array.isArray(options)) {
            keys = options;
        } else if (typeof options === 'object') {
            const maskKeys = ModuleMasks[options.mask] || [];
            keys = [...new Set([...maskKeys, ...(options.extra || [])])];
        }

        keys.forEach(key => {
            module_map[key] && this.use(module_map[key])
        })

        this.use(Menu)
        this.use(Ratting)
        this.use(Release)
        this.use(Plugins)
        this.use(Favorite)
        this.use(Watched)
        this.use(Style)
        this.use(Wide)
        this.use(Icons)
        this.use(Callback)

        this.emit('init')
    }
}

export default Card