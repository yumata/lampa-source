import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Utils from '../../../utils/utils'
import Storage from '../../../core/storage/storage'
import Lang from '../../../core/lang'

export default {
    onPriorityButton: function(btn){
        let cont = this.html.find('.full-start-new__buttons')
        let clon = btn.clone()

        cont.find('.button--priority').remove()
        
        clon.addClass('button--priority').removeClass('view--torrent').on('hover:enter',()=>{
            btn.trigger('hover:enter')
        }).on('hover:long',()=>{
            clon.remove()

            Storage.set('full_btn_priority','')

            this.last = this.html.find('.button--play')[0]

            Controller.toggle('content')
        })

        cont.prepend(clon)
    },
    onGroupButtons: function(){
        let play = this.html.find('.button--play')
        let btns = this.html.find('.buttons--container > .full-start__button').not('.hide')

        let priority = Storage.get('full_btn_priority','') + ''
        
        if(priority){
            let priority_button
            
            btns.each(function(){
                let hash = Utils.hash($(this).clone().removeClass('focus').prop('outerHTML'))

                if(hash == priority) priority_button = $(this)
            })

            if(priority_button) this.emit('priorityButton', priority_button)
        }

        play.unbind().on('hover:enter',(e)=>{
            priority = Storage.get('full_btn_priority','') + ''

            btns = this.html.find('.buttons--container > .full-start__button').not('.hide').filter(function(){
                return priority !== Utils.hash($(this).clone().removeClass('focus').prop('outerHTML'))
            })

            if(btns.length == 1){
                btns.trigger('hover:enter')
            }
            else{
                let items = []

                btns.each(function(){
                    let icon = $(this).find('svg').prop('outerHTML')

                    items.push({
                        title: $(this).text(),
                        subtitle: $(this).data('subtitle'),
                        template: typeof icon == 'undefined' || icon == 'undefined' ? 'selectbox_item' : 'selectbox_icon',
                        icon: icon,
                        btn: $(this)
                    })
                })

                Select.show({
                    title: Lang.translate('settings_rest_source'),
                    items: items,
                    onSelect: (a)=>{
                        a.btn.trigger('hover:enter')
                    },
                    onLong: (a)=>{
                        Storage.set('full_btn_priority',Utils.hash(a.btn.clone().removeClass('focus').prop('outerHTML')))
                        
                        this.emit('priorityButton', a.btn)
                    },
                    onBack: ()=>{
                        Controller.toggle('content')
                    }
                })
            }
        }).on('hover:focus', ()=>{
            this.last = play[0]
        })
        
        play.toggleClass('hide',!Boolean(btns.length))
    }
}