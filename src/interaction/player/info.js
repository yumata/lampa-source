import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/math'
import Reguest from '../../utils/reguest'

let html     = Template.get('player_info')
let listener = Subscribe()
let network  = new Reguest()
let elems    = {
    name:  $('.player-info__name',html),
    size:  $('.value--size span',html),
    stat:  $('.value--stat span',html),
    speed: $('.value--speed span',html),
    error: $('.player-info__error',html)
}

let error, stat_timer

Utils.time(html)

/**
 * Установить значение
 * @param {String} need 
 * @param {*} value 
 */
function set(need, value){
    if(need == 'name')      elems.name.html(value)
    else if(need == 'size') elems.size.text(value.width + 'x' + value.height)
    else if(need == 'error') {
        clearTimeout(error)

        elems.error.removeClass('hide').text(value)

        error = setTimeout(()=>{
            elems.error.addClass('hide')
        },5000)
    }
    else if(need == 'stat') stat(value)
}

/**
 * Показываем статистику по торренту
 * @param {*} url 
 */
function stat(url){
    let wait = 0

    let update = ()=>{
        // если панель скрыта, то зачем каждую секунду чекать? хватит и 5 сек
        if(!html.hasClass('info--visible')){
            wait++

            if(wait <= 5) return
            else wait = 0
        }

        network.timeout(2000)

        network.silent(url.replace('preload', 'stat').replace('play', 'stat'), function (data) {
            elems.stat.text((data.active_peers || 0) + ' / ' + (data.total_peers || 0) + ' • ' + (data.connected_seeders || 0) + ' seeds')
            elems.speed.text(data.download_speed ? Utils.bytesToSize(data.download_speed, true) + '/s' : '0.0')

            listener.send('stat', {data: data})
        })
    }

    stat_timer = setInterval(update,2000)

    update()
}

/**
 * Показать скрыть инфо
 * @param {Boolean} status 
 */
function toggle(status){
    html.toggleClass('info--visible',status)
}

/**
 * Уничтожить
 */
function destroy(){
    elems.size.text('Загрузка...')
    elems.stat.text('- / - • - seeds')
    elems.speed.text('--')
    elems.error.addClass('hide')

    clearTimeout(error)
    clearInterval(stat_timer)

    network.clear()
}

function render(){
    return html
}

export default {
    listener,
    render,
    set,
    toggle,
    destroy
}