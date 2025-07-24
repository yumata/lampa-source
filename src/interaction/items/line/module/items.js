import Platform from '../../../../utils/platform'
import Arrays from '../../../../utils/arrays'
import Layer from '../../../../utils/layer'

class Module{
    onInit(){
        this.tv      = Platform.screen('tv')
        this.items   = []
        this.active  = 0
        this.view    = 7
    }

    onCreate(){
        this.scroll.onScroll = this.emit.bind(this, 'scroll')

        this.data.results.slice(0, this.view).forEach(this.emit.bind(this, 'createAndAppend'))
    }

    onScroll(){
        let size = this.tv ? (Math.round(this.active / this.view) + 1) * this.view + 1 : this.data.results.length
        
        this.data.results.slice(this.items.length, size).forEach(this.emit.bind(this, 'createAndAppend'))

        Layer.visible(this.scroll.render(true))
    }

    onDestroy(){
        Arrays.destroy(this.items)
    }
}

export default Module