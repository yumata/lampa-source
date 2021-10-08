import Subscribe from '../../utils/subscribe'
import Select from '../select'
import Controller from '../controller'

let listener = Subscribe()
let current  = ''
let playlist = []
let position = 0

/**
 * Показать плейлист
 */
function show(){
    active()

    let enabled = Controller.enabled()

    Select.show({
        title: 'Плейлист',
        items: playlist,
        onSelect: (a)=>{
            Controller.toggle(enabled.name)

            listener.send('select',{item: a})
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
        element.selected = element.url == current

        if(element.selected) position = playlist.indexOf(element)
    })
}

/**
 * Назад
 */
function prev(){
    active()

    if(position > 1){
        listener.send('select',{item: playlist[position-1]})
    }
}

/**
 * Далее
 */
function next(){
    active()

    if(position < playlist.length - 1){
        listener.send('select',{item: playlist[position+1]})
    }
}

/**
 * Установить плейлист
 * @param {Array} p 
 */
function set(p){
    playlist = p
}

/**
 * Установить текуший урл
 * @param {String} u 
 */
function url(u){
    current = u
}


export default {
    listener,
    show,
    url,
    set,
    prev,
    next
}