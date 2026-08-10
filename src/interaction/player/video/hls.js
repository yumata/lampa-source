import Platform from '../../../core/platform'
import Storage from '../../../core/storage/storage'
import Lang from '../../../core/lang'
import Utils from '../../../utils/utils'
import Info from '../info'
import Cue from '../subtitles/cue'

let _hls = null
let _hls_parser = null
let _hls_subs_cues = {}
let _hls_subs_active_track = -1

function levelName(level){
    let level_width  = level.width || 0
    let level_height = level.height || 0

    let levels = [240, 360, 480, 720, 1080, 1440, 2160]

    let name = levels.find(size=>{
        let quality_width  = Math.round(size * 1.777)
        let quality_height = size

        let w = level_width > quality_width - 50 && level_width < quality_width + 50
        let h = level_height > quality_height - 50 && level_height < quality_height + 50

        return w || h
    })

    return name ? name + 'p' : level.qu ? level.qu : level.width ? level.height + 'p' : 'AUTO'
}

function levelDefault(where){
    let start_level = where.levels.find((level)=>{
        let level_width  = level.width || 0
        let level_height = level.height || 0

        let quality_width  = Math.round(Storage.field('video_quality_default') * 1.777)
        let quality_height = Storage.field('video_quality_default')

        let w = level_width > quality_width - 50 && level_width < quality_width + 50
        let h = level_height > quality_height - 50 && level_height < quality_height + 50

        return w || h
    })

    return start_level ? where.levels.indexOf(start_level) : where.currentLevel
}

function bitrate(seconds){
    if(_hls && _hls.streamController && _hls.streamController.fragPlaying && _hls.streamController.fragPlaying.baseurl && _hls.streamController.fragPlaying.stats){
        let ch = Lang.translate('title_channel') + ' ' + parseFloat(_hls.streamController.fragLastKbps / 1000).toFixed(2) + ' ' + Lang.translate('speed_mb')
        let bt = ' &nbsp;•&nbsp; ' + Lang.translate('torrent_item_bitrate') + ' ~' + parseFloat(_hls.streamController.fragPlaying.stats.total / 1000000 / 10 * 8).toFixed(2) + ' ' + Lang.translate('speed_mb')
        let bf = ' &nbsp;•&nbsp; ' + Lang.translate('title_buffer') + ' ' + Utils.secondsToTimeHuman(seconds)

        Info.set('bitrate', ch + bt + bf)
    }
}

function update(seconds){
    if(!_hls || _hls_subs_active_track < 0) return

    let cues = _hls_subs_cues[_hls_subs_active_track]

    if(!cues) return

    let active = null

    for(let i = 0; i < cues.length; i++){
        let c = cues[i]

        if(c.startTime <= seconds && seconds < c.endTime){
            active = c
            break
        }
    }

    Cue.draw(active ? (active.text || '') : '')
}

function shouldUseProgram(videoEl, playdata){
    let use_program = Storage.field('player_hls_method') == 'hlsjs' || Platform.chromeVersion() > 120
    let hls_type    = playdata.hls_type
    let hls_native  = videoEl.canPlayType('application/vnd.apple.mpegurl')

    if(Platform.is('tizen') && Storage.field('player') == 'tizen') use_program = false
    else if(Platform.is('orsay') && Storage.field('player') == 'orsay') use_program = false
    else if(!use_program && !hls_native) use_program = true

    if(hls_type == 'hlsjs')                     use_program = true
    else if(hls_type == 'native' && hls_native) use_program = false

    if(!Hls.isSupported()) use_program = false

    return { use_program, hls_native }
}

function createProgram(src, videoEl, playdata, callbacks){
    let timeout = playdata.hls_manifest_timeout || 10000

    console.log('Player','hls start program')

    _hls = new Hls({
        manifestLoadTimeout: timeout,
        manifestLoadMaxRetryTimeout: playdata.hls_retry_timeout || 30000,
        renderTextTracksNatively: false,
        xhrSetup: function(xhr){
            xhr.timeout = timeout
            xhr.ontimeout = function(){
                console.log('Player','hls manifestLoadTimeout')
            }
        }
    })

    _hls.loadSource(src)
    _hls.attachMedia(videoEl)

    _hls.on(Hls.Events.ERROR, function(_, data){
        console.log('Player','hls error', data.reason, data.details, data.fatal)

        if(data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR){
            if(data.reason === "no EXTM3U delimiter"){
                callbacks.load(src)
            }
            else{
                callbacks.error('details ['+data.details+'] fatal ['+data.fatal+']', data.fatal)
            }
        }
        else{
            callbacks.error('details ['+data.details+'] fatal ['+data.fatal+']', data.fatal)
        }
    })

    _hls.on(Hls.Events.MANIFEST_LOADED, function(){
        callbacks.play()
    })

    _hls.on(Hls.Events.MANIFEST_PARSED, function(){
        _hls.currentLevel = levelDefault(_hls)
    })

    _hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function(_event, data){
        if(!data.subtitleTracks || !data.subtitleTracks.length) return

        _hls_subs_cues         = {}
        _hls_subs_active_track = -1

        let subs = data.subtitleTracks.map(function(track, i){
            let sub = {
                index:    i,
                label:    track.name || track.lang || ('Subtitle ' + (i + 1)),
                selected: false
            }

            Object.defineProperty(sub, 'mode', {
                set: function(v){
                    if(v == 'showing'){
                        _hls_subs_active_track = i
                        _hls.subtitleTrack     = i

                        Cue.render().removeClass('hide')
                    }
                    else{
                        if(_hls_subs_active_track == i){
                            _hls_subs_active_track = -1
                            _hls.subtitleTrack     = -1

                            Cue.draw('')
                        }
                    }
                },
                get: function(){ return _hls_subs_active_track == i ? 'showing' : 'disabled' }
            })

            return sub
        })

        callbacks.subtitles(subs)
    })

    _hls.on(Hls.Events.CUES_PARSED, function(_event, data){
        let idx = _hls.subtitleTrack
        
        if(idx < 0) return

        if(!_hls_subs_cues[idx]) _hls_subs_cues[idx] = []

        data.cues.forEach(function(cue){ _hls_subs_cues[idx].push(cue) })
    })
}

