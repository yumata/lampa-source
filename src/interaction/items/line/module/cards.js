import Card from '../../../card/full'
import Activity from '../../../activity'
import Background from '../../../background'
import Controller from '../../../controller'
import Utils from '../../../../utils/math'
import Lang from '../../../../utils/lang'

class Module{
    onCreate(){
        this.scroll.body(true).addClass('items-cards')
    }

    onCreateAndAppend(element){
        let card = this.params.cardClass ? this.params.cardClass(element, this.params) : element.cardClass ? element.cardClass(element, this.params) : new Card(element, this.params)
            card.create()

            card.onFocus = (target, card_data)=>{
                this.last = target

                let prev_active = this.active

                this.active = this.items.indexOf(card)

                if(this.active > 0 || prev_active > this.active) this.scroll.update(this.items[this.active].render(true), this.params.align_left ? false : true)

                if(!this.data.noimage) Background.change(Utils.cardImgBackground(card_data))

                if(this.onFocus) this.onFocus(card_data)
            }

            card.onEnter = (target, card_data)=>{
                this.last = target
                
                if(this.onEnter) this.onEnter(target, card_data)

                if(this.onSelect)  return this.onSelect(target, card_data)

                if(!card_data.source) card_data.source = this.params.object.source

                if(typeof card_data.gender !== 'undefined'){
                    Activity.push({
                        url: card_data.url,
                        title: Lang.translate('title_person'),
                        component: 'actor',
                        id: card_data.id,
                        source: card_data.source || this.params.object.source
                    })
                }
                else{
                    Activity.push({
                        url: card_data.url,
                        component: 'full',
                        id: card_data.id,
                        method: card_data.name ? 'tv' : 'movie',
                        card: card_data,
                        source: card_data.source || this.params.object.source
                    })
                }
            }

            card.onHover = (target, card_data)=>{
                if(this.onHover) this.onHover(card_data)
            }

            card.onVisible = ()=>{
                if(Controller.own(this)) Controller.collectionAppend(card.render(true))
            }

            if(this.onMenu) card.onMenu = this.onMenu

            if(this.params.card_events){
                for(let i in this.params.card_events){
                    card[i] = this.params.card_events[i]
                }
            }

        this.scroll.append(card.render(true))

        this.items.push(card)

        if(this.onAppend) this.onAppend(card)

        this.emit('append', card)
    }
}

export default Module