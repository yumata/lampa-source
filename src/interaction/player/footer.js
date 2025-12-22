import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/utils'
import Controller from '../../core/controller'
import Api from '../../core/api/api'
import Arrays from '../../utils/arrays'
import Scroll from '../../interaction/scroll'
import Modal from '../modal'
import Constructor from '../constructor'

class Row extends Constructor({}) {}

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

function appendRow(element){
    let row = new Row({})

    row.use({
        onCreate(){
            this.html.append(element)
            this.html.addClass('player-footer__row')
        },
        onToggle(){
            Controller.add('player_footer_element',{
                toggle: ()=>{
                    Controller.collectionSet(this.html)
                    Controller.collectionFocus(false, this.html)
                },
                up: this.emit.bind(this, 'up'),
                down: this.emit.bind(this, 'down'),
                right: ()=>{
                    Navigator.move('right')
                },
                left: ()=>{
                    Navigator.move('left')
                },
                back: this.emit.bind(this, 'back')
            })

            Controller.toggle('player_footer_element')
        }
    })

    appendClass(row)
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
    classElement.use({
        onUp: up,
        onDown: down,
        onToggle: function(){
            scroll.render(true).style.height = this.render(true).offsetHeight
        },
        onEnter: ()=>{
            close()

            if($('.modal').length) Modal.close()

            Lampa.Player.close()
        },
        onBack: close
    })

    classElement.create()

    scroll.append(classElement.render(true))

    items.push(classElement)
}

function appendAbout(card){
    let card_html = Template.js('player_footer_card')

    let tags    = []
    let relise  = (card.release_date || card.first_air_date || '') + ''
    let year    = relise ? relise.slice(0,4) : ''

    if(year) tags.push(year)

    if(card.genres && Arrays.isArray(card.genres)){
        tags.push(card.genres.map(a=>Utils.capitalizeFirstLetter(a.name)).join(', '))
    }

    card_html.find('.player-footer-card__title').text(card.name || card.title)
    card_html.find('.player-footer-card__tags').text(tags.length ? tags.join(' - ') : '---')

    let text = card_html.find('.player-footer-card__text')

    if(card.overview) text.text(card.overview)
    else{
        card_html.addClass('notext')

        for(let i = 0; i < 3; i++){
            text.append(document.createElement('div'))
        }
    }

    Utils.imgLoad(card_html.find('img'),card.poster_path ? Api.img(card.poster_path, 'w200') : './img/img_broken.svg') 

    appendRow(card_html)
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
    appendAbout,
    appendRow,
    render,
    destroy,
    available
}