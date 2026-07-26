import Subscribe from '../../utils/subscribe'
import Select from '../select'
import Controller from '../../core/controller'
import Lang from '../../core/lang'

let listener = Subscribe()
let current  = ''
let currentPath = ''
let playlist = []
let position = 0

// url мутирует в момент клика (caps-параметры, &play/&preload),
// поэтому сопоставляем по стабильному path, с откатом на url
function matches(item){
    if(currentPath && item.path) return item.path == currentPath

    return item.url == current
}

// playlist уходит во внешние плееры, поэтому для окна выбора
// возвращаем копию с разделителями, не трогая исходный массив
function withSeasonSeparators(items){
    if(!items.some(item => item.season > 0)) return items

    let display = []
    let lastSeason

    items.forEach(item => {
        let season = item.season || 0

        if(season !== lastSeason){
            if(season) display.push({
                separator: true,
                title: Lang.translate('torrent_serial_season') + ' ' + season
            })

            lastSeason = season
        }

        display.push(item)
    })

    return display
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
        items: withSeasonSeparators(playlist),
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
 * Установить активным
 */
function active(){
    playlist.forEach(element => {
        element.selected = matches(element)

        if(element.selected) position = playlist.indexOf(element)
    })
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
    active()

    if(position < playlist.length - 1){
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
 * @param {[{title:string, url:string}]} p 
 */
function set(p){
    playlist = p

    playlist.forEach((l,i)=>{
        if(matches(l)) position = i
    })

    listener.send('set',{playlist,position})
}

/**
 * Получить список
 * @returns {[{title:string, url:string}]}
 */
 function get(){
    return playlist
}

/**
 * Установить текущий урл
 * @param {string} u урл
 * @param {string} [p] путь файла внутри торрента (стабильный ключ)
 */
function url(u, p){
    current = u

    currentPath = p || ''
}


export default {
    listener,
    active,
    show,
    url,
    get,
    set,
    prev,
    next,
    canNext,
    position: ()=> position
}