import Template from '../../interaction/template'
import Keybord from '../../interaction/keyboard'
import Controller from '../../interaction/controller'
import Select from '../../interaction/select'
import Utils from '../../utils/math'

let html,keyboard,input

function edit(params, call){
    html = Template.get('settings_input')

    input = html.find('.settings-input__input')

    $('body').append(html)

    keyboard = new Keybord()

    keyboard.listener.follow('change',(event)=>{
        input.text(event.value.trim())
    })

    keyboard.listener.follow('enter',(event)=>{
        call(input.text())

        back()
    })
    
    keyboard.listener.follow('down',(event)=>{
        Select.show({
            title: 'Ссылки',
            items: [
                {
                    title: Utils.shortText('api.scraperapi.com/?url={q}&api_key=',35),
                    subtitle: 'scraperapi.com',
                    url: 'api.scraperapi.com/?url={q}&api_key='
                },
                {
                    title: Utils.shortText('Для торрентов jac.red',35),
                    subtitle: 'jac.red',
                    url: 'jac.red'
                },
                {
                    title: Utils.shortText('Для локального TorrServ',35),
                    subtitle: '127.0.0.1:8090',
                    url: '127.0.0.1:8090'
                }
            ],
            onSelect: (a)=>{
                keyboard.value(a.url)

                keyboard.toggle()
            },
            onBack: ()=>{
                keyboard.toggle()
            }
        })
    })

    keyboard.listener.follow('back',back)

    keyboard.create()

    keyboard.value(params.value)

    keyboard.toggle()
}


function back(){
    destroy()

    Controller.toggle('settings_component')
}

function destroy(){
    keyboard.destroy()

    html.remove()

    html = null
    keyboard = null
    input = null
}

export default {
    edit
}