function createParser(src, playdata, callbacks){
    let timeout = playdata.hls_manifest_timeout || 10000
    let send_load_ready = false

    console.log('Player','hls start parse')

    _hls_parser = new Hls({
        manifestLoadTimeout: timeout,
        manifestLoadMaxRetryTimeout: playdata.hls_retry_timeout || 30000,
        xhrSetup: function(xhr){
            xhr.timeout = timeout
            xhr.ontimeout = function(){
                console.log('Player','hls manifestLoadTimeout')
            }
        }
    })

    _hls_parser.loadSource(src)

    _hls_parser.on(Hls.Events.ERROR, function(_, data){
        console.log('Player','hls parse error', data.reason, data.details, data.fatal)

        if(!send_load_ready) callbacks.load(src)
    })

    _hls_parser.on(Hls.Events.MANIFEST_LOADED, function(){
        if(_hls_parser.audioTracks.length)    callbacks.translate('tracks', _hls_parser.audioTracks.map(a=>({name: a.name})))
        if(_hls_parser.subtitleTracks.length) callbacks.translate('subs', _hls_parser.subtitleTracks.map(a=>({label: a.name})))

        console.log('Player','parse hls audio', _hls_parser.audioTracks.length, _hls_parser.audioTracks.map(a=>a.name))
        console.log('Player','parse hls subs', _hls_parser.subtitleTracks.length, _hls_parser.subtitleTracks.map(a=>a.name))

        if(!_hls_parser.audioTracks.length){
            let start_level  = levelDefault(_hls_parser)
            let select_level = start_level >= 0 ? _hls_parser.levels[start_level] : _hls_parser.levels[_hls_parser.levels.length - 1]

            let parsed_levels = _hls_parser.levels.map(level=>({
                title: levelName(level),
                change_quality: true,
                url: level.url[0],
                selected: level === select_level
            }))

            console.log('Player','set hls levels', parsed_levels)

            callbacks.levels(parsed_levels, levelName(select_level))

            console.log('Player','hls select level url:', select_level.url[0])

            callbacks.load(select_level.url[0])
        }
        else callbacks.load(src)

        send_load_ready = true
    })
}

function setupAudioTracks(){
    let tracks = audioTracks()

    if(!tracks) return null

    tracks.forEach(track=>{
        if(_hls.audioTrack == track.id) track.selected = true

        Object.defineProperty(track, "enabled", {
            set: (v)=>{ if(v) _hls.audioTrack = track.id },
            get: ()=>{}
        })
    })

    return tracks
}

function audioTracks(){
    return (_hls && _hls.audioTracks && _hls.audioTracks.length) ? _hls.audioTracks : null
}

function buildLevels(savedLevel){
    if(!_hls || !_hls.levels) return null

    let current_level = 'AUTO'

    _hls.levels.forEach((level,i)=>{
        level.title = levelName(level)

        if(_hls.currentLevel == i){
            current_level  = level.title
            level.selected = true
        }

        Object.defineProperty(level, "enabled", {
            set: (v)=>{
                if(v){
                    _hls.currentLevel = i
                    _hls.levels.map(e=>e.selected = false)
                    level.selected = true
                }
            },
            get: ()=>{}
        })
    })

    if(typeof savedLevel !== 'undefined' && _hls.levels[savedLevel]){
        _hls.levels.map(e=>e.selected = false)
        _hls.levels[savedLevel].enabled = true
        _hls.levels[savedLevel].selected = true
        current_level = _hls.levels[savedLevel].title
    }
    else{
        if(_hls.currentLevel >= 0) current_level = _hls.levels[_hls.currentLevel].title
    }

    return {levels: _hls.levels, current: current_level}
}

function currentLevel(){
    return _hls ? _hls.currentLevel : undefined
}

function isActive(){
    return !!_hls
}

function destroyParser(){
    if(_hls_parser){
        try{ _hls_parser.destroy() }
        catch(e){}
        _hls_parser = null
    }
}

function destroy(){
    destroyParser()

    _hls_subs_cues = {}
    _hls_subs_active_track = -1

    if(_hls){
        try{ _hls.destroy() }
        catch(e){}
        _hls = null
        return true
    }

    return false
}

export default {
    bitrate,
    update,
    shouldUseProgram,
    createProgram,
    createParser,
    setupAudioTracks,
    audioTracks,
    buildLevels,
    currentLevel,
    isActive,
    destroy,
    destroyParser
}
