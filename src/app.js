import Define from './utils/define/define'
import PromisePolyfill from './utils/define/promise'
import Manifest from './core/manifest'
import Lang from './core/lang'
import Platform from './core/platform'
import Render from './interaction/render'
import Keypad from './core/keypad'
import Activity from './interaction/activity/activity'
import Controller from './core/controller'
import Layer from './core/layer'
import Select from './interaction/select'
import Favorite from './core/favorite'
import Background from './interaction/background'
import Notice from './interaction/notice/notice'
import NoticeClass from './interaction/notice/class'
import NoticeClassLampa from './interaction/notice/lampa'
import Head from './interaction/head/head'
import Menu from './interaction/menu/menu'
import Utils from './utils/utils'
import Console from './interaction/console'
import Params from './interaction/settings/params'
import Input from './interaction/settings/input'
import Screensaver from './interaction/screensaver'
import Android from './core/android'
import Subscribe from './utils/subscribe'
import Storage from './core/storage/storage'
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
import Api from './core/api/api'
import Info from './interaction/info_old'
import Card from './interaction/card'
import Account from './core/account/account'
import Plugins from './core/plugins'
import Socket from './core/socket'
import Recomends from './core/recomend'
import TimeTable from './core/timetable'
import Broadcast from './interaction/broadcast'
import Helper from './interaction/helper'
import Tizen from './core/tizen'
import InteractionMain from './interaction/items/old/main'
import InteractionCategory from './interaction/items/old/category'
import InteractionLine from './interaction/items/old/line'
import Status from './utils/status'
import LangChoice from './interaction/lang'
import Extensions from './interaction/extensions/extensions'
import Iframe from './interaction/iframe'
import Parser from './core/api/sources/parser'
import TMDB from './core/tmdb/tmdb'
import Base64 from './utils/base64'
import Loading from './interaction/loading'
import YouTube from './interaction/youtube'
import WebOSLauncher from './interaction/webos_launcher'
import Event from './utils/event'
import Search from './interaction/search/global'
import Developer from './interaction/developer'
import DeviceInput from './interaction/device_input'
import AppWorker from './utils/worker'
import Theme from './core/theme'
import AdManager from './interaction/advert/manager'
import DB from './utils/db'
import NavigationBar from './interaction/navigation_bar'
import Endless from './interaction/endless'
import Color from './utils/color'
import Cache from './utils/cache'
import Demo from './core/demo'
import Torrent from './interaction/torrent'
import Torserver from './interaction/torserver'
import Speedtest from './interaction/speedtest'
import VPN from './core/vpn'
import Processing from './interaction/processing'
import ParentalControl from './interaction/parental_control'
import Personal from './core/personal'
import Sound from './core/sound'
import Iptv from './core/iptv'
import Bell from './interaction/bell'
import HoverSwitcher from './core/switcher'
import Ai from './core/api/sources/ai'
import Mirrors from './core/mirrors'
import HTTPS from './core/https'
import Task from './core/loading'
import App from './interaction/app'
import LoadingProgress from './interaction/loading_progress'
import Logs from './interaction/logs'
import StorageMenager from './interaction/storage_manager'
import Markers from './core/markers'
import RemoteHelper from './interaction/remote_helper'
import DataBase from './interaction/database'
import Maker from './interaction/maker'
import MaskHelper from './utils/mask'
import ContentRows from './core/content_rows'
import Emit from './utils/emit'
import Router from './core/router'
import Timer from './core/timer'

import ServiceTorserver from './services/torrserver'
import ServiceWatched from './services/watched'
import ServiceSettings from './services/settings'
import ServiceLibs from './services/libs'
import ServiceMetric from './services/metric'
import ServiceDeveloper from './services/developer'
import ServiceRemoteFavorites from './services/remote_favorites'
import ServiceDMCA from './services/dmca'
import ServiceFPS from './services/fps'
import ServiceEvents from './services/events'

window.screen_width  = window.innerWidth
window.screen_height = window.innerHeight

