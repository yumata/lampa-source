import Template from '../../template'
import Storage from '../../../core/storage/storage'
import Account from '../../../core/account/account'
import Utils from '../../../utils/utils'
import Controller from '../../../core/controller'
import Lang from '../../../core/lang'
import Input from '../../settings/input'
import Activity from '../../activity/activity'
import Noty from '../../noty'
import Platform from '../../../core/platform'
import Bell from '../../bell'
import Manifest from '../../../core/manifest'
import Modal from '../../modal'

function containsLongWords(str, length = 15) {
    let any = false
    
    str.split(/\s/).map(a=>{
        if(a.length >= length) any = true
    })
    
    return any
}

function containsFiveWords(str) {
    let words = str.split(/\s/)
    let count = 0
    
    words.map(a=>{
        if(a.length >= 5) count++
    })
    
    return count
}

function filter(text){
    let err = 0
    
    if(/\d{4,}/g.test(text))               err = 1
    else if(!/[а-яА-ЯёЁ]{5,}/.test(text))  err = 2
    else if(!/[.,:;!?]/.test(text))   	   err = 3
    else if(/[*%$#_+=|^&]/.test(text))     err = 4
    else if(containsFiveWords(text) < 5)   err = 5
    else if(containsLongWords(text))       err = 6
    else if(text.length > 300)             err = 7
    
    return err
}


class Module{
    onCreate(){
        this.html = Template.elem('div',{class: 'full-review-add selector'})

        this.html.on('hover:enter', ()=>{
            if(this.added) return Noty.show(Lang.translate('account_discuss_added_ready'))

            if(Account.Permit.access){
                let add_value  = ''
                let controller = Controller.enabled().name

                if(Platform.tv()){
                    let html = Template.js('modal_qr', {
                        qr_text: Lang.translate('account_discuss_add_qr'),
                        title: Lang.translate('account_discuss_add_title')
                    })

                    html.addClass('layer--' + (Platform.mouse() ? 'wheight' : 'height'))

                    html.find('.account-modal-split__text').html(Lang.translate('account_discuss_add_text'))
                
                    let code = html.find('.account-modal-split__qr-code')
                    let url  = [Activity.active().source, Activity.active().method, Activity.active().id].join('/')
            
                    Utils.qrcode('https://' +  Manifest.cub_site + '/addcomment/' + url, code, ()=>{
                        code.remove()
                    })
                    
                    Modal.open({
                        title: '',
                        html: $(html),
                        size: 'full',
                        scroll: {
                            nopadding: true
                        },
                        onBack: ()=>{
                            Modal.close()
                
                            Controller.toggle(controller)
                        }
                    })
                }
                else{
                    let rules_html = Template.js('discuss_rules')
                    
                    document.body.append(rules_html)

                    let keyboard = Input.edit({
                        title: '',
                        value: add_value,
                        nosave: true,
                        textarea: true,
                        align: Platform.screen('mobile') ? 'top' : 'center',
                        keyboard: 'integrate',
                    },(new_value)=>{
                        rules_html.remove()

                        add_value = new_value

                        if(new_value){
                            Account.Api.load('discuss/add', {}, {
                                id: [Activity.active().method, Activity.active().id].join('_'),
                                comment: new_value,
                                lang: Storage.field('language')
                            }).then(data=>{
                                this.added = true

                                Bell.push({text: Lang.translate('account_discuss_added')})
                            }).catch(e=>{
                                Noty.show(Lampa.Network.errorJSON(e).text || Lang.translate('network_500'), {time: 5000})
                            })
                        }

                        Controller.toggle(controller)
                    })

                    let keypad = $('.simple-keyboard')
                    let helper = $('<div class="discuss-rules-helper hide"></div>')

                    if(keypad.find('.simple-keyboard-input').length){
                        keypad.after(helper)

                        keyboard.listener.follow('change',(event)=>{
                            let code = filter(event.value.trim())

                            helper.toggleClass('hide', !Boolean(code)).text(Lang.translate('discuss_rules_rule_' + code))
                        })
                    }
                }
            }
            else{
                Account.Advert.account()
            }
        })
    }
}

export default Module