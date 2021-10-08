import Subscribe from '../../utils/subscribe'
import Select from '../select'
import Controller from '../controller'

let listener = Subscribe()
let current  = ''
let playlist = []
let position = 0

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

function active(){
    playlist.forEach(element => {
        element.selected = element.url == current

        if(element.selected) position = playlist.indexOf(element)
    })
}

function prev(){
    active()

    if(position > 1){
        listener.send('select',{item: playlist[position-1]})
    }
}

function next(){
    active()

    if(position < playlist.length - 1){
        listener.send('select',{item: playlist[position+1]})
    }
}

function set(p){
    playlist = p
}

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