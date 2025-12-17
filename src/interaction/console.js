import Utils from '../utils/utils'
import Arrays from '../utils/arrays'
import Controller from '../core/controller'
import Keypad from '../core/keypad'
import Template from '../interaction/template'
import Scroll from '../interaction/scroll'
import Noty from './noty'
import Iframe from './iframe'
import HeadBackward from './head/backward'
import Lang from '../core/lang'
import Socket from '../core/socket'
import Storage from '../core/storage/storage'
import Timer from '../core/timer'

let items = {
    App: [],
    Errors: [],
    Warnings: []
}
let original = {
    App: [],
    Errors: [],
    Warnings: []
}
let times = 0
let html
let scroll_tabs
let scroll_body
let last_tab

let console_orig = {
    log: console.log,
    error: console.error,
    warn: console.warn
}

function init(){
    Keypad.listener.follow('keydown',(e)=>{
        if (e.code == 38 || e.code == 29460) {
            let enable = Controller.enabled()

            if(enable.name == 'head'){
                times++
                
                if(times > 10){
                    Controller.toggle('console')
                }
            }
            else{
                times = 0
            }
        }
    })

    Controller.add('console',{
        toggle: ()=>{
            build()

            Controller.toggle('console-tabs')
        },
        back: back
    })

    Controller.add('console-tabs',{
        toggle: ()=>{
            Controller.collectionSet(scroll_tabs.render())
            Controller.collectionFocus(scroll_tabs.render().find('.console__tab[data-name="'+Utils.hash(last_tab)+'"]')[0], scroll_tabs.render())
        },
        down: ()=>{
            Controller.toggle('console-body')
        },
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        back: back
    })

    follow()
}

function back(){
    times = 0

    scroll_tabs.destroy()
    scroll_body.destroy()

    html.remove()

    Controller.toggle('head')
}

function show(name){
    scroll_body.clear()
    scroll_body.reset()

    if(items[name]){
        items[name].forEach(element => {
            let item = $(element)
    
            item.on('hover:focus',(e)=>{
                scroll_body.update($(e.target))
            })

            if(name == 'Request'){
                item.on('hover:enter',(e)=>{
                    let str = item.text()
                    let mth = str.match(/error of (.*?) :/)

                    if(mth && mth[1]){
                        Iframe.show({
                            url: mth[1],
                            onBack: ()=>{
                                Controller.toggle('console-body')
                            }
                        })
                    }
                })
            }
    
            scroll_body.append(item)
        })
    }

    Controller.add('console-body',{
        toggle: ()=>{
            Controller.collectionSet(scroll_body.render())
            Controller.collectionFocus(false, scroll_body.render())
        },
        up: ()=>{
            if(Navigator.canmove('up')) Navigator.move('up')
            else Controller.toggle('console-tabs')
        },
        down: ()=>{
            Navigator.move('down')
        },
        back: back
    })

    Controller.toggle('console-body')
}

function tab(name, lines){
    let elem = $('<div class="console__tab selector" data-name="'+Utils.hash(name)+'">'+Utils.shortText(name,10)+' - <span>'+lines.length+'</span></div>')

    elem.on('hover:enter',()=>{
        show(name)

        last_tab = name
    }).on('hover:focus',(e)=>{
        scroll_tabs.update($(e.target))
    })

    scroll_tabs.append(elem)

    if(!last_tab) last_tab = name

    if(last_tab == name) show(name)
}

function build(){
    html   = Template.get('console')

    scroll_body = new Scroll({
        over: true,
        mask: true
    })

    scroll_tabs = new Scroll({
        horizontal: true
    })

    for(let i in items) tab(i, items[i])

    html.find('.console__tabs').append(HeadBackward(Lang.translate('menu_console'))).append(scroll_tabs.render())
    html.find('.console__body').append(scroll_body.render())

    scroll_body.height(html.find('.console__tabs'))
    
    $('body').append(html)
}

