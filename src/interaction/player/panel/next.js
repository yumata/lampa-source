import Playlist from '../playlist'
import Template from '../../template'
import Utils from '../../../utils/utils'
import Lang from '../../../core/lang'
import Apex from './apex'

/**
 * Отрисовка следующего эпизода в плеере
 */
function init(){
    Playlist.listener.follow('set',(e)=>{
        clear()

        let next = e.playlist[e.position + 1]

        if(next) draw(next)
    })
}

/**
 * Отрисовка следующего эпизода
 * @param {Object} item - Данные следующего эпизода
 * @param {string} item.title - Название эпизода
 * @param {string} item.thumbnail - URL миниатюры эпизода
 * @param {string} item.episode - Номер эпизода
 */
function draw(item){
    let content = []

    if(item.thumbnail){
        let thumbnail = Template.elem('div', {class: 'player-next__thumbnail', children: [
            Template.elem('img', {class: 'player-next__thumbnail-img'})
        ]})

        Utils.imgLoad(thumbnail.find('img'), item.thumbnail, ()=>{
            thumbnail.addClass('loaded')
        })

        content.push(thumbnail)
    }

    let body = Template.elem('div', {class: 'player-next__body', children: [
        Template.elem('div', {class: 'player-next__title', text: Lang.translate('player_segments_next')}),
        Template.elem('div', {class: 'player-next__episode-title', text: item.title})
    ]})

    content.push(body)

    let box = Template.elem('div', {class: 'player-next', children: [
        Template.elem('div', {class: 'player-next__episode', children: content})
    ]})

    Apex.push('left', box)
}

function clear(){
    Apex.render('left').find('.player-next').remove()
}

function destroy(){
    clear()
}

export default {
    init,
    destroy
}