/**
 * Настройки приложения
 */

if(typeof window.lampa_settings == 'undefined'){
    window.lampa_settings = {}
}

let torrents_use = true
let agent        = navigator.userAgent.toLowerCase()
let conditions   = [
    agent.indexOf("ipad") > -1 && window.innerWidth == 1920 && window.innerHeight == 1080,
    agent.indexOf("lampa_client_yasha") > -1,
    typeof AndroidJS !== 'undefined' && (AndroidJS.appVersion() + '').toLowerCase().indexOf('rustore') > -1 && !localStorage.getItem('parser_use')
]

// Если есть условия из списка, то отключаем торренты, дабы пройти модерацию в сторе
if(conditions.indexOf(true) >= 0) torrents_use = false

Arrays.extend(window.lampa_settings,{
    // Использовать сокеты для синхронизации данных
    socket_use: true,

    // Адрес сокета, по умолчанию лампа берет адреса из манифеста
    socket_url: undefined,

    // Обрабатывать сообщения сокетов
    socket_methods: true,

    // Использовать аккаунты CUB
    account_use: true,

    // Синхронизировать закладки, таймкоды и прочее
    account_sync: true,

    // Разрешить установку плагинов и расширений
    plugins_use: true,

    // Разрешить использование магазина расширений
    plugins_store: true,

    // Показывать кнопку торрентов
    torrents_use: torrents_use,

    // Отключить фитчи куба и лампы
    disable_features: {
        // Блокировку карточек
        dmca: false,
        // Реакции
        reactions: false,
        // Обсуждения
        discuss: false,
        // ИИ
        ai: false,
        // Подписка на уведомления
        subscribe: false,
        // Черный список плагинов
        blacklist: false,
        // Подписка на актеров
        persons: false,
        // Вспомогатиленые сервисы на подписку према
        ads: false,
        // Трейлеры
        trailers: false,
        // Установка прокси для запросов
        install_proxy: false
    },

    // Подключить другие языки интерфейса, по умолчанию только русский и английский
    lang_use: true,

    // Белая и пушистая лампа, для одобрения модерации
    white_use: false,

    // Режим только для чтения, без кнопок онлайн и расширений
    read_only: false,

    // Добавить список блокировки карточек, пример: [{"id":3566556,"cat":"movie"},...]
    dcma: false,

    // Добавлять в адресную строку название текущего экрана
    push_state: true,

    // Является ли приложение IPTV
    iptv: false,

    // Показать ленту
    feed: true,

    // Режим разработчика
    developer: {
        enabled: false
    },

    // Размывать постер для мобильных устройств, эффект стекла
    blur_poster: true,

    // Скрывать важные параметры в приложении
    hide_important_params: true,

    // Фикс для виджетов, чтобы не подгружались стили с github
    fix_widget: window.localStorage.getItem('fix_widget') ? true : false,
})


// Если отключили 
if(window.localStorage.getItem('remove_white_and_demo')){
    window.lampa_settings.demo         = false
    window.lampa_settings.white_use    = false
}

// Если IPTV, то отключаем все лишнее
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
        RemoteHelper,
        Network: new Reguest(),
        Maker,
        MaskHelper,
        ContentRows,
        Emit,
        Router,
        Timer
    }
}

/**
 * Подготовка приложения к запуску
 */
