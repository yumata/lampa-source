import Platform from '../../../../core/platform'
import Arrays from '../../../../utils/arrays'
import Layer from '../../../../core/layer'
import Controller from '../../../../core/controller'
import MoreFirst from './more_first'

export default {
    onInit: function(){
        this.tv      = Platform.screen('tv')
        this.items   = []
        this.active  = 0
        this.view    = this.params.items.view
    },

    onAppend: function(item, element){
        let render = item.render(true)
        
        render.on('hover:focus', ()=> {
            this.last = render

            let prev_active = this.active

            this.active = this.items.indexOf(item)

            if(this.active > 0 || prev_active > this.active) this.scroll.update(this.items[this.active].render(true), this.params.items.align_left ? false : true)
            
            this.emit('active', item, element)
        })

        render.on('hover:touch', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)

            this.emit('active', item, element)
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
                    element.params.on[e].call(this, item, element)
                })
            }
        }

        this.scroll.append(render)

        this.items.push(item)

        this.emit('push', item, element)
    },

    onCreate: function(){
        this.scroll.body(true).addClass('mapping--' + this.params.items.mapping)

        this.scroll.onScroll = this.emit.bind(this, 'scroll')

        this.data.results.slice(0, this.view).forEach(this.emit.bind(this, 'createAndAppend'))
    },

    onScroll: function(){
        let size  = this.tv ? (Math.round(this.active / this.view) + 1) * this.view + 1 : this.data.results.length
        let start = this.items.length

        if(this.has(MoreFirst)) start -= 1
        
        this.data.results.slice(start, size).forEach(this.emit.bind(this, 'createAndAppend'))

        Layer.visible(this.scroll.render(true))
    },

    onDestroy: function(){
        Arrays.destroy(this.items)
    }
}