import Base from './base.js'
import Arrays from '../../../utils/arrays'
import Layer from '../../../utils/layer'
import Platform from '../../../utils/platform'

class Items extends Base {
    constructor(data, params = {}) {
        super(params)

        this.data    = data
        this.tv      = Platform.screen('tv')
        this.items   = []
        this.active  = 0
        this.view    = 7
        this.last
    }

    create(){
        super.create()

        this.data.title && this.html.find('.items-line__title').html(this.data.title)

        this.data.results.slice(0, this.view).forEach(this.append.bind(this))

        this.scroll.onScroll = this.onScroll.bind(this)
    }

    append(element){
        let item = this.item(element)

        this.scroll.append(item.render(true))

        this.items.push(item)

        this.onAppend && this.onAppend(item)

        return item.render(true)
    }

    item(element){}

    onVisible(){
        super.onVisible()

        this.event('visible')
    }

    onScroll(){
        super.onScroll()

        let size = this.tv ? (Math.round(this.active / this.view) + 1) * this.view + 1 : this.data.results.length

        this.data.results.slice(this.items.length, size).forEach(this.append.bind(this))

        Layer.visible(this.scroll.render(true))
    }

    destroy(){
        super.destroy()

        Arrays.destroy(this.items)

        this.event('destroy')
    }
}

export default Items