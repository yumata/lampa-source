import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/math'
import Reguest from '../../utils/reguest'
import Lang from '../../utils/lang'
import Storage from '../../utils/storage'

let html
let listener = Subscribe()
let network  = new Reguest()
let elems

let error, stat_timer

function init(){
    html = Template.get('player_info')
    
    elems = {
        name:  $('.player-info__name',html),
        size:  $('.value--size span',html),
        stat:  $('.value--stat span',html),
        speed: $('.value--speed span',html),
        error: $('.player-info__error',html)
    }

    Utils.time(html)
}

/**
 * Установить значение
 * @param {string} need
 * @param {string|{width,height}} value 
 */
function set(need, value){
    if(need == 'name')      elems.name.html(value)
    else if(need == 'size' && value.width && value.height) elems.size.text(value.width + 'x' + value.height)
    else if(need == 'error') {
        clearTimeout(error)

        elems.error.removeClass('hide').text(value)

        error = setTimeout(()=>{
            elems.error.addClass('hide')
        },5000)
    }
    else if(need == 'stat') stat(value)
    else if(need == 'bitrate') elems.stat.text(value)
}

/**
 * Показываем статистику по торренту
 * @param {string} url 
 */
function stat(url){
    let wait = 0

    elems.stat.text('- / - • - seeds')
    elems.speed.text('--')

    let update = ()=>{
        // если панель скрыта, то зачем каждую секунду чекать? хватит и 5 сек
        // проверено, если ставить на паузу, разадача удаляется, но если чекать постоянно, то все норм
        if(!html.hasClass('info--visible')){
            wait++

            if(wait <= 5) return
            else wait = 0
        }

        network.timeout(2000)

        network.silent(url.replace('preload', 'stat').replace('play', 'stat'), function (data) {
            elems.stat.text((data.active_peers || 0) + ' / ' + (data.total_peers || 0) + ' • ' + (data.connected_seeders || 0) + ' seeds')
            elems.speed.text(data.download_speed ? Utils.bytesToSize(data.download_speed * 8, true) + (Storage.get('language') == 'en' ? '' : '/c')  : '0.0')

            listener.send('stat', {data: data})
        })
    }

    stat_timer = setInterval(update,2000)

    update()
}

/**
 * Показать скрыть инфо
 * @param {boolean} status 
 */
function toggle(status){
    html.toggleClass('info--visible',status)
}

function loading(){
    elems.size.text(Lang.translate('loading') + '...')
}

/**
 * Уничтожить
 */
function destroy(){
    elems.size.text(Lang.translate('loading') + '...')
    elems.stat.text('')
    elems.speed.text('')
    elems.error.addClass('hide')

    clearTimeout(error)
    clearInterval(stat_timer)

    network.clear()
}

function render(){
    return html
}

export default {
    init,
    listener,
    render,
    set,
    toggle,
    loading,
    destroy
}