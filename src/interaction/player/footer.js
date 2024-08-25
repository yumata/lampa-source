import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/math'
import Controller from '../controller'
import Api from '../api'
import Arrays from '../../utils/arrays'
import Scroll from '../../interaction/scroll'
import Line from '../items/line'

let html
let scroll
let active   = 0
let items    = []
let listener = Subscribe()

function init(){
    html = Template.js('player_footer')

    scroll = new Scroll({nopadding: true, over: true})

    scroll.onWheel = (step)=>{
        if(step > 0) down()
        else if(active > 0) up()
    }

    html.find('.player-footer__body').append(scroll.render(true))

    Controller.add('player_footer',{
        toggle: ()=>{
            items[active].toggle()

            open()
        },
        up: close,
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        back: close
    })
}

function open(){
    html.addClass('open')

    listener.send('open')
}

function close(){
    html.removeClass('open')

    listener.send('close')
}

function appendElement(element){
    let classElement = new function(){
        let div = document.createElement('div')
            div.append(element)

        this.toggle = function(){
            Controller.add('player_footer_element',{
                toggle: ()=>{
                    Controller.collectionSet(div)
                    Controller.collectionFocus(false,div)

                    this.onToggle()
                },
                up: this.onUp,
                down: this.onDown,
                right: ()=>{
                    Navigator.move('right')
                },
                left: ()=>{
                    Navigator.move('left')
                },
                back: this.onBack
            })

            Controller.toggle('player_footer_element')
        }

        this.render = function(){
            return div
        }

        this.destroy = function(){
            div.remove()
        }
    }

    appendClass(classElement)
}

function up(){
    active--

    if(active < 0){
        active = 0

        close()
    }
    else{
        items[active].toggle()

        scroll.update(items[active].render(true))
    }
}

function down(){
    active++

    active = Math.min(active, items.length - 1)

    scroll.update(items[active].render(true))

    items[active].toggle()
}

function appendClass(classElement){
    classElement.onUp   = up
    classElement.onDown = down

    classElement.onToggle = ()=>{
        scroll.render(true).style.height = items[active].render(true).offsetHeight
    }

    classElement.onEnter = ()=>{
        close()

        Lampa.Player.close()
    }

    classElement.onBack = close
    classElement.onLeft = ()=>{}
    classElement.onMenu = ()=>{}

    scroll.append(classElement.render(true))

    items.push(classElement)
}

function appendCard(card){
    let card_html = Template.js('player_footer_card')

    card_html.find('.player-footer-card__title').text(card.name || card.title)
    card_html.find('.player-footer-card__tags').text(card.genres && Arrays.isArray(card.genres) ?card.genres.map(a=>Utils.capitalizeFirstLetter(a.name)).join(', ') : '---')

    let text = card_html.find('.player-footer-card__text')

    if(card.overview) text.text(card.overview)
    else{
        card_html.addClass('notext')

        for(let i = 0; i < 3; i++){
            text.append(document.createElement('div'))
        }
    }

    Utils.imgLoad(card_html.find('img'),card.poster_path ? Api.img(card.poster_path, 'w200') : './img/img_broken.svg') 

    appendElement(card_html)
}

function appendContinue(element){
    element.results.forEach(e => {
        e.ready = false
    })

    let item = new Line(element, {
        url: element.url,
        object: {},
        card_wide: element.wide,
        card_small: element.small,
        card_broad: element.broad,
        card_collection: element.collection,
        card_category: element.category,
        card_events: element.card_events,
        cardClass: element.cardClass,
        nomore: element.nomore,
        type: element.line_type || 'cards'
    })

    appendClass(item)

    item.create()
}


function available(){
    return items.length
}

function destroy(){
    Arrays.destroy(items)

    active = 0

    scroll.reset()

    items = []
}

function render(){
    return html
}

export default {
    init,
    listener,
    appendCard,
    appendContinue,
    render,
    destroy,
    available
}