function add(name, message, message_original){
    if(!items[name]){
        items[name] = []
        original[name] = []
    } 

    let where_items = items[name]
    let where_original = original[name]
    let time  = Utils.parseTime(Date.now()).time

    try{
        Arrays.insert(where_items, 0, '<div class="console__line selector"><span class="console__time">'+time+'</span> - <span>'+message+'</span></div>')
        Arrays.insert(where_original, 0, {time: Date.now(), message: message_original})

        if(Storage.get('terminal_access','') && Socket.terminalAccess()){
            Socket.send('terminal_console', {
                name: name,
                time: Date.now(),
                message: message_original
            })
        }
    }
    catch(e){
        Arrays.insert(where_items, 0, '<div class="console__line selector"><span class="console__time">'+time+'</span> - <span>Failed to print line</span></div>')
        Arrays.insert(where_original, 0, {time: Date.now(), message: 'Failed to print line'})
    }

    if(where_items.length > 50) where_items.pop()
    if(where_original.length > 200) where_original.pop()
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

function decode(arr){
    if(Arrays.isObject(arr) || Arrays.isArray(arr)){
        try{
            arr = JSON.stringify(arr)
        }
        catch(e){
            arr = '[noview]'
        }
    }
    else if(typeof arr === 'string' || typeof arr === 'number'  || typeof arr === 'boolean'){
        arr = escapeHtml(arr + '')
    }
    else{
        let a = []

        for(let i in arr){
            a.push(i + ': ' + arr[i])
        }

        arr = JSON.stringify(a)
    }

    return arr
}

function follow(){
  const _get_logger_function = function (func, color, prefix='') {
        return function() {
            let msgs = [];
            let mcon = [];
            let orgn = [];

            while(arguments.length) {
                let arr = [].shift.call(arguments)

                msgs.push(Utils.shortText(decode(arr), 600))
                mcon.push(arr)
                orgn.push(decode(arr))
            }

            let name = msgs[0]

            if(msgs.length < 2){
                name = 'Other'
            }
            else{
                // Add color and prefix to lampa console
                let spanColor = color || Utils.stringToHslColor(msgs[0], 50, 65)
                
                msgs[0] = '<span style="color: '+spanColor+'">' + msgs[0] + '</span>'

                // Add brackets to real log
                if (mcon.length > 0) {
                    mcon[0] = '[' + mcon[0] + ']'
                }
            }

            if(prefix == 'ERROR' || prefix == 'WARNING'){
                add(prefix == 'ERROR' ? 'Errors' : 'Warnings', msgs.join(' '), orgn)
            }

            add(name, msgs.join(' '), orgn)

            func.apply(console,mcon)
        }
    }

    let called = {
        log: _get_logger_function(console_orig.log, null),
        error: _get_logger_function(console_orig.error, 'red', 'ERROR'),
        warn: _get_logger_function(console_orig.warn, 'yellow', 'WARNING')
    }

    Timer.add(1000, ()=>{
        // Заменяем консоль на свою
        console.log   = called.log
        console.error = called.error
        console.warn  = called.warn
    })

    console.log   = called.log
    console.error = called.error
    console.warn  = called.warn
    
    window.addEventListener("error", function (e) {
        e.preventDefault?.()

        let stack    = (e.error && e.error.stack ? e.error.stack : e.stack || '').split("\n").join('<br>')
        let message  = typeof e.error == 'string' ? e.error : (e.error || e).message
        let filename = e.filename || (e.error && e.error.fileName ? e.error.fileName : '')
        let noty     = []

        message && noty.push('Message: ' + message)
        filename && noty.push('In: ' + filename)
        stack && noty.push('Stack: ' + stack)

        noty = noty.join('<br><br>')

        let welcome = $('.welcome')

        if(welcome.length){
            welcome.fadeOut(500,()=>{
                Noty.show(noty, {time: 8000})
            })
        }

		add('Errors', noty, noty.replace(/<br>/g, '\n'))

        if(!(stack.indexOf('resetTopStyle') >= 0 || stack.indexOf('Blocked a frame') >= 0 || stack.indexOf('global code@http') >= 0)) Noty.show(noty, {time: 8000})
	})
}

export default {
    init,
    export: ()=>original
}
