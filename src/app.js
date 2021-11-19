import Define from './utils/define'
import Platform from './utils/platform'
import Orsay from './utils/orsay'
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
import Screensaver from './interaction/screensaver'
import Android from './utils/android'
import Subscribe from './utils/subscribe'
import Storage from './utils/storage'
import Template from './interaction/template'
import Component from './interaction/component'
import Reguest from './utils/reguest'
import Filter from './interaction/filter'
import Files from './interaction/files'
import Scroll from './interaction/scroll'
import Empty from './interaction/empty'
import Arrays from './utils/arrays'
import Noty from './interaction/noty'
import Player from './interaction/player'
import Timeline from './interaction/timeline'
import Settings from './components/settings'
import Modal from './interaction/modal'
import Cloud from './utils/cloud'


window.Lampa = {
    Listener: Subscribe(),
    Subscribe,
    Storage,
    Platform,
    Utils,
    Params,
    Menu,
    Head,
    Notice,
    Background,
    Favorite,
    Select,
    Controller,
    Activity,
    Keypad,
    Template,
    Component,
    Reguest,
    Filter,
    Files,
    Scroll,
    Empty,
    Arrays,
    Noty,
    Player,
    Timeline,
    Modal,
    Cloud
}

Console.init()

function startApp(){
    if(window.appready) return

    Keypad.init()
    Settings.init()
    Platform.init()
    Params.init()
    Favorite.init()
    Background.init()
    Notice.init()
    Head.init()
    Menu.init()
    Activity.init()
    if(Platform.is('orsay')){Orsay.init()}
    Layer.init()
    Screensaver.init()
    Cloud.init()

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
                        if(Platform.is('android')) Android.exit()
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
        Screensaver.enable();

        $('.welcome').fadeOut(500)
    },1000)

    $('body').addClass('platform--'+Platform.get())

    if(Platform.is('orsay')){
        Utils.putStyle([
            'http://lampa.mx/css/app.css'
        ],()=>{
            $('link[href="css/app.css"]').remove()
        })
    }
    else if (Platform.is('android')){
        Params.listener.follow('button',(e)=>{
            if(e.name === 'reset_player'){
                Android.resetDefaultPlayer()
            }
        })
    }
    else if(window.location.protocol == 'file:'){
        Utils.putStyle([
            'https://yumata.github.io/lampa/css/app.css'
        ],()=>{
            $('link[href="css/app.css"]').remove()
        })
    }

    window.appready = true //пометка что уже загружено
}

// принудительно стартовать
setTimeout(startApp,1000*5)

console.log('Plugins','list:', Storage.get('plugins','[]'))

let plugins = Storage.get('plugins','[]')

Utils.putScript(plugins,startApp)
