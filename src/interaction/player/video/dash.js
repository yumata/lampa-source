import Platform from '../../../core/platform'
import Storage from '../../../core/storage/storage'

let _dash = null

function create(src, videoEl, callbacks){
    try{
        if(Platform.is('orsay') && Storage.field('player') == 'orsay'){
            callbacks.load(src)
        }
        else{
            _dash = dashjs.MediaPlayer().create()

            _dash.getSettings().streaming.abr.autoSwitchBitrate = false

            _dash.initialize(videoEl, src, true)
        }
    }
    catch(e){
        console.log('Player','Dash error:', e.stack)

        callbacks.load(src)
    }
}

function setupAudioTracks(){
    if(!_dash) return null

    let tracks = _dash.getTracksFor('audio')

    if(!tracks || !tracks.length) return null

    tracks.forEach((track, i)=>{
        if(i == 0) track.selected = true

        track.language = (track.lang + '').replace(/\d+/g,'')

        Object.defineProperty(track, "enabled", {
            set: (v)=>{ if(v) _dash.setCurrentTrack(track) },
            get: ()=>{}
        })
    })

    return tracks
}

function audioTracks(){
    if(!_dash) return null

    let tracks = _dash.getTracksFor('audio')

    return (tracks && tracks.length) ? tracks : null
}

function buildLevels(savedLevel){
    if(!_dash) return null

    let bitrates = _dash.getBitrateInfoListFor("video")
    let current_level = 'AUTO'

    bitrates.forEach((level, i)=>{
        level.title = level.width ? level.width + 'x' + level.height : 'AUTO'

        if(i == 0) current_level = level.title

        Object.defineProperty(level, "enabled", {
            set: (v)=>{
                if(v){
                    _dash.getSettings().streaming.abr.autoSwitchBitrate = false

                    _dash.setQualityFor("video", level.qualityIndex)
                }
            },
            get: ()=>{}
        })
    })

    if(typeof savedLevel !== 'undefined' && bitrates[savedLevel]){
        bitrates.map(e=>e.selected = false)

        _dash.getSettings().streaming.abr.autoSwitchBitrate = false

        bitrates[savedLevel].enabled = true
        bitrates[savedLevel].selected = true

        current_level = bitrates[savedLevel].title
    }

    return {levels: bitrates, current: current_level}
}

function currentLevel(){
    return _dash ? _dash.getQualityFor('video') : undefined
}

function isActive(){
    return !!_dash
}

function destroy(){
    if(_dash){
        try{ _dash.destroy() }
        catch(e){}

        _dash = null

        return true
    }

    return false
}

export default {
    create,
    setupAudioTracks,
    audioTracks,
    buildLevels,
    currentLevel,
    isActive,
    destroy
}