function prepareApp(){
    if(window.prepared_app) return

    LoadingProgress.init()

    document.body.append(Noty.render())

    Platform.init()

    LoadingProgress.status('Platform init')

    DeviceInput.init()

    LoadingProgress.status('DeviceInput init')

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

    // Передаем фокус в контроллер

    Navigator.follow('focus', (event)=>{
        Controller.focus(event.elem)
    })

    // Выход в начальном скрине

    Keypad.listener.follow('keydown',(e)=>{
        if(window.appready || Controller.enabled().name == 'modal' || (Platform.is('browser') || Platform.desktop())) return

        if (e.code == 8 || e.code == 27 || e.code == 461 || e.code == 10009 || e.code == 88) App.modalClose()
    })

    LoadingProgress.status('Subscribe on keydown')

    // Отключаем правый клик

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
            if(event.keyCode == 38 || event.keyCode == 29460 || event.keyCode == 50400012) check()
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
    if(window.appready || window.app_time_launch) return

    window.app_time_launch = Date.now()
    window.app_time_end    = 0

    // Стартуем

    LoadingProgress.status('Launching the application')

    Lampa.Listener.send('app',{type:'start'})

    // Инициализируем классы

    Timer.init()
    LoadingProgress.status('Timer init')

    Storage.init()
    LoadingProgress.status('Storage init')

    Timeline.init()
    LoadingProgress.status('Timeline init')

    HTTPS.init()
    LoadingProgress.status('HTTPS init')

    Mirrors.init()
    LoadingProgress.status('Mirrors init')

    Personal.init()
    LoadingProgress.status('Personal init')

    Head.init()
    LoadingProgress.status('Head init')

    Settings.init()
    LoadingProgress.status('Settings init')

    Select.init()
    LoadingProgress.status('Select init')

    Favorite.init()
    LoadingProgress.status('Favorite init')

    Background.init()
    LoadingProgress.status('Background init')

    Markers.init()
    LoadingProgress.status('Markers init')

    Notice.init()
    LoadingProgress.status('Notice init')

    Bell.init()
    LoadingProgress.status('Bell init')

    Menu.init()
    LoadingProgress.status('Menu init')

    Activity.init()
    LoadingProgress.status('Activity init')

    Screensaver.init()
    LoadingProgress.status('Screensaver init')

    Socket.init()
    LoadingProgress.status('Socket init')

    Account.init()
    LoadingProgress.status('Account init')

    Extensions.init()
    LoadingProgress.status('Extensions init')

    Plugins.init()
    LoadingProgress.status('Plugins init')

    Recomends.init()
    LoadingProgress.status('Recomends init')

    TimeTable.init()
    LoadingProgress.status('Timetable init')

    Helper.init()
    LoadingProgress.status('Helper init')

    Tizen.init()
    LoadingProgress.status('Tizen init')

    Player.init()
    LoadingProgress.status('Player init')

    Iframe.init()
    LoadingProgress.status('Iframe init')

    Parser.init()
    LoadingProgress.status('Parser init')

    WebOSLauncher.init()
    LoadingProgress.status('WebOSLauncher init')

    Theme.init()
    LoadingProgress.status('Theme init')

    AdManager.init()
    LoadingProgress.status('AdManager init')

    NavigationBar.init()
    LoadingProgress.status('NavigationBar init')

    Demo.init()
    LoadingProgress.status('Demo init')

    Speedtest.init()
    LoadingProgress.status('Speedtest init')

    Processing.init()
    LoadingProgress.status('Processing init')

    ParentalControl.init()
    LoadingProgress.status('ParentalControl init')

    Android.init()
    LoadingProgress.status('Android init')

    Sound.init()
    LoadingProgress.status('Sound init')

    Iptv.init()
    LoadingProgress.status('Iptv init')

    Logs.init()
    LoadingProgress.status('Logs init')

    Broadcast.init()
    LoadingProgress.status('Broadcast init')

    Search.init()
    LoadingProgress.status('Search init')

    DataBase.init()
    LoadingProgress.status('DataBase init')
    
    // Добавляем источники поиска

    if(window.lampa_settings.account_use && !window.lampa_settings.disable_features.ai) Search.addSource(Ai.discovery())

    LoadingProgress.status('Initialization successful')

    // Выводим информацию о приложении

    let ratio = window.devicePixelRatio || 1

    console.log('App','screen size:', Math.round(window.innerWidth * ratio) + ' / ' + Math.round(window.innerHeight * ratio))
    console.log('App','interface size:', window.innerWidth + ' / ' + window.innerHeight)
    console.log('App','pixel ratio:', window.devicePixelRatio)
    console.log('App','user agent:', navigator.userAgent)
    console.log('App','touch points:', navigator.maxTouchPoints)
    console.log('App','is tv:', Platform.screen('tv'))
    console.log('App','is mobile:', Platform.screen('mobile'))
    console.log('App','is touch:', Utils.isTouchDevice())
    console.log('App','is PWA:', Utils.isPWA())
    console.log('App','platform:', Storage.get('platform', 'noname'))
    console.log('App','version:', Manifest.app_version)
    console.log('App','build date:', '{__APP_BUILD__}')
    console.log('App','hash', '{__APP_HASH__}')
    console.log('App','location:', location.href)

    // Записываем uid

    if(!Storage.get('lampa_uid','')) Storage.set('lampa_uid', Utils.uid())

    // Ренедрим лампу

    Render.app()

    LoadingProgress.status('Render app')

    // Инициализируем остальные сервисы

    ServiceDeveloper.init()
    LoadingProgress.status('ServiceDeveloper init')

    ServiceTorserver.init()
    LoadingProgress.status('ServiceTorserver init')

    ServiceWatched.init()
    LoadingProgress.status('ServiceWatched init')

    ServiceSettings.init()
    LoadingProgress.status('ServiceSettings init')

    ServiceMetric.init()
    LoadingProgress.status('ServiceMetric init')

    ServiceRemoteFavorites.init()
    LoadingProgress.status('ServiceRemoteFavorites init')

    ServiceDMCA.init()
    LoadingProgress.status('ServiceDMCA init')

    ServiceFPS.init()
    LoadingProgress.status('ServiceFPS init')

    ServiceEvents.init()
    LoadingProgress.status('ServiceEvents init')

    ServiceLibs.init()
    LoadingProgress.status('ServiceLibs init')

    // Обновляем слои

    Layer.update()

    LoadingProgress.status('Layer update')

    // Сообщаем о готовности

    LoadingProgress.status('Send app ready')

    // Лампа полностью готова

    window.appready = true

    window.app_time_end = Date.now()

    Lampa.Listener.send('app',{type:'ready'})
}

