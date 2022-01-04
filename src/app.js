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
import Api from './interaction/api'
import Cloud from './utils/cloud'
import Info from './interaction/info'
import Card from './interaction/card'
import Account from './utils/account'
import Plugins from './utils/plugins'


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
    Api,
    Cloud,
    Settings,
    Android,
    Card,
    Info,
    Account
}

Console.init()


function startApp(){
    if(window.appready) return

    Lampa.Listener.send('app',{type:'start'})

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
    Account.init()
    Plugins.init()

    Storage.set('account_password','') //надо зачиcтить, не хорошо светить пароль ;)

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
                        title: 'Да, выйти',
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
                        //пока не используем, нужно разобраться почему вызывается активити при загрузке главной
                        //if(Platform.is('orsay')) Orsay.exit()
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

    Layer.update()

    Activity.last()

    setTimeout(()=>{
        Keypad.enable()

        Screensaver.enable()

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
    else if(window.location.protocol == 'file:'){
        Utils.putStyle([
            'https://yumata.github.io/lampa/css/app.css'
        ],()=>{
            $('link[href="css/app.css"]').remove()
        })
    }

    if(Platform.is('android')){
        Params.listener.follow('button',(e)=>{
            if(e.name === 'reset_player'){
                Android.resetDefaultPlayer()
            }
        })
    }

    Favorite.listener.follow('add,added',(e)=>{
        if(e.where == 'history' && e.card.id){
            $.get(Utils.protocol() + 'tmdb.cub.watch/watch?id='+e.card.id+'&cat='+(e.card.original_name ? 'tv' : 'movie'))
        }
    })

    Lampa.Listener.send('app',{type:'ready'})

    Menu.ready()

    window.appready = true //пометка что уже загружено
}

// принудительно стартовать
setTimeout(startApp,1000*5)

Plugins.load(startApp)