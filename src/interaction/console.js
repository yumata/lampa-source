import Utils from '../utils/math'
import Arrays from '../utils/arrays'
import Controller from '../interaction/controller'
import Keypad from '../interaction/keypad'
import Template from '../interaction/template'
import Scroll from '../interaction/scroll'

let items = []
let times = 0
let html
let scroll

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

            Controller.collectionSet(html)
            Controller.collectionFocus(false, html)
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        back: ()=>{
            times = 0

            scroll.destroy()

            html.remove()

            Controller.toggle('head')
        }
    })

    follow()
}

function build(){
    html   = Template.get('console')
    scroll = new Scroll({
        over: true
    })

    scroll.minus()

    items.forEach(element => {
        let item = $(element)

        item.on('hover:focus',(e)=>{
            scroll.update($(e.target))
        })

        scroll.append(item)
    })

    html.append(scroll.render())
    
    $('body').append(html)
}

function add(message){
    try{
        Arrays.insert(items, 0, '<div class="console__line selector"><span>'+message+'</span></div>')
    }
    catch(e){
        Arrays.insert(items, 0, '<div class="console__line selector"><span>Failed to print line</span></div>')
    }

    if(items.length > 50) items.pop()
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
        arr = JSON.stringify(arr);
    }
    else if(typeof arr === 'string' || typeof arr === 'number'  || typeof arr === 'boolean'){
        arr = escapeHtml(arr + '')
    }
    else{
        var a = [];

        for(var i in arr){
            a.push(i + ': ' + arr[i]);
        }

        arr = JSON.stringify(a);
    }

    arr = Utils.shortText(arr,600);

    return arr
}

function follow(){
    var log = console.log

    console.log = function(){
        var msgs = [];
        var mcon = [];

        while(arguments.length) {
            var arr = [].shift.call(arguments)

            msgs.push(decode(arr))
            mcon.push(arr)
        }

        msgs[0] = '<span style="color: '+Utils.stringToHslColor(msgs[0], 50, 65)+'">' + msgs[0] + '</span>'

        add(msgs.join(' '))

        log.apply(console,mcon)
    }
    
    window.addEventListener("error", function (e) {
		add((e.error || e).message + '<br><br>' + (e.error ? e.error.stack : e.stack || '').split("\n").join('<br>'));
	})
}

export default {
    init
}