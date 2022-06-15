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
import Input from './components/settings/input'
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
import PlayerVideo from './interaction/player/video'
import PlayerPanel from './interaction/player/panel'
import PlayerInfo from './interaction/player/info'
import PlayerPlaylist from './interaction/player/playlist'
import Timeline from './interaction/timeline'
import Settings from './components/settings'
import SettingsApi from './components/settings/api'
import Modal from './interaction/modal'
import Api from './interaction/api'
import Cloud from './utils/cloud'
import Info from './interaction/info'
import Card from './interaction/card'
import Account from './utils/account'
import Plugins from './utils/plugins'
import Socket from './utils/socket'
import Recomends from './utils/recomend'
import VideoQuality from './utils/video_quality'
import TimeTable from './utils/timetable'
import Broadcast from './interaction/broadcast'
import Helper from './interaction/helper'
import Tizen from './utils/tizen'
import InteractionMain from './interaction/items/main'
import InteractionCategory from './interaction/items/category'
import InteractionLine from './interaction/items/line'
import Status from './utils/status'


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
    PlayerVideo,
    PlayerInfo,
    PlayerPanel,
    PlayerPlaylist,
    Timeline,
    Modal,
    Api,
    Cloud,
    Settings,
    SettingsApi,
    Android,
    Card,
    Info,
    Account,
    Socket,
    Input,
    Screensaver,
    Recomends,
    VideoQuality,
    TimeTable,
    Broadcast,
    Helper,
    InteractionMain,
    InteractionCategory,
    InteractionLine,
    Status,
    Plugins,
    Tizen,
    Layer
}

Console.init()

function startApp(){
    if(window.appready) return

    /** Стартуем */

    Lampa.Listener.send('app',{type:'start'})

    /** Инициализируем классы */

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
    Socket.init()
    Recomends.init()
    VideoQuality.init()
    TimeTable.init()
    Helper.init()
    Tizen.init()

    /** Надо зачиcтить, не хорошо светить пароль ;) */

    Storage.set('account_password','')

    /** Следим за переключением контроллера */

    Controller.listener.follow('toggle',()=>{
        Layer.update()
    })

    /** Выход из приложения */

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
                        if(Platform.is('orsay')) Orsay.exit()
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

    /** Передаем фокус в контроллер */

    Navigator.follow('focus', (event)=>{
        Controller.focus(event.elem)
    })

    /** Ренедрим лампу */

    Render.app()

    /** Обновляем слои */

    Layer.update()

    /** Активируем последнию активность */

    Activity.last()

    /** Гасим свет :D */

    setTimeout(()=>{
        Keypad.enable()

        Screensaver.enable()

        $('.welcome').fadeOut(500)
    },1000)


    /** Если это тач дивайс */

    if(Utils.isTouchDevice()) $('body').addClass('touch-device')

    /** Start - для orsay одни стили, для других другие */

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

    /** End */

    /** Start - если это андроид */

    if(Platform.is('android')){
        Params.listener.follow('button',(e)=>{
            if(e.name === 'reset_player'){
                Android.resetDefaultPlayer()
            }
        })

        Favorite.listener.follow('add,added,remove', (e)=>{
            Android.updateChannel(e.where)
        })
    }

    /** End */

    /** Start - записываем популярные фильмы */

    Favorite.listener.follow('add,added',(e)=>{
        if(e.where == 'history' && e.card.id){
            $.get(Utils.protocol() + 'tmdb.cub.watch/watch?id='+e.card.id+'&cat='+(e.card.original_name ? 'tv' : 'movie'))
        }
    })

    /** End */

    /** Start - следим за переключением в лайт версию и обновляем интерфейс */

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'light_version'){
            $('body').toggleClass('light--version',Storage.field('light_version'))

            Layer.update()
        }

        if(e.name == 'keyboard_type'){
            $('body').toggleClass('system--keyboard',Storage.field('keyboard_type') == 'lampa' ? false : true)
        } 
    })

    /** End */

    /** Start - проверка статуса для торрента */

    let torrent_net = new Reguest()

    function check(name) {
        let item = $('[data-name="'+name+'"]').find('.settings-param__status').removeClass('active error wait').addClass('wait')
        let url  = Storage.get(name)

        if(url){
            torrent_net.timeout(10000)

            torrent_net.native(Utils.checkHttp(Storage.get(name)), ()=>{
                item.removeClass('wait').addClass('active')
            }, (a, c)=> {
                Noty.show(torrent_net.errorDecode(a, c) +' - ' + url)
                item.removeClass('wait').addClass('error')
            }, false, {
                dataType: 'text'
            })
        }
    }

    Storage.listener.follow('change', function (e) {
        if (e.name == 'torrserver_url') check(e.name)
        if (e.name == 'torrserver_url_two') check(e.name)
        if (e.name == 'torrserver_use_link') check(e.value == 'one' ? 'torrserver_url' : 'torrserver_url_two')
    })

    Settings.listener.follow('open', function (e){
        if(e.name == 'server'){
            check(Storage.field('torrserver_use_link') == 'one' ? 'torrserver_url' : 'torrserver_url_two')
        }
        else torrent_net.clear()
    })

    /** End */

    /** Добавляем класс платформы */

    $('body').addClass('platform--'+Platform.get())

    /** Включаем лайт версию если было включено */

    $('body').toggleClass('light--version',Storage.field('light_version')).toggleClass('system--keyboard',Storage.field('keyboard_type') == 'lampa' ? false : true)

    /** Добавляем hls плагин */

    Utils.putScript([window.location.protocol == 'file:' ? 'https://yumata.github.io/lampa/vender/hls/hls.js' : './vender/hls/hls.js'],()=>{})

    /** Сообщаем о готовности */

    Lampa.Listener.send('app',{type:'ready'})

    /** Меню готово */

    Menu.ready()

    /** Лампа полностью готова */

    window.appready = true

    /** Start - активация режима GOD, жмем 🠔🠔 🠕🠕 🠖🠖 🠗🠗 */

    let mask = [37,37,38,38,39,39,40,40],
        psdg = -1

    Keypad.listener.follow('keydown',(e)=>{
        if(e.code == 37 && psdg < 0){
            psdg = 0
        }
        
        if(psdg >= 0 && mask[psdg] == e.code) psdg++
        else psdg = -1

        if(psdg == 8){
            psdg = -1

            console.log('God','enabled')
        }
    })

    let color_keys = {
        '406':'history',
        '405':'wath',
        '404':'like',
        '403':'book',
    }

    Keypad.listener.follow('keydown',(e)=>{
        if(!Player.opened()){
            if(color_keys[e.code]){
                let type = color_keys[e.code]
                
                Activity.push({
                    url: '',
                    title: type == 'book' ? 'Закладки' : type == 'like' ? 'Нравится' : type == 'history' ? 'История просмотров' : 'Позже',
                    component: 'favorite',
                    type: type,
                    page: 1
                })
            }
        }
    })

    /** End */
}

/** Принудительно стартовать */

setTimeout(startApp,1000*5)

/** Загружаем плагины и стартуем лампу */

Plugins.load(startApp)