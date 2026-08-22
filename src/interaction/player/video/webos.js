import WebOSParser from './webos/parser'
import Platform from '../../../core/platform'
import Storage from '../../../core/storage/storage'
import Arrays from '../../../utils/arrays'
import Player from '../../player'
import PanelOption from '../panel/option'
import Video from '../video'

let _webos = null

function convertToArray(arr){
    if(!Arrays.isArray(arr)){
        let new_arr = []

        for(let index = 0; index < arr.length; index++){
            new_arr.push(arr[index])
        }

        arr = new_arr
    }

    return arr
}

function loadSubs(params, subsview){
    if(!_webos.parsed_subtitles) return

    let subs = _webos.parsed_subtitles

    Video.video().webos_subs = subs

    let inx = params.sub + 1

    if(typeof params.sub !== 'undefined' && subs[inx]){
        subs.forEach(e=>{e.mode = 'disabled'; e.selected = false})

        subs[inx].mode     = 'showing'
        subs[inx].selected = true

        console.log('WebOS','enable subs', inx)

        subsview(true)
    }
    else if(Storage.field('subtitles_start')){
        let full = subs.find(s=>(s.label || '').indexOf('олные') >= 0)

        subs[0].selected = false

        if(full){
            full.mode     = 'showing'
            full.selected = true
        }
        else{
            subs[1].mode     = 'showing'
            subs[1].selected = true
        }

        subsview(true)
    }
}

function loadTracks(params){
    if(!_webos.parsed_tracks) return

    let tracks = _webos.parsed_tracks

    Video.video().webos_tracks = tracks

    if(typeof params.track !== 'undefined' && tracks[params.track]){
        tracks.forEach(e=>e.selected = false)

        console.log('WebOS','enable tracks', params.track)

        tracks[params.track].enabled  = true
        tracks[params.track].selected = true
    }
}

/**
 * Инициализация WebOS
 */
function setup(){
    if(!Platform.is('webos') || _webos || Player.playdata().voiceovers) return

    _webos = new WebOSParser(Video.video())

    _webos.callback = ()=>{
        let currentVideo = Video.video()
        let src = currentVideo.src
        let sub = currentVideo.customSubs

        console.log('WebOS','video loaded')

        $(currentVideo).remove()

        let norm = Video.normalization()

        if(norm) norm.destroy()

        Video.url(src, true)

        let newVideo = Video.video()

        newVideo.customSubs = sub

        _webos.repet(newVideo)

        Video.listener.send('reset_continue',{})
    }

    _webos.listener.follow('webos_subs',(e)=>{
        Video.listener.send('webos_subs', e) // Для совместимости с плагинами, которые используют старый способ получения субтитров

        _webos.parsed_subtitles = convertToArray(e.subs)

        PanelOption.setSubtitles(e.subs)
    })

    _webos.listener.follow('webos_tracks',(e)=>{
        Video.listener.send('webos_tracks', e) // Для совместимости с плагинами, которые используют старый способ получения аудиодорожек

        _webos.parsed_tracks = convertToArray(e.tracks)

        PanelOption.setTracks(e.tracks)
    })

    _webos.start()
}

function handleLoaded(params, subsview){
    if(!_webos || !_webos.sourceInfo) return false

    if(_webos.parsed_tracks)    loadTracks(params)
    if(_webos.parsed_subtitles) loadSubs(params, subsview)

    return true
}

function audioTracks(){
    if(_webos && _webos.sourceInfo) return Video.video().webos_tracks || []

    return null
}

function rewinded(){
    if(_webos) _webos.rewinded()
}

function speed(value){
    if(_webos) _webos.speed(value)
}

function isActive(){
    return !!_webos
}

function destroy(){
    if(_webos) _webos.destroy()

    _webos = null
}

export default {
    setup,
    handleLoaded,
    audioTracks,
    rewinded,
    speed,
    isActive,
    destroy
}
