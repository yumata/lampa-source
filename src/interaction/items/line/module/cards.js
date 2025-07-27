import Card from '../../../card/full'
import Background from '../../../background'
import Controller from '../../../controller'
import Utils from '../../../../utils/math'
import Arrays from '../../../../utils/arrays'

class Module{
    onCreate(){
        this.scroll.body(true).addClass('items-cards')
    }

    onCreateAndAppend(element){
        let card = Utils.createInstance(Card, element)

        this.emit('instance', card, element)
        
        card.create()

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

        this.emit('append', card, element)
    }
}

export default Module