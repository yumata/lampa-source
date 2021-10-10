import Component from './component'
import Template from './template'
import Subscribe from '../utils/subscribe'
import Controller from './controller'
import Head from '../components/head'
import Storage from '../utils/storage'

let listener  = Subscribe()
let activites = []
let callback  = false
let fullout   = false
let content
let slides
let maxsave

function Activity(component){
    let slide = Template.get('activity')
    let body  = slide.find('.activity__body')

    this.stoped  = false
    this.started = false

    /**
     * Добовляет активити в список активитис
     */
    this.append = function(){
        slides.append(slide)
    }

    /**
     * Создает новую активность
     */
    this.create = function(){
        component.create(body)

        body.append(component.render())
    }

    /**
     * Показывает загрузку
     * @param {Boolean} status 
     */
    this.loader = function(status){
        slide.toggleClass('activity--load',status)
    }

    /**
     * Создает повторно
     */
    this.restart = function(){
        this.append()

        this.stoped = false

        component.start()
    }

    /**
     * Стартуем активную активность
     */
    this.start = function(){
        this.started = true

        Controller.add('content',{
            invisible: true,
            toggle: ()=>{},
            left: ()=>{
                Controller.toggle('menu')
            },
            up: ()=>{
                Controller.toggle('head')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')

        if(this.stoped) this.restart()
        else component.start()
    }

    /**
     * пауза
     */
    this.pause = function(){
        this.started = false

        component.pause()
    }

    /**
     * Включаем активность если она активна
     */
    this.toggle = function(){
        if(this.started) this.start()
    }

    /**
     * Стоп
     */
    this.stop = function(){
        this.started = false

        if(this.stoped) return

        this.stoped = true

        component.stop()

        slide.detach()
    }

    /**
     * Рендер
     */
    this.render = function(){
        return slide
    }

    /**
     * Уничтожаем активность
     */
    this.destroy = function(){
        component.destroy()

        slide.remove()
    }

    this.append()
}

function init(){
    content   = Template.get('activitys')
    slides    = content.find('.activitys__slides')
    maxsave   = Storage.get('pages_save_total',5)

    empty()

    window.addEventListener('popstate', () => {
        if(fullout) return
    
        empty()
    
        listener.send('popstate',{count: activites.length})
    
        if(callback) callback()
        else{
            backward()
        }
    })
    
    Storage.listener.follow('change', (event)=>{
        if(event.name == 'pages_save_total') maxsave = Storage.get('pages_save_total',5)
    })
}

/**
 * Лимит активностей, уничтожать если больше maxsave
 */
function limit(){
    let curent = active()

    if(curent && curent.activity) curent.activity.pause()

    let tree_stop = activites.slice(-2)

    if(tree_stop.length > 1 && tree_stop[0].activity) tree_stop[0].activity.stop()

    let tree_destroy = activites.slice(-maxsave)

    if(tree_destroy.length > (maxsave - 1)){
        let first = tree_destroy[0]

        if(first.activity){
            first.activity.destroy()

            first.activity = null
        } 
    } 
}

/**
 * Добавить новую активность
 * @param {Object} object 
 */
function push(object){
    limit()

    create(object)

    activites.push(object)

    start(object)
}

/**
 * Создать новую активность
 * @param {Object} object 
 */
function create(object){
    let comp = Component(object)

    object.activity = new Activity(comp)

    comp.activity = object.activity

    object.activity.create()
}

function back(){
    window.history.back();
}

function active(){
    return activites[activites.length - 1]
}

function empty(){
    window.history.pushState(null, null, window.location.pathname)
}

function backward(){
    callback = false;

    listener.send('backward',{count: activites.length})

    if(activites.length == 1) return

    slides.find('>div').removeClass('activity--active')

    let curent = activites.pop()

    if(curent){
        setTimeout(function(){
            curent.activity.destroy()
        },200)
    }

    let previous_tree = activites.slice(-maxsave)

    if(previous_tree.length > (maxsave - 1)){
        create(previous_tree[0])
    }

    previous_tree = activites.slice(-1)[0]
    
    if(previous_tree){
        if(previous_tree.activity) start(previous_tree)
        else {
            create(previous_tree)

            start(previous_tree)
        }
    }
}

function save(object){
    let saved = {}

    for(let i in object){
        if(i !== 'activity') saved[i] = object[i]
    }

    Storage.set('activity', saved)
}

function extractObject(object){
    let saved = {}

    for(let i in object){
        if(i !== 'activity') saved[i] = object[i]
    }

    return saved
}

function start(object){
    save(object)

    object.activity.start()

    slides.find('> div').removeClass('activity--active')

    object.activity.render().addClass('activity--active')

    Head.title(object.title)
}

function last(){
    let active = Storage.get('activity','false')

    if(active){
        push(active)
    }
    else{
        push({
            url: '',
            title: 'Главная',
            component: 'main'
        })
    }
}

function render(){
    return content
}

function call(call){
    callback = call
}

function out(){
    fullout = true

    back()

    for (let i = 0; i < window.history.length; i++) {
        back()
    }

    setTimeout(()=>{
        fullout = false

        empty()
    },100)
}

function replace(replace = {}){
    let object = extractObject(active())

    for(var i in replace){
        object[i] = replace[i]
    }

    active().activity.destroy()

    activites.pop()

    push(object)
}

export default {
    init,
    listener,
    push,
    back,
    render,
    backward,
    call,
    last,
    out,
    replace,
    active
}