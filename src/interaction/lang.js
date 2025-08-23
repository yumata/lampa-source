import Storage from '../core/storage/storage'
import Controller from '../core/controller'
import Template from './template'
import Lang from '../core/lang'
import Scroll from './scroll'

/**
 * Открывает окно выбора языка на начальном экране
 * @param {function} callSelected - вызывается при выборе языка, получает код языка
 * @param {function} callCancel - вызывается при отмене выбора
 * @returns {void}
 */
function open(callSelected, callCancel){
    let html   = Template.get('lang_choice',{})
    let scroll = new Scroll({mask:true,over:true})
    let codes  = Lang.codes()

    function selector(code){
        let item = $('<div class="selector lang__selector-item" data-code="'+code+'">'+codes[code]+'</div>')

        item.on('hover:enter',(e)=>{
            if(callSelected) callSelected(code)

            html.fadeOut(300,()=>{
                scroll.destroy()
                html.remove()

                scroll = null
                html   = null
            })
        }).on('hover:focus',(e)=>{
            scroll.update($(e.target), true)

            $('.lang__selector-item',html).removeClass('last-focus')

            $(e.target).addClass('last-focus')

            html.find('.lang__title').text(Lang.translate('lang_choice_title', code))
            html.find('.lang__subtitle').text(Lang.translate('lang_choice_subtitle', code))
        })

        scroll.append(item)
    }

    for(let code in codes) selector(code)

    html.find('.lang__selector').append(scroll.render())

    $('body').append(html)

    Controller.add('language',{
        toggle: ()=>{
            let focus = html.find('[data-code="'+Storage.get('language','ru')+'"]')

            Controller.collectionSet(scroll.render())
            Controller.collectionFocus(focus[0],scroll.render())
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        back: ()=>{
            if(callCancel){
                scroll.destroy()
                html.remove()

                scroll = null
                html   = null

                callCancel()
            } 
        }
    })
    
    Controller.toggle('language')
}

export default {
    open
}