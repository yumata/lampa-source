import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Utils from '../../../utils/utils'
import Storage from '../../../core/storage/storage'
import Lang from '../../../core/lang'
import Extensions from '../../../interaction/extensions/extensions'
import ParentalControl from '../../../interaction/parental_control'
import Platform from '../../../core/platform'

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

            // Один источник запускаем сразу, только если нельзя добавить ещё (иначе в списке есть «Добавить источник»)
            if(btns.length == 1 && !window.lampa_settings.plugins_use){
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

                // Последний пункт — открыть Расширения, чтобы установить ещё источник
                if(window.lampa_settings.plugins_use && Platform.is('android')){
                    items.push({
                        title: Lang.translate('full_add_source'),
                        template: 'selectbox_icon',
                        icon: '<svg><use xlink:href="#sprite-plus"></use></svg>',
                        add_source: true
                    })
                }

                Select.show({
                    title: Lang.translate('settings_rest_source'),
                    items: items,
                    onSelect: (a)=>{
                        if(a.add_source){
                            Controller.toggle('content')

                            ParentalControl.personal('extensions',()=>{
                                Extensions.show()
                            }, false, true)
                        }
                        else a.btn.trigger('hover:enter')
                    },
                    onLong: (a)=>{
                        if(a.add_source) return

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