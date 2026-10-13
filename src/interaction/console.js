import Utils from '../utils/utils'
import Arrays from '../utils/arrays'
import Controller from '../core/controller'
import Keypad from '../core/keypad'
import Template from '../interaction/template'
import Scroll from '../interaction/scroll'
import Noty from './noty'
import Iframe from './iframe'
import Modal from './modal'
import Lang from '../core/lang'
import Socket from '../core/socket'
import Storage from '../core/storage/storage'
import Timer from '../core/timer'
import Manifest from '../core/manifest'
import Platform from '../core/platform'

let MAX_ENTRIES  = 300
let MAX_ORIGINAL = 200
let PAGE_SIZE    = 30

let icons = {
    all: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 2.5 20h19L12 3.5z"/><path d="M12 10v4.5M12 17.5v.01"/></svg>',
    name: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h4"/></svg>'
}

let entries  = []
let counts   = {}
let original = {}

let count_errors   = 0
let count_warnings = 0

let times = 0
let html
let scroll_tabs
let scroll_body
let filter = {type: 'all'}
let list = []
let rendered = 0
let pending = 0
let last_line
let rendering = false
let uploading = false

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

            Controller.toggle('console-body')
        },
        back: back
    })

    Controller.add('console-tabs',{
        toggle: ()=>{
            let active = scroll_tabs.render().find('.console__tab.active')[0]

            Controller.collectionSet(scroll_tabs.render())
            Controller.collectionFocus(active || false, scroll_tabs.render())
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        right: ()=>{
            Controller.toggle('console-body')
        },
        back: back
    })

    Controller.add('console-body',{
        toggle: ()=>{
            let main  = html.find('.console__main')
            let focus = last_line && last_line.parentNode ? last_line : main.find('.console__line')[0]

            Controller.collectionSet(main, false, true)
            Controller.collectionFocus(focus || false, main, true)
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        left: ()=>{
            if(Navigator.canmove('left')) Navigator.move('left')
            else Controller.toggle('console-tabs')
        },
        right: ()=>{
            Navigator.move('right')
        },
        back: back
    })

    follow()
}

function back(){
    if(!html) return
    
    times = 0

    scroll_tabs.destroy()
    scroll_body.destroy()

    html.remove()

    html = null
    list = []

    Controller.toggle('head')
}

function match(entry, need){
    if(need.type == 'all') return true
    if(need.type == 'name') return entry.name == need.name

    return entry.type == need.type
}

function filterKey(need){
    return Utils.hash(need.type + (need.name || ''))
}

function filterCount(need){
    if(need.type == 'all') return entries.length
    if(need.type == 'error') return count_errors
    if(need.type == 'warning') return count_warnings

    return counts[need.name] || 0
}

function nameColor(entry){
    if(entry.type == 'error') return '#ff6b6b'
    if(entry.type == 'warning') return '#ffd25e'

    return Utils.stringToHslColor(entry.name, 50, 65)
}

function textOf(message){
    return Arrays.isArray(message) ? message.join(' ') : message + ''
}

function line(entry, index){
    let item = $(`<div class="console__line selector">
        <div class="console__time">${Utils.parseTime(entry.time).time_full}</div>
        <div class="console__name"></div>
        <div class="console__message">${entry.message}</div>
    </div>`)

    item.find('.console__name').text(entry.name).css('color', nameColor(entry))

    item.on('hover:focus',(e)=>{
        last_line = e.target

        scroll_body.update($(e.target))

        // Подгружаем следующую порцию заранее, пока до конца еще несколько строк
        if(index >= rendered - 5) more()
    }).on('hover:enter',()=>{
        record(entry)
    })

    return item
}

function record(entry){
    let full = textOf(entry.full)
    let body = $(`<div class="console-record">
        <div class="console-record__head">
            <span class="console-record__time">${Utils.parseTime(entry.time).time_full}</span>
            <span class="console-record__name"></span>
        </div>
        <div class="console-record__text">${full}</div>
    </div>`)

    body.find('.console-record__name').text(entry.name).css('color', nameColor(entry))

    let close = ()=>{
        Modal.close()

        Controller.toggle('console-body')
    }

    let buttons = []
    let url     = $('<div>' + full + '</div>').text().match(/error of (.*?) :/)

    if(url && url[1]){
        buttons.push({
            name: Lang.translate('console_open_url'),
            onSelect: ()=>{
                Modal.close()

                Iframe.show({
                    url: url[1],
                    onBack: ()=>{
                        Controller.toggle('console-body')
                    }
                })
            }
        })
    }

    Modal.open({
        title: Lang.translate('menu_console'),
        html: body,
        size: 'large',
        zIndex: 200,
        buttons: buttons.length ? buttons : undefined,
        onBack: close
    })
}

function show(need){
    draw(need)

    Controller.toggle('console-body')
}

function draw(need){
    if(need) filter = need

    pending   = 0
    last_line = null

    html.find('.console__new').addClass('hide')

    scroll_tabs.render().find('.console__tab').removeClass('active')
    scroll_tabs.render().find('.console__tab[data-key="'+filterKey(filter)+'"]').addClass('active')

    scroll_body.clear()
    scroll_body.reset()

    list     = entries.filter(entry=>match(entry, filter))
    rendered = 0

    if(list.length) more()
    else scroll_body.append($('<div class="console__empty">'+Lang.translate('console_empty')+'</div>'))
}

/**
 * Дорисовать следующую порцию записей из текущего списка
 */
function more(){
    if(!html || rendered >= list.length) return

    let items = list.slice(rendered, rendered + PAGE_SIZE).map((entry, i)=>line(entry, rendered + i))

    rendered += items.length

    items.forEach(item=>scroll_body.append(item))

    if(Controller.enabled().name == 'console-body') Controller.collectionAppend(items.map(item=>item[0]))
}

function tab(need, name){
    let elem = $(`<div class="console__tab selector" data-key="${filterKey(need)}">
        <div class="console__tab-icon">${icons[need.type]}</div>
        <div class="console__tab-name"></div>
        <div class="console__tab-count">${filterCount(need)}</div>
    </div>`)

    elem[0].console_filter = need

    elem.find('.console__tab-name').text(name)

    elem.on('hover:enter',()=>{
        show(need)
    }).on('hover:focus',(e)=>{
        scroll_tabs.update($(e.target))
    })

    scroll_tabs.append(elem)

    return elem
}

function tabs(){
    scroll_tabs.clear()
    scroll_tabs.reset()

    tab({type: 'all'}, Lang.translate('console_all'))
    tab({type: 'error'}, Lang.translate('console_errors'))
    tab({type: 'warning'}, Lang.translate('console_warnings'))

    Object.keys(counts).sort((a,b)=>counts[b] - counts[a]).forEach(name=>{
        tab({type: 'name', name}, name)
    })

    if(filter.type == 'name' && !counts[filter.name]) filter = {type: 'all'}
}

function stats(){
    html.find('.console__stat--errors').toggleClass('active', count_errors > 0).find('.console__stat-value').text(count_errors)
    html.find('.console__stat--warnings').toggleClass('active', count_warnings > 0).find('.console__stat-value').text(count_warnings)
    html.find('.console__stat--total .console__stat-value').text(entries.length)
}

function updateCounts(){
    scroll_tabs.render().find('.console__tab').each(function(){
        $(this).find('.console__tab-count').text(filterCount(this.console_filter))
    })
}

/**
 * Обновить открытую консоль после добавления новой записи
 */
function live(entry){
    stats()

    if(!scroll_tabs.render().find('.console__tab[data-key="'+filterKey({type: 'name', name: entry.name})+'"]').length){
        let elem = tab({type: 'name', name: entry.name}, entry.name)

        if(Controller.enabled().name == 'console-tabs') Controller.collectionAppend(elem)
    }

    updateCounts()

    if(match(entry, filter)){
        let banner = html.find('.console__new')
        let hidden = banner.hasClass('hide')

        pending++

        banner.text(Lang.translate('console_new_records') + ': ' + pending + ' - ' + Lang.translate('console_new_back')).removeClass('hide')

        if(hidden && Controller.enabled().name == 'console-body') Controller.collectionAppend(banner)
    }
}

function clear(){
    entries  = []
    counts   = {}
    original = {}

    count_errors   = 0
    count_warnings = 0

    filter = {type: 'all'}

    tabs()
    stats()
    show()
}

function send(){
    if(uploading) return

    uploading = true

    let button = html.find('.console__button[data-action="send"]').addClass('console__button--loading')

    let close = ()=>{
        Modal.close()

        Controller.toggle('console-body')
    }

    upload().then((code)=>{
        Modal.open({
            title: '',
            html: $('<div class="about"><div>'+Lang.translate('account_export_secuses')+': <span class="extensions__item-code">'+code+'</span></div></div>'),
            size: 'small',
            zIndex: 200,
            onBack: close
        })
    }).catch((code)=>{
        Noty.show(Lang.translate('account_export_fail' + (code && typeof code == 'number' ? '_' + code : '')))
    }).finally(()=>{
        uploading = false

        button.removeClass('console__button--loading')
    })
}

function build(){
    let platform = Platform.get()

    html = Template.get('console', {
        app: 'Lampa ' + Manifest.app_version + (platform ? ' · ' + platform.charAt(0).toUpperCase() + platform.slice(1) : '')
    })

    scroll_body = new Scroll({
        over: true,
        mask: true,
        end_ratio: 2
    })

    scroll_body.onEnd = more

    scroll_tabs = new Scroll({
        over: true,
        mask: true
    })

    html.find('.console__sidebar').append(scroll_tabs.render())
    html.find('.console__body').append(scroll_body.render())

    html.find('.console__button').on('hover:enter',function(){
        let action = $(this).data('action')

        if(action == 'send') send()
        else if(action == 'clear') clear()
        else if(action == 'close') back()
    })

    html.find('.console__new').on('hover:enter',()=>{
        show()
    })

    $('body').append(html)

    tabs()
    stats()
    draw()
}

function remove(entry){
    counts[entry.name]--

    if(counts[entry.name] <= 0) delete counts[entry.name]

    if(entry.type == 'error') count_errors--
    if(entry.type == 'warning') count_warnings--
}

function store(name, time, message_original){
    if(!original[name]) original[name] = []

    Arrays.insert(original[name], 0, {time, message: message_original})

    if(original[name].length > MAX_ORIGINAL) original[name].pop()
}

function add(name, type, message, message_original, full){
    let time = Date.now()

    entries.unshift({time, name, type, message, full: full || message, original: message_original})

    counts[name] = (counts[name] || 0) + 1

    if(type == 'error') count_errors++
    if(type == 'warning') count_warnings++

    if(entries.length > MAX_ENTRIES) remove(entries.pop())

    store(name, time, message_original)

    if(type == 'error') store('Errors', time, message_original)
    if(type == 'warning') store('Warnings', time, message_original)

    try{
        if(Storage.get('terminal_access','') && Socket.terminalAccess()){
            Socket.send('terminal_console', {
                name: name,
                time: time,
                message: message_original
            })
        }
    }
    catch(e){}

    if(html && !rendering){
        rendering = true

        try{
            live(entries[0])
        }
        catch(e){}

        rendering = false
    }
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
  const _get_logger_function = function (func, type) {
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

            let name = 'Other'
            let message = msgs.join(' ')
            let full = orgn.join(' ')

            if(msgs.length >= 2){
                name    = msgs[0]
                message = msgs.slice(1).join(' ')
                full    = orgn.slice(1).join(' ')

                // Add brackets to real log
                mcon[0] = '[' + mcon[0] + ']'
            }

            try{
                add(name, type, message, orgn, full)
            }
            catch(e){}

            func.apply(console,mcon)
        }
    }

    let called = {
        log: _get_logger_function(console_orig.log, 'log'),
        error: _get_logger_function(console_orig.error, 'error'),
        warn: _get_logger_function(console_orig.warn, 'warning')
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

        add('Error', 'error', noty, noty.replace(/<br>/g, '\n'))

        if(!(stack.indexOf('resetTopStyle') >= 0 || stack.indexOf('Blocked a frame') >= 0 || stack.indexOf('global code@http') >= 0)) Noty.show(noty, {time: 8000})
    })
}

/**
 * Отправить журнал на сервер CUB
 * @returns {Promise<string>} код для разработчиков
 */
function upload(){
    return new Promise((resolve, reject)=>{
        let file
        let data = JSON.stringify(original)

        try{
            file = new File([data], "lampa_logs.json", {
                type: "text/plain",
            })
        }
        catch(e){}

        if(!file){
            try{
                file = new Blob([data], {type: 'text/plain'})
                file.lastModifiedDate = new Date()
            }
            catch(e){
                reject()
            }
        }

        if(file){
            let formData = new FormData($('<form></form>')[0])
                formData.append("file", file, "lampa_logs.json")

            $.ajax({
                url: Utils.protocol() + Manifest.cub_domain + '/api/lampa/logs/write',
                type: 'POST',
                data: formData,
                async: true,
                cache: false,
                timeout: 10000,
                contentType: false,
                enctype: 'multipart/form-data',
                processData: false,
                success: function (j) {
                    resolve(j.code)
                },
                error: function(e){
                    reject(e.responseJSON ? e.responseJSON.code : 0)
                }
            })
        }
    })
}

export default {
    init,
    upload,
    export: ()=>original,
    opened: ()=>!!html,
    close: back,
}
