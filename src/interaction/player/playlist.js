import Subscribe from '../../utils/subscribe'
import Select from '../select'
import Controller from '../../core/controller'
import Lang from '../../core/lang'
import Player from '../player'
import Panel from './panel'
import Video from './video'
import Storage from '../../core/storage/storage'

let listener = Subscribe()
let current  = ''
let playlist = []
let position = 0

function init(){
    Panel.listener.follow('playlist', show)
    Panel.listener.follow('prev', prev)
    Panel.listener.follow('next', next)

    Player.listener.follow('start', (data)=>{
        url(data.url)

        if(data.playlist && data.playlist.length) set(data.playlist)
        else set(get())
    })

    Player.listener.follow('destroy', destroy)

    Video.listener.follow('ended', (e)=>{
        if(Storage.field('playlist_next') && !Select.opened()) next()
    })
}

/**
 * Показать плейлист
 */
function show(){
    if(!playlist.length) return
    
    active()

    let enabled = Controller.enabled()

    Select.show({
        title: Lang.translate('player_playlist'),
        items: playlist,
        onSelect: (a)=>{
            Controller.toggle(enabled.name)

            listener.send('select',{
                playlist,
                item: a,
                position
            })
        },
        onBack: ()=>{
            Controller.toggle(enabled.name)
        }
    })
}

/**
 * Найти текущий элемент в плейлисте и установить его позицию
 */
function active(){
    playlist.forEach(p=> p.selected = false)

    let find = playlist.find(l=>l.url == current)
    let data = Player.playdata()

    // Если текущий урл не найден в плейлисте, то ищем по урлу из плеера
    if(!find) find = playlist.find(l=>l.url == data.url)
    
    // Пробуем найти по эпизоду и сезону, если есть
    if(!find) find = playlist.find(l=>l.episode == data.episode && l.season == data.season)
    
    if(find){
        position = playlist.indexOf(find)

        find.selected = true
    }
}

/**
 * Назад
 */
function prev(){
    active()

    if(position > 0){
        listener.send('select',{
            playlist,
            position: position - 1,
            item: playlist[position-1]
        })
    }
}

/**
 * Далее
 */
function next(){
    if(canNext()){
        listener.send('select',{
            playlist,
            position: position + 1,
            item: playlist[position+1]
        })
    }
}

/**
 * Можно ли далее
 * @returns {boolean}
 */
function canNext(){
    active()

    return position < playlist.length - 1
}

/**
 * Установить плейлист
 * @param {[{title:string, url:string, thumbnail:string}]} p
 */
function set(p){
    playlist = p

    active()

    listener.send('set',{
        playlist,
        position
    })
}

/**
 * Получить список
 * @returns {[{title:string, url:string, thumbnail:string}]}
 */
function get(){
    return playlist
}

/**
 * Установить текуший урл
 * @param {string} u 
 */
function url(u){
    current = u
}

/**
 * Очистить плейлист
 */
function destroy(){
    current  = ''
    playlist = []
    position = 0
}

export default {
    init,
    listener,
    active,
    show,
    url,
    get,
    set,
    prev,
    next,
    canNext,
    position: ()=> position,
    destroy
}