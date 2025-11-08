import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/utils'
import Reguest from '../../utils/reguest'
import Lang from '../../core/lang'
import Storage from '../../core/storage/storage'
import Torserver from '../torserver'
import HeadBackward from '../head/backward'

let html
let listener = Subscribe()
let network  = new Reguest()
let elems

let error, stat_timer

function init(){
    html = Template.get('player_info')

    html.find('.player-info__body').prepend(HeadBackward('Плеер'))
    
    elems = {
        name:  $('.player-info__name,.head-backward__title',html),
        size:  $('.value--size span',html),
        stat:  $('.value--stat span',html),
        speed: $('.value--speed span',html),
        error: $('.player-info__error',html),
        pieces:  $('.value--pieces',html)
    }

    Utils.time(html)
}

/**
 * Установить значение
 * @param {string} need
 * @param {string|{width,height}} value 
 */
function set(need, value){
    if(need == 'name') elems.name.html(value)
    else if(need == 'size' && value.width && value.height) elems.size.text(value.width + 'x' + value.height)
    else if(need == 'error') {
        clearTimeout(error)

        elems.error.removeClass('hide').text(value)

        error = setTimeout(()=>{
            elems.error.addClass('hide')
        },10000)
    }
    else if(need == 'stat') stat(value)
    else if(need == 'bitrate') elems.stat.html(value)
}

function pieces(cache){
    elems.pieces.empty()

    if(cache.Readers.length){
        let reader = cache.Readers[0].Reader
        let end    = cache.Readers[0].End
        let start  = reader
        let total  = end - reader
        let dots   = 5
        let loaded = 0

        while(cache.Pieces[start] && cache.Pieces[start].Completed && start < end){
            start++
            loaded++
        }

        let percent = loaded / total * 100

        for(let i = 0; i < dots; i++){
            let color  = ''
            let filled = Math.round(dots * (loaded / total)) >= i

            if(i == 0){
                if(percent > 80) color = 'green'
                else if(percent >= 40) color = 'yellow'
                else color = 'red'
            }
            else if(filled) color = 'active'

            elems.pieces.append('<span class="'+color+'"></span>')
        }
    }
}

/**
 * Показываем статистику по торренту
 * @param {string} url 
 */
function stat(url){
    let wait = 0

    elems.stat.text('- / - • - ' + Lang.translate('connected_seeds'))
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

        network.silent(url.replace('&preload', '&stat').replace('&play', '&stat'), function (data) {
            elems.stat.text((data.active_peers || 0) + ' / ' + (data.total_peers || 0) + ' • ' + (data.connected_seeders || 0) + ' ' + Lang.translate('connected_seeds'))
            elems.speed.text(Utils.bytesToSize(data.download_speed ? data.download_speed * 8 : 0, true))

            let hash = url.match(/link=(.*?)\&/)

            if(hash){
                Torserver.cache(hash[1],(cache)=>{
                    pieces(cache)
                    
                    listener.send('stat', {data: data, cache})
                },()=>{
                    listener.send('stat', {data: data})
                })
            }
            else{
                listener.send('stat', {data: data})
            }
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
    elems.pieces.empty()

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