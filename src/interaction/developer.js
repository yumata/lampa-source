import Storage from '../utils/storage'
import Controller from './controller'
import Template from './template'
import Lang from '../utils/lang'
import Scroll from './scroll'
import DeviceInput from '../utils/device_input'

function open(callSelected){
    let html   = Template.get('lang_choice',{})
    let scroll = new Scroll({mask:true,over:true})

    function btn(name, select){
        let item = $('<div class="selector lang__selector-item">'+name+'</div>')

        item.on('hover:enter',(e)=>{
            if(select) select()
        }).on('hover:focus',(e)=>{
            scroll.update($(e.target), true)
        }).on('click',(e)=>{
            if(select && DeviceInput.canClick(e.originalEvent)) select()
        })

        scroll.append(item)
    }

    function destroy(){
        html.fadeOut(300,()=>{
            scroll.destroy()
            html.remove()

            scroll = null
            html   = null
        })

        Controller.add('developer',{
            toggle: ()=>{}
        })
    }

    function close(){
        destroy()

        callSelected()
    }

    let btns = [
        {
            name: Lang.translate('title_continue_two'),
            select: close
        },
        {
            name: Lang.translate('plugins_remove'),
            select: ()=>{
                Storage.set('plugins',[])

                close()
            }
        },
        {
            name: Lang.translate('settings_reset'),
            select: ()=>{
                localStorage.clear()

                window.location.reload()

                destroy()
            }
        }
    ]

    btns.forEach((item)=>{
        btn(item.name, item.select)
    })

    html.find('.lang__selector').append(scroll.render())

    $('body').append(html)

    Controller.add('developer',{
        toggle: ()=>{
            Controller.collectionSet(scroll.render())
            Controller.collectionFocus(false,scroll.render())
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        }
    })
    
    Controller.toggle('developer')
}

export default {
    open
}