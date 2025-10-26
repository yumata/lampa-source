import Storage from './storage/storage'
import Manifest from './manifest'
import Utils from '../utils/utils'
import Orsay from './orsay'
import Modal from '../interaction/modal'
import Template from '../interaction/template'
import Controller from './controller'
import Lang from './lang'

function init(){
    let agent = navigator.userAgent.toLowerCase()

    if(typeof webOS !== 'undefined' && webOS.platform.tv === true){
        Storage.set('platform','webos')

        webOS.deviceInfo((e)=>{
            webOS.sdk_version = parseFloat(e.sdkVersion)
        })
    }
    else if(typeof webapis !== 'undefined' && typeof tizen !== 'undefined'){
        Storage.set('platform','tizen')

        tizen.tvinputdevice.registerKey("MediaPlayPause");
        tizen.tvinputdevice.registerKey("MediaPlay");
        tizen.tvinputdevice.registerKey("MediaStop");
        tizen.tvinputdevice.registerKey("MediaPause");
        tizen.tvinputdevice.registerKey("MediaRewind");
        tizen.tvinputdevice.registerKey("MediaFastForward");
        tizen.tvinputdevice.registerKey("ChannelUp");
        tizen.tvinputdevice.registerKey("ChannelDown");
    }
    else if(agent.indexOf("lampa_client") > -1){
        Storage.set('platform', 'android')
    }
    else if(agent.indexOf("whaletv") > -1 || agent.indexOf("philips") > -1 || agent.indexOf("nettv") > -1){
        Storage.set('platform', 'philips')
    }
    else if(agent.indexOf("ipad") > -1 && window.innerWidth == 1920 && window.innerHeight == 1080){
        Storage.set('platform', 'apple_tv')
    }
    else if(agent.indexOf("iphone") > -1 || (agent.indexOf("mac os") > -1 && Utils.isTouchDevice()) || (agent.indexOf("macintosh") > -1 && Utils.isTouchDevice())){
        Storage.set('platform', 'apple')
    }
    else if(typeof nw !== 'undefined') {
        Storage.set('platform', 'nw')
    }
    else if(agent.indexOf("electron") > -1) {
        Storage.set('platform', 'electron')
    }
    else if(agent.indexOf("netcast") > -1) {
        Storage.set('platform', 'netcast')
    }
    else if(agent.indexOf("version/5.1.7 safari/534.57.2") > -1){
        Storage.set('platform', 'orsay') // Версия для тестов на Safari
    }
    else if((agent.indexOf("windows nt") > -1 || agent.indexOf("macintosh") > -1) && !Utils.isTouchDevice()) {
        Storage.set('platform', 'browser')
    }
    else if(agent.indexOf("maple") > -1) {
        Storage.set('platform', 'orsay')
        Orsay.init()
    }
    else{
        Storage.set('platform','')
    }
    
    Storage.set('native',Storage.get('platform') ? true : false)

    $('body').addClass('platform--'+(get() || 'noname'))

    $('body').toggleClass('touch-device', screen('mobile'))
    $('body').toggleClass('mouse--controll', mouse())
}

/**
 * Какая платформа
 * @returns String
 */
function get(){
    return Storage.get('platform','')
}

/**
 * Если это платформа
 * @param {String} need - какая нужна? tizen, webos, android, orsay
 * @returns Boolean
 */
function is(need){
    return get() == need
}

/**
 * Платформы у которых есть возможность изменить плеер
 * @returns Boolean
 */
function any(){
    return is('tizen') || is('webos') || is('android') || is('netcast') || is('orsay') || is('apple') || is('apple_tv') || macOS() || desktop()
}

/**
 * Если это телевизор
 * @returns Boolean
 */
function tv(){
    return is('tizen') || is('webos') || is('orsay') || is('netcast') || is('apple_tv') || tvbox() || Boolean(navigator.userAgent.toLowerCase().match(/tizen|webos/i))
}

/**
 * Если это телевизор на базе приставки (Android TV, Mi Box, Nvidia Shield и т.п.)
 * @returns Boolean
 */
function tvbox(){
    return Boolean(navigator.userAgent.toLowerCase().match(/googletv|google tv|mibox|mitv|smarttv|smart tv|google tv|android tv/i)) || Boolean(navigator.userAgent.toLowerCase().match(/android/i) && !Utils.isTouchDevice())
}

/**
 * Если это NW.js или Electron
 * @returns Boolean
 */
function desktop() {
    return is('nw') || is('electron')
}

/**
 * Если навигация мышь или тачпад
 * @returns Boolean
 */
function mouse(){
    return (screen('tv') && !tv()) || Storage.field('navigation_type') !== 'controll'
}

/**
 * Если это macOS без тача
 * @returns Boolean
 */
function macOS(){
    let agent = navigator.userAgent.toLowerCase()

    return agent.indexOf("mac os x") > -1 && !Utils.isTouchDevice()
}

/**
 * Версия приложения
 * @param {String} name - какая нужна? app, android, orsay
 * @returns String
 */
function version(name){
    if (name == 'app') {
        return Manifest.app_version
    } else if (name == 'android') {
        return AndroidJS.appVersion()
    } else if (name == 'orsay') {
        return curWidget.version
    }else {
        return ''
    }
}

/**
 * Экран телевизор или мобильный
 * @param {String} need - какой нужен? tv, mobile, light
 * @returns Boolean
 */
function screen(need){
    if(need == 'light'){
        return Storage.field('light_version') && screen('tv')
    }

    let is_tv = true

    if(!(tv() || desktop())){
        if(Storage.get('is_true_mobile', 'false')) is_tv = false
        else if(Boolean(Storage.get('platform', '') == 'apple')) is_tv = false
        else if(Boolean(navigator.userAgent.toLowerCase().match(/iphone|ipad/i))) is_tv = false
        else if(Utils.isTouchDevice()){
            if(!Boolean(navigator.userAgent.toLowerCase().match(/(large screen)|googletv|mibox|mitv|smarttv|google tv|android tv/i))){
                let ratio  = window.devicePixelRatio || 1
                let width  = Math.ceil(window.screen_width * ratio)
                let height = Math.ceil(window.screen_height * ratio)


                is_tv = width > height && width >= 1280
            }
        }
    }
    
    if(need == 'tv') return is_tv
    if(need == 'mobile') return !is_tv

    return false
}

function install(what){
    let about = Template.get('about')

    if($('.modal').length) Modal.close()

    if(what == 'apk'){
        $('> div:eq(0)',about).html(Lang.translate('install_app_apk_text'))
        $('.about__contacts',about).empty()
        $('.about__rules',about).remove()

        $('.about__contacts',about).append(`
            <div>
                <small>Telegram</small><br>
                @lampa_group
            </div>
        `)

        Modal.open({
            title: '',
            html: about,
            size: 'medium',
            onBack: ()=>{
                Modal.close()

                Controller.toggle('content')
            }
        })
    }
}

export default {
    init,
    get,
    any,
    is,
    tv,
    mouse,
    desktop,
    version,
    screen,
    install,
    macOS
}