/**
 * Показать приложение в любом случае
 */
function showApp(){
    LoadingProgress.status('Show app')
    
    // Скрытие логотипа
    setTimeout(()=>{
        if(window.show_app) return

        window.show_app = true

        LoadingProgress.destroy()

        Keypad.enable()

        Screensaver.enable()

        $('.welcome').fadeOut(500,()=>{
            $(this).remove()
        })
    },1000)

    // Старт приложения
    startApp()
}

/**
 * Приоритетная загрузка
 */
function loadTask(){
    Task.queue((next)=>{
        LoadingProgress.status('Open cache database')

        Cache.openDatabase().then(()=>{
            console.log('Cache', 'worked')

            next()
        }).catch(()=>{
            console.log('Cache', 'error', 'no open database')

            next()
        })
    })

    Task.queue((next)=>{
        LoadingProgress.status('Storage load reserve')
        
        Storage.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.status('Mirrors initialization')

        LoadingProgress.step(2)

        Mirrors.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.status('Plugins initialization')

        LoadingProgress.step(3)

        Plugins.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.status('Proxy initialization')

        LoadingProgress.step(4)

        VPN.task(next)
    })

    Task.queue((next)=>{
        LoadingProgress.status('Account initialization')

        LoadingProgress.step(5)

        Account.task(next)
    })

    Task.secondary(()=>{
        setTimeout(showApp, 5000)
    })

    Task.secondary(()=>{
        LoadingProgress.status('Loading plugins')

        Plugins.load(showApp)
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
    prepareApp() // Готовим приложение

    // Если язык уже установлен, то запускаем приложение
    if(window.localStorage.getItem('language') || !window.lampa_settings.lang_use){
        // Но сперва ожидаем не вызвали ли пользователь меню разработчика, затем подгружаем язык
        developerApp(loadLang)
    }
    else{
        // Иначе предлагаем выбрать язык
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
