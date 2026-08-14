import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/utils'
import Reguest from '../../utils/reguest'
import Lang from '../../core/lang'
import Torserver from '../torserver'
import HeadBackward from '../head/backward'
import Player from '../player'
import Video from './video'
import Panel from './panel'

let html
let listener = Subscribe()
let network  = new Reguest()
let elems

let error, stat_timer

function init(){
    html = Template.get('player_info')

    html.find('.player-info__body').prepend(HeadBackward(Lang.translate('settings_main_player')))
    
    elems = {
        name:  $('.player-info__name,.head-backward__title',html),
        title: $('.player-info__title',html),
        size:  $('.value--size span',html),
        stat:  $('.value--stat span',html),
        speed: $('.value--speed span',html),
        vname: $('.value--name',html),
        error: $('.player-info__error',html),
        timeend: $('.player-info__time-end span',html),
        pieces:  $('.value--pieces',html)
    }

    Utils.time(html)

    Video.listener.follow('videosize',(e)=>{
        set('size', e)
    })

    Video.listener.follow('destroy',(e)=>{
        set('bitrate', '')
    })

    Video.listener.follow('timeupdate', updateTimeEnd)

    Video.listener.follow('error',(e)=>{
        if(e.fatal) elems.size.text(Lang.translate('title_error')) 
        else set('error', e.error)
    })

    Panel.listener.follow('visible',(e)=>{
        toggle(e.status)

        updateTimeEnd()
    })

    Player.listener.follow('start',(data)=>{
        set('name', data.title)

        if(Torserver.ip() && data.url.indexOf(Torserver.ip()) > -1) set('stat', data)
    })

    Player.listener.follow('destroy', destroy)
}

function updateTimeEnd(){
    let video = Video.video()

    if(Panel.visibleStatus() && video && video.duration){
        elems.timeend.text(Lang.translate('player_time_end') + ' ' + Utils.parseTime(new Date(Date.now() + (video.duration - video.currentTime) * 1000)).time)
    }
    else{
        elems.timeend.text('')
    }
}

/**
 * Установить значение
 * @param {string} need
 * @param {string|{width,height}} value 
 */
function set(need, value){
    if(need == 'name') {
        let name  = value
        let work  = Player.playdata()
        let head = ''

        if(!work.iptv){
            if(work.card) head = work.card.title || work.card.name
            else if(Lampa.Activity.active().movie){
                head = Lampa.Activity.active().movie.title || Lampa.Activity.active().movie.name
            }

            if(!head) head = name

            elems.title.text(head).toggleClass('hide', Boolean(work.iptv))

            elems.name.toggleClass('hide', Boolean(name == head)).toggleClass('hide', true)

            elems.vname.toggleClass('hide', Boolean(name == head)).find('span').text(name)
        }
        else elems.title.text(name)
        
    }
    else if(need == 'size' && value.width && value.height) elems.size.text(value.width + 'x' + value.height)
    else if(need == 'error') {
        clearTimeout(error)

        elems.error.removeClass('hide').text(value)

        error = setTimeout(()=>{
            elems.error.addClass('hide')
        },10000)
    }
    else if(need == 'stat') stat(value)
    else if(need == 'bitrate' && !stat_timer) elems.stat.html(value)
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
 * @param {object} player_data 
 */
function stat(player_data){
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

        let url = ''

        if(Torserver.gstWork()) url = Torserver.url() + '/gst/' + player_data.torrent_hash + '/heartbeat'
        else                    url = player_data.url.replace('&preload', '&stat').replace('&play', '&stat')

        network.silent(url, function (data) {
            let torrent = data.Torrent || data

            elems.stat.text((torrent.active_peers || 0) + ' / ' + (torrent.total_peers || 0) + ' • ' + (torrent.connected_seeders || 0) + ' ' + Lang.translate('connected_seeds'))
            elems.speed.text(Utils.bytesToSize(torrent.download_speed ? torrent.download_speed * 8 : 0, true))

            if(Torserver.gstWork()) return pieces(data)

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

    stat_timer = setInterval(update, 2000)

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
    elems.vname.toggleClass('hide', true)
    elems.name.toggleClass('hide', true)
    elems.title.toggleClass('hide', false)

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