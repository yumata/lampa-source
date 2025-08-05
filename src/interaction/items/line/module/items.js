import Platform from '../../../../utils/platform'
import Arrays from '../../../../utils/arrays'
import Layer from '../../../../utils/layer'
import Controller from '../../../controller'

class Module{
    onInit(){
        this.tv      = Platform.screen('tv')
        this.items   = []
        this.active  = 0
        this.view    = 7
    }

    onAppend(card, element){
        let render = card.render(true)
        
        render.on('hover:focus', ()=> {
            this.last = render

            let prev_active = this.active

            this.active = this.items.indexOf(card)

            if(this.active > 0 || prev_active > this.active) this.scroll.update(this.items[this.active].render(true), this.params.align_left ? false : true)
        })

        render.on('hover:touch', ()=> {
            this.last = render

            this.active = this.items.indexOf(card)
        })

        render.on('hover:enter', ()=> {
            this.last = render
        })

        render.on('visible', ()=>{
            if(Controller.own(this)) Controller.collectionAppend(render)
        })

        if(element.params.on && typeof element.params.on == 'object'){
            for(let e in element.params.on){
                render.on(e, ()=> {
                    element.params.on[e].call(this, card, element)
                })
            }
        }

        this.scroll.append(render)

        this.items.push(card)
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