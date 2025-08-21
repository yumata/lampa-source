import Template from '../../template'
import Storage from '../../../utils/storage'
import Account from '../../../utils/account'
import Utils from '../../../utils/math'
import Select from '../../../interaction/select'
import Controller from '../../../core/controller'
import Lang from '../../../utils/lang'
import Input from '../../settings/input'

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
            if(Account.logged()){
                let add_value  = ''
                let controller = Controller.enabled().name

                let rules_html = Template.js('discuss_rules')
                
                document.body.append(rules_html)

                let keyboard = Input.edit({
                    title: '',
                    value: add_value,
                    nosave: true,
                    textarea: true
                },(new_value)=>{
                    rules_html.remove()

                    add_value = new_value

                    if(new_value){
                        Account.addDiscuss({...params.object, comment: new_value},(comment)=>{
                            //add_button.after(this.append(comment))

                            //Layer.visible(scroll.render(true))
                        })
                    }

                    Controller.toggle(controller)
                })

                let keypad = $('.simple-keyboard')
                let helper = $('<div class="discuss-rules-helper hide"></div>')

                if(keypad.hasClass('simple-keyboard--with-textarea')){
                    keypad.append(helper)

                    keyboard.listener.follow('change',(event)=>{
                        let code = filter(event.value.trim())

                        helper.toggleClass('hide', !Boolean(code)).text(Lang.translate('discuss_rules_rule_' + code))
                    })
                }
            }
            else{
                Account.showNoAccount()
            }
        })
    }
}

export default Module