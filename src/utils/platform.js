import Storage from './storage'
import Manifest from './manifest'
import Utils from './math'

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
    }
    else if(agent.indexOf("lampa_client") > -1){
        Storage.set('platform', 'android')
    }
    else if(agent.indexOf("iphone") > -1 || (agent.indexOf("mac os") > -1 && Utils.isTouchDevice())){
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
        Storage.set('platform', 'orsay')
    }
    else if(agent.indexOf("windows nt") > -1) {
        Storage.set('platform', 'browser')
    }
    else if(agent.indexOf("maple") > -1) {
        Storage.set('platform', 'orsay')
    }
    else{
        Storage.set('platform','')
    }
    
    Storage.set('native',Storage.get('platform') ? true : false)
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
    return get() == need ? true : false
}

/**
 * Если хоть одна из платформ tizen, webos, android
 * @returns Boolean
 */
function any(){
    return is('tizen') || is('webos') || is('android') || is('netcast') || is('orsay') || is('apple') || desktop() ? true : false
}

/**
 * Если это именно телек
 * @returns Boolean
 */
function tv(){
    return is('tizen') || is('webos') || is('orsay') || is('netcast') ? true : false
}

/**
 * Если это NW.js или Electron
 * @returns Boolean
 */
function desktop() {
    return is('nw') || is('electron') ? true : false
}

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

function screen(need){
    if(need == 'light'){
        return Storage.field('light_version') && screen('tv')
    }
    
    if(need == 'tv'){
        if(Boolean(navigator.userAgent.toLowerCase().match(/iphone|ipad/i))) return false
        else if(tv()) return true
        else if(Utils.isTouchDevice()){
            if(Boolean(navigator.userAgent.toLowerCase().match(/(large screen)|googletv|mibox|mitv|smarttv|google tv/i))) return true
            else{
                let ratio  = window.devicePixelRatio || 1
                let width  = window.innerWidth * ratio
                let height = window.innerHeight * ratio

                if(width > height && width >= 1280){
                    return Storage.get('is_true_mobile','false') ? false : true
                }
            }
        }
        else return true
    }

    if(need == 'mobile'){
        return (Utils.isTouchDevice() && window.innerHeight > window.innerWidth) || Storage.get('is_true_mobile','false') || Boolean(Storage.get('platform', '') == 'apple')
    }

    return false
}

export default {
    init,
    get,
    any,
    is,
    tv,
    desktop,
    version,
    screen
}
