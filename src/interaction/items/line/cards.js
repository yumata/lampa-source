import Base from './base.js'
import Controller from '../../controller'
import Card from '../../card'
import Activity from '../../activity'
import Background from '../../background'
import Arrays from '../../../utils/arrays'
import Utils from '../../../utils/math'
import Lang from '../../../utils/lang'
import Layer from '../../../utils/layer'
import Platform from '../../../utils/platform'
import More from './more'

class Cards extends More {
    constructor(data, params = {}) {
        super(data, params)

        this.data = data
        this.view = (this.tv ? (Lampa.Storage.field('interface_size') == 'small' ? 7 : 6) : 12) + (params.align_left ? 4 : 0)
    }

    event(type) {
        Lampa.Listener.send('line', {
            line: this,
            type,
            params: this.params,
            data: this.data,
            scroll: this.scroll,
            body: this.body,
            items: this.items,
            active: this.active
        })
    }

    create(){
        super.create()

        this.event('create')

        this.scroll.body(true).addClass('items-cards')
    }

    append(element){
        super.append(element)

        this.event('append')
    }

    item(element){
        let customClass = this.params.cardClass || element.cardClass

        let cardClass = customClass ? customClass(element, this.params) : new Card(element, this.params)
            cardClass.create()

            cardClass.onFocus = (target, card_data)=>{
                this.last = target

                let prev_active = this.active

                this.active = this.items.indexOf(cardClass)

                if(this.active > 0 || prev_active > this.active) this.scroll.update(this.items[this.active].render(true), this.params.align_left ? false : true)

                if(!this.data.noimage) Background.change(Utils.cardImgBackground(card_data))

                if(this.onFocus) this.onFocus(card_data)
            }

            cardClass.onEnter = (target, card_data)=>{
                this.last = target
                
                if(this.onEnter) this.onEnter(target, card_data)

                if(this.onSelect) return this.onSelect(target, card_data)

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

            cardClass.onHover = (target, card_data)=>{
                if(this.onHover) this.onHover(card_data)
            }

            cardClass.onVisible = ()=>{
                if(Controller.own(this)) Controller.collectionAppend(cardClass.render(true))
            }

            if(this.onMenu) cardClass.onMenu = this.onMenu

            if(this.params.card_events){
                for(let i in this.params.card_events){
                    cardClass[i] = this.params.card_events[i]
                }
            }

        return cardClass
    }

    onVisible(){
        super.onVisible()

        this.event('visible')
    }
}

export default Cards