import Platform from './utils/platform'
import Orsay from './utils/orsay'
import Template from './interaction/template'
import Render from './interaction/render'
import Keypad from './interaction/keypad'
import Activity from './interaction/activity'
import Controller from './interaction/controller'
import Layer from './utils/layer'
import Select from './interaction/select'
import Favorite from './utils/favorite'
import Background from './interaction/background'
import Notice from './interaction/notice'
import Head from './components/head'
import Menu from './components/menu'
import Utils from './utils/math'
import Console from './interaction/console'
import Params from './components/settings/params'

if(!window.appready){
    window.appready = true; // не знаю почему, но похоже что скрипт 2 раза запускается у некоторых

    Keypad.init()
    Console.init()
    Platform.init()
    Params.init()
    Favorite.init()
    Background.init()
    Notice.init()
    Head.init()
    Menu.init()
    Activity.init()
    Orsay.init()
    Layer.init()

    Controller.listener.follow('toggle',()=>{
        Layer.update()
    })

    Activity.listener.follow('backward',(event)=>{
        if(event.count == 1){
            let enabled = Controller.enabled()

            Select.show({
                title: 'Выход',
                items: [
                    {
                        title: 'Да выйти',
                        out: true
                    },
                    {
                        title: 'Продолжить'
                    }
                ],
                onSelect: (a)=>{
                    if(a.out){
                        Activity.out()

                        Controller.toggle(enabled.name)

                        if(Platform.is('tizen')) tizen.application.getCurrentApplication().exit()
                        if(Platform.is('webos')) window.close()
                        if(Platform.is('android')) $('<a href="lampa://exit"></a>')[0].click()
                    }
                    else{
                        Controller.toggle(enabled.name)
                    }
                },
                onBack: ()=>{
                    Controller.toggle(enabled.name)
                }
            })
        }
    })

    Navigator.follow('focus', (event)=>{
        Controller.focus(event.elem)
    })

    Render.app()

    Activity.last()

    setTimeout(()=>{
        Keypad.enable()

        $('.welcome').fadeOut(500)
    },1000)

    Utils.putScript([
        'https://js.sentry-cdn.com/6e63d90a0fc743f3a4bc219d9849fc62.min.js'
    ],()=>{
        
    })

    if(Platform.any()){
        Utils.putStyle([
            'https://yumata.github.io/lampa/css/app.css'
        ],()=>{
            $('link[href="css/app.css"]').remove()
        })
    }
}