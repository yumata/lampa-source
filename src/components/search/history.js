import Subscribe from '../../utils/subscribe'
import Scroll from '../../interaction/scroll'
import Controller from '../../interaction/controller'
import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'

function create(){
    let scroll,
        last,
        keys = []

    this.listener = Subscribe()

    this.create = function(){
        scroll = new Scroll({
            over: true,
            mask:false,
            nopadding: true
        })

        keys = Storage.get('search_history','[]')

        keys.forEach(key => {
            this.append(key)
        });
    }

    this.append = function(value){
        let key = $('<div class="search-history-key selector"><div><span>'+value+'</span><div>Влево - удалить</div></div></div>')

        key.on('hover:enter',()=>{
            this.listener.send('enter', {value: value})
        }).on('hover:focus',(e)=>{
            last = e.target

            scroll.update($(e.target))
        })

        scroll.append(key)
    }

    this.add = function(value){
        if(keys.indexOf(value) == -1){
            Arrays.insert(keys,0,value)

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
                if(Navigator.canmove('up')) Navigator.move('up')
                else this.listener.send('up')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                this.listener.send('right')
            },
            back: ()=>{
                this.listener.send('back')
            },
            left: ()=>{
                let elem = scroll.render().find('.focus'),
                    selc = scroll.render().find('.selector')

                if(elem.length){
                    Arrays.remove(keys,$('span',elem).text())

                    Storage.set('search_history',keys)

                    let index = selc.index(elem)

                    if(index > 0) last = selc.eq(index - 1)[0]
                    else if(selc[index + 1]) last = selc.eq(index + 1)[0]

                    elem.remove()

                    if(selc.length - 1 <= 0) last = false

                    Controller.toggle('search_history')
                }
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