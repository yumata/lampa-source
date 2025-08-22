import Define from './utils/define'
import PromisePolyfill from './utils/promise-polyfill'
import Manifest from './utils/manifest'
import Lang from './utils/lang'
import Platform from './utils/platform'
import Render from './interaction/render'
import Keypad from './core/keypad'
import Activity from './interaction/activity/activity'
import Controller from './core/controller'
import Layer from './utils/layer'
import Select from './interaction/select'
import Favorite from './utils/favorite'
import Background from './interaction/background'
import Notice from './interaction/notice/notice'
import NoticeClass from './interaction/notice/class'
import NoticeClassLampa from './interaction/notice/lampa'
import Head from './interaction/head/head'
import Menu from './interaction/menu'
import Utils from './utils/math'
import Console from './interaction/console'
import Params from './interaction/settings/params'
import Input from './interaction/settings/input'
import Screensaver from './interaction/screensaver'
import Android from './utils/android'
import Subscribe from './utils/subscribe'
import Storage from './utils/storage'
import Template from './interaction/template'
import Component from './core/component'
import Reguest from './utils/reguest'
import Filter from './interaction/filter'
import Files from './interaction/files_old'
import Explorer from './interaction/explorer'
import Scroll from './interaction/scroll'
import Empty from './interaction/empty/empty'
import Arrays from './utils/arrays'
import Noty from './interaction/noty'
import Player from './interaction/player'
import PlayerVideo from './interaction/player/video'
import PlayerPanel from './interaction/player/panel'
import PlayerInfo from './interaction/player/info'
import PlayerIPTV from './interaction/player/iptv'
import PlayerPlaylist from './interaction/player/playlist'
import Timeline from './interaction/timeline'
import Settings from './interaction/settings/settings'
import SettingsApi from './interaction/settings/api'
import Modal from './interaction/modal'
import Api from './core/api'
import Info from './interaction/info_old'
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
import InteractionMain from './interaction/items/old/main'
import InteractionCategory from './interaction/items/old/category'
import InteractionLine from './interaction/items/old/line'
import Status from './utils/status'
import LangChoice from './interaction/lang'
import Extensions from './interaction/extensions/extensions'
import Iframe from './interaction/iframe'
import Parser from './utils/api/parser'
import TMDB from './utils/tmdb'
import Base64 from './utils/base64'
import Loading from './interaction/loading'
import YouTube from './interaction/youtube'
import WebOSLauncher from './utils/webos_launcher'
import Event from './utils/event'
import Search from './interaction/search/global'
import Developer from './interaction/developer'
import DeviceInput from './utils/device_input'
import AppWorker from './utils/worker'
import Theme from './utils/theme'
import AdManager from './interaction/advert/manager'
import DB from './utils/db'
import NavigationBar from './interaction/navigation_bar'
import Endless from './interaction/endless'
import Color from './utils/color'
import Cache from './utils/cache'
import Demo from './utils/demo'
import Torrent from './interaction/torrent'
import Torserver from './interaction/torserver'
import Speedtest from './interaction/speedtest'
import VPN from './utils/vpn'
import Processing from './interaction/processing'
import ParentalControl from './interaction/parental_control'
import Personal from './utils/personal'
import Sound from './utils/sound'
import Iptv from './utils/iptv'
import Bell from './interaction/bell'
import HoverSwitcher from './core/switcher'
import Ai from './utils/api/ai'
import Mirrors from './utils/mirrors'
import HTTPS from './utils/https'
import Task from './utils/loading'
import App from './utils/app'
import LoadingProgress from './interaction/loading_progress'
import Logs from './utils/logs'
import StorageMenager from './interaction/storage_manager'
import Markers from './utils/markers'

import OtherTorserver from './utils/other/torrserver'
import OtherWatched from './utils/other/watched'
import OtherSettings from './utils/other/settings'
import OtherLibs from './utils/other/libs'
import OtherMetric from './utils/other/metric'
import OtherGOD from './utils/other/god'
import OtherRemoteFavorites from './utils/other/remote_favorites'
import OtherCards from './utils/other/cards'

/**
 * Настройки приложения
 */

if(typeof window.lampa_settings == 'undefined'){
    window.lampa_settings = {}
}

Arrays.extend(window.lampa_settings,{
    socket_use: true,
    socket_url: undefined,
    socket_methods: true,

    account_use: true,
    account_sync: true,

    plugins_use: true,
    plugins_store: true,

    torrents_use: navigator.userAgent.toLowerCase().indexOf("ipad") > -1 && window.innerWidth == 1920 && window.innerHeight == 1080 ? false : true,
    white_use: false,

    disable_features: {
        dmca: false,
        reactions: false,
        discuss: false,
        ai: false,
        subscribe: false,
        blacklist: false,
        persons: false,
        ads: false,
        trailers: false,
        install_proxy: false
    },

    lang_use: true,

    read_only: false,

    dcma: false,

    push_state: true,

    iptv: false,

    feed: true
})


if(window.localStorage.getItem('remove_white_and_demo')){
    window.lampa_settings.demo         = false
    window.lampa_settings.white_use    = false
}

if(window.lampa_settings.iptv){
    window.lampa_settings.socket_use    = false
    window.lampa_settings.plugins_store = false
    window.lampa_settings.plugins_use   = false
    window.lampa_settings.account_sync  = false
    window.lampa_settings.torrents_use  = false
}

/**
 * Делаем классы доступными в глобальной области видимости
 */
function initClass(){
    window.Lampa = {
        Listener: Subscribe(),
        Lang,
        Subscribe,
        Storage,
        Platform,
        Utils,
        Params,
        Menu,
        Head,
        Notice,
        NoticeClass,
        NoticeClassLampa,
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
        Explorer,
        Scroll,
        Empty,
        Arrays,
        Noty,
        Player,
        PlayerVideo,
        PlayerInfo,
        PlayerPanel,
        PlayerIPTV,
        PlayerPlaylist,
        Timeline,
        Modal,
        Api,
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
        Extensions,
        Tizen,
        Layer,
        Console,
        Iframe,
        Parser,
        Manifest,
        TMDB,
        Base64,
        Loading,
        YouTube,
        WebOSLauncher,
        Event,
        Search,
        DeviceInput,
        Worker: AppWorker,
        DB,
        NavigationBar,
        Endless,
        Color,
        Cache,
        Torrent,
        Torserver,
        Speedtest,
        Processing,
        ParentalControl,
        VPN,
        Bell,
        StorageMenager,
        Network: new Reguest()
    }
}

/**
 * Подготовка приложения к запуску
 */
function prepareApp(){
    if(window.prepared_app) return

    LoadingProgress.init()

    $('body').append(Noty.render())

    DeviceInput.init()

    LoadingProgress.status('DeviceInput init')

    Platform.init()

    LoadingProgress.status('Platform init')

    Params.init()

    LoadingProgress.status('Params init')

    Controller.observe()

    LoadingProgress.status('Controller observe init')

    Console.init()

    LoadingProgress.status('Console init')

    Keypad.init()

    LoadingProgress.status('Keypad init')

    Layer.init()

    LoadingProgress.status('Layer init')

    HoverSwitcher.init()

    //передаем фокус в контроллер

    Navigator.follow('focus', (event)=>{
        Controller.focus(event.elem)
    })

    //выход в начальном скрине

    Keypad.listener.follow('keydown',(e)=>{
        if(window.appready || Controller.enabled().name == 'modal' || (Platform.is('browser') || Platform.desktop())) return

        if (e.code == 8 || e.code == 27 || e.code == 461 || e.code == 10009 || e.code == 88) App.modalClose()
    })

    LoadingProgress.status('Subscribe on keydown')

    //отключаем правый клик

    if(window.innerWidth > 1280) window.addEventListener("contextmenu", e => e.preventDefault())
    
    App.loadStyle()

    LoadingProgress.status('Loaded styles')

    Layer.update()

    LoadingProgress.status('Prepare ready')

    window.prepared_app = true
}

/**
 * Меню разработчика
 */
function developerApp(proceed){
    let expect  = true
    let pressed = 0

    let timer   = setTimeout(()=>{
        expect  = false

        proceed()
    }, 1000)

    let check = ()=>{
        pressed++

        if(pressed === 3){
            clearTimeout(timer)

            expect = false

            Keypad.enable()

            Developer.open(()=>{
                Keypad.disable()

                proceed()
            })

            console.log('Developer mode','on')
        }
    }

    let keydown = (event)=>{
        if(expect){
            if(event.keyCode === 38||event.keyCode === 29460||event.keyCode === 50400012) check()
        }
        else{
            document.removeEventListener('keydown', keydown)
        }
    }

    $('.welcome').on('click', (e)=>{
        if(expect && DeviceInput.canClick(e.originalEvent)) check()
    })

    window.addEventListener("keydown", keydown)
}

/**
 * Старт приложения
 */
function startApp(){
    if(window.appready) return

    window.app_time_launch = Date.now()
    window.app_time_end    = 0

    //стартуем

    LoadingProgress.status('Launching the application')

    Lampa.Listener.send('app',{type:'start'})

    //инициализируем классы

    Storage.init()
    HTTPS.init()
    Mirrors.init()
    Personal.init()
    Head.init()
    Settings.init()
    Select.init()
    Favorite.init()
    Background.init()
    Markers.init()
    Notice.init()
    Bell.init()
    Menu.init()
    Activity.init()
    Screensaver.init()
    Socket.init()
    Account.init()
    Extensions.init()
    Plugins.init()
    Recomends.init()
    TimeTable.init()
    Helper.init()
    Tizen.init()
    Player.init()
    Iframe.init()
    Parser.init()
    WebOSLauncher.init()
    Theme.init()
    AdManager.init()
    NavigationBar.init()
    Demo.init()
    Speedtest.init()
    Processing.init()
    ParentalControl.init()
    Android.init()
    Sound.init()
    Iptv.init()
    Logs.init()
    Broadcast.init()
    Search.init()

    //добавляем источники поиска

    if(window.lampa_settings.account_use && !window.lampa_settings.disable_features.ai) Search.addSource(Ai.discovery())

    LoadingProgress.status('Initialization successful')

    //выводим информацию о приложении

    let ratio = window.devicePixelRatio || 1

    console.log('App','screen size:', Math.round(window.innerWidth * ratio) + ' / ' + Math.round(window.innerHeight * ratio))
    console.log('App','interface size:', window.innerWidth + ' / ' + window.innerHeight)
    console.log('App','pixel ratio:', window.devicePixelRatio)
    console.log('App','user agent:', navigator.userAgent)
    console.log('App','is tv:', Platform.screen('tv'))
    console.log('App','is mobile:', Platform.screen('mobile'))
    console.log('App','is touch:', Utils.isTouchDevice())
    console.log('App','is PWA:', Utils.isPWA())
    console.log('App','platform:', Storage.get('platform', 'noname'))
    console.log('App','version:', Manifest.app_version)

    //записываем uid

    if(!Storage.get('lampa_uid','')) Storage.set('lampa_uid', Utils.uid())

    //ренедрим лампу

    Render.app()

    LoadingProgress.status('Render app')

    //скрытие логотипа

    setTimeout(()=>{
        LoadingProgress.destroy()

        Keypad.enable()

        Screensaver.enable()

        $('.welcome').fadeOut(500,()=>{
            $(this).remove()
        })
    },1000)

    //инициализируем остальные классы

    OtherTorserver.init()
    OtherWatched.init()
    OtherSettings.init()
    OtherMetric.init()
    OtherGOD.init()
    OtherRemoteFavorites.init()
    OtherCards.init()

    //сообщаем о готовности

    LoadingProgress.status('Send app ready')

    //обновляем слои

    Layer.update()

    //лампа полностью готова

    window.appready = true

    window.app_time_end = Date.now()

    Lampa.Listener.send('app',{type:'ready'})
}

/**
 * Приоритетная загрузка
 */
function loadTask(){
    Task.queue((next)=>{
        LoadingProgress.step(2)

        Mirrors.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.step(3)

        Plugins.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.step(4)

        VPN.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.step(5)

        Account.task(next)
    })

    Task.secondary(()=>{
        OtherLibs.init()
    })

    Task.secondary(()=>{
        setTimeout(startApp, 5000)
    })

    Task.secondary(()=>{
        Plugins.load(startApp)
    })

    Task.start()
}

/**
 * Загрузка языка
 */
function loadLang(){
    let code = window.localStorage.getItem('language') || 'ru'

    LoadingProgress.step(1)
    
    if(['ru','en'].indexOf(code) >= 0) loadTask()
    else{
        LoadingProgress.status('Loading language')

        $.ajax({
            url: (location.protocol == 'file:' || Platform.desktop() ? Manifest.github_lampa : './') + 'lang/' + code + '.js',
            dataType: 'text',
            timeout: 10000,
            success: (data)=>{
                try{
                    let translate = {}

                    eval((data + '').replace(/export default/g,'translate = ').trim())

                    Lang.AddTranslation(code, translate)
                }
                catch(e){}

                loadTask()
            },
            error: loadTask
        })
    }
}

/**
 * Первая загрузка приложения
 */
function loadApp(){
    prepareApp() //готовим приложение

    //если язык уже установлен, то запускаем приложение
    if(window.localStorage.getItem('language') || !window.lampa_settings.lang_use){
        //но сперва ожидаем не вызвали ли пользователь меню разработчика, затем подгружаем язык
        developerApp(loadLang)
    }
    else{
        //иначе предлагаем выбрать язык
        LangChoice.open((code)=>{
            Storage.set('language', code, true)
            Storage.set('tmdb_lang',code, true)

            Keypad.disable()

            loadLang()
        })

        Keypad.enable()
    }
}

if(!window.fitst_load){
    window.fitst_load = true

    initClass()
    
    if(navigator.userAgent.toLowerCase().indexOf('lampa_client') > -1){
        function checkReady(){
            if(window.innerWidth > 0) loadApp()
            else{
                setTimeout(checkReady,100)
            }
        }

        checkReady()
    }
    else loadApp()
}
