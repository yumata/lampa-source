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

class Card extends Base {
    constructor(data, params = {}) {
        super(data, params)

        this.use(Menu)
        this.use(Ratting)
        this.use(Release)
        this.use(Favorite)
        this.use(Watched)
        this.use(Style)

        this.params.card_wide && this.use(Wide)

        this.use(Icons)
        this.use(Callback)

        this.emit('init')
    }
}

export default Card