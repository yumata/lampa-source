import Subscribe from '../../utils/subscribe'
import Scroll from '../../interaction/scroll'
import Controller from '../../interaction/controller'
import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Lang from '../../utils/lang'

function create(){
    let scroll,
        last,
        keys = []

    this.listener = Subscribe()

    this.create = function(){
        scroll = new Scroll({
            over: true,
            mask:false,
            horizontal: true
        })

        keys = Storage.get('search_history','[]')

        keys.forEach(key => {
            this.append(key)
        })

        if(!keys.length) scroll.append('<div class="selector search-history-empty">'+Lang.translate('search_empty')+'</div>')
    }

    this.append = function(value){
        let key = $('<div class="search-history-key selector"><div><span>'+value+'</span></div></div>')

        key.on('hover:enter',()=>{
            this.listener.send('enter', {value: value})
        }).on('hover:focus',(e)=>{
            last = e.target

            scroll.update($(e.target), true)
        }).on('hover:long',()=>{
            let selc = scroll.render().find('.selector')

            Arrays.remove(keys,value)

            Storage.set('search_history',keys)

            let index = selc.index(key)

            if(index > 0) last = selc.eq(index - 1)[0]
            else if(selc[index + 1]) last = selc.eq(index + 1)[0]

            key.remove()

            if(selc.length - 1 <= 0) last = false

            Controller.collectionFocus(last, scroll.render())
        })

        scroll.append(key)
    }

    this.add = function(value){
        if(keys.indexOf(value) == -1){
            Arrays.insert(keys,0,value)

            if(keys.length > 10) keys = keys.slice(0,10)

            Storage.set('search_history',keys)
        }
    }

    this.toggle = function(){
        Controller.add('search_history',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last, scroll.render())
            },
            up: ()=>{
                this.listener.send('up')
            },
            down: ()=>{
                this.listener.send('down')
            },
            right: ()=>{
                Navigator.move('right')
            },
            back: ()=>{
                this.listener.send('back')
            },
            left: ()=>{
                Navigator.move('left')
            }
        })

        Controller.toggle('search_history')
    }

    this.any = function(){
        return keys.length
    }

    this.render = function(){
        return scroll.render()
    }

    this.destroy = function(){
        scroll.destroy()

        this.listener.destroy()

        keys = null
        last = null
    }
}

export default create