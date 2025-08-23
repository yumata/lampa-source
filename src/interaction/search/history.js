import Subscribe from '../../utils/subscribe'
import Scroll from '../../interaction/scroll'
import Controller from '../../core/controller'
import Storage from '../../core/storage/storage'
import Arrays from '../../utils/arrays'
import Lang from '../../core/lang'

function History(){
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

        scroll.onWheel = (step)=>{
            this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        scroll.onScroll = (step)=>{}

        keys = Storage.get('search_history','[]')

        keys.map(v=>v).reverse().slice(0,15).forEach(key => {
            this.append(key)
        })

        if(!keys.length) scroll.append($('<div class="selector search-history-empty">'+Lang.translate('search_empty')+'</div>'))
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

            Storage.remove('search_history',value)

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
        let inx = keys.indexOf(value)

        if(inx == -1){
            keys.push(value)
        }
        else{
            Arrays.remove(keys, value)

            keys.push(value)
        }

        Storage.set('search_history',keys)
    }

    this.toggle = function(){
        Controller.add('search_history',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last, scroll.render())
            },
            update: ()=>{},
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

export default History