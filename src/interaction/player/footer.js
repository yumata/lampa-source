import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/math'
import Controller from '../controller'
import Api from '../api'
import Arrays from '../../utils/arrays'

let html
let fill
let listener = Subscribe()

function init(){
    html = Template.get('player_footer')

    Controller.add('player_footer',{
        toggle: ()=>{
            Controller.collectionSet(render())
            Controller.collectionFocus(false,render())

            open()
        },
        up: close,
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        gone: ()=>{
            html.find('.selector').removeClass('focus')
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

function appendCard(card){
    let card_html = Template.get('player_footer_card')

    card_html.find('.player-footer-card__title').text(card.name || card.title)
    card_html.find('.player-footer-card__tags').text(card.genres && Arrays.isArray(card.genres) ?card.genres.map(a=>Utils.capitalizeFirstLetter(a.name)).join(', ') : '---')

    let text = card_html.find('.player-footer-card__text')

    if(card.overview) text.text(card.overview)
    else{
        card_html.addClass('notext')

        text.append('<div/><div/><div/>')
    }

    Utils.imgLoad(card_html.find('img'),card.poster_path ? Api.img(card.poster_path, 'w200') : './img/img_broken.svg') 

    html.find('.player-footer__body').append(card_html)

    fill = true
}

function available(){
    return fill
}

function destroy(){
    fill = false

    html.find('.player-footer__body').empty()
}

function render(){
    return html
}

export default {
    init,
    listener,
    appendCard,
    render,
    destroy,
    available
}