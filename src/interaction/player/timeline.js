import Video from './video'
import Storage from '../../core/storage/storage'
import Select from '../select'
import Lang from '../../core/lang'
import Utils from '../../utils/utils'
import Player from '../player'

let work = null
let timer_ask = null
let timer_save = null

function init(){
    Video.listener.follow('reset_continue', ()=>{
        if(work && work.timeline && !work.timeline.continued_bloc) work.timeline.continued = false
    })

    Video.listener.follow('timeupdate', (e)=>{
        if(!work || !work.timeline || work.timeline.waiting_for_user || work.timeline.stop_recording || !e.duration) return

        if(Storage.field('player_timecode') !== 'again' && !work.timeline.continued){
            let exact = parseFloat(work.timeline.time + '')
                exact = isNaN(exact) ? 0 : parseFloat(exact.toFixed(3))

            let prend = e.duration - 15,
                posit = exact > 0 && exact < e.duration ? exact : Math.round(e.duration * work.timeline.percent / 100)

            if(posit > 10 && work.timeline.percent < 90) Video.to(posit > prend ? prend : posit)

            work.timeline.continued = true
        }
        else{
            work.timeline.percent  = Math.round(e.current / e.duration * 100)
            work.timeline.time     = e.current
            work.timeline.duration = e.duration
        }
    })

    Player.listener.follow('start', start)
}

function start(data){
    work = data

    if(work && work.timeline) work.timeline.continued = false

    startSaveLoop()
}

function needToContinue(onToggle){
    if(work && work.timeline && work.timeline.percent){
        work.timeline.waiting_for_user = false

        if(Storage.field('player_timecode') == 'ask'){
            work.timeline.waiting_for_user = true

            Select.show({
                title: Lang.translate('title_action'),
                items: [
                    {
                        title: Lang.translate('player_start_from') + ' ' + Utils.secondsToTime(work.timeline.time)+'?',
                        yes: true
                    },
                    {
                        title: Lang.translate('settings_param_no')
                    }
                ],
                onBack: ()=>{
                    work.timeline.continued = true
                    work.timeline.continued_bloc = true

                    onToggle()

                    clearTimeout(timer_ask)
                },
                onSelect: (a)=>{
                    work.timeline.waiting_for_user = false

                    if(!a.yes){
                        work.timeline.continued = true
                        work.timeline.continued_bloc = true
                    }

                    onToggle()

                    clearTimeout(timer_ask)
                }
            })

            clearTimeout(timer_ask)

            timer_ask = setTimeout(()=>{
                work.timeline.continued = true
                work.timeline.continued_bloc = true

                Select.hide()

                onToggle()
            },8000)
        }
    }
}

function setEnd(){
    if(work && work.timeline){
        work.timeline.waiting_for_user = true
        work.timeline.percent  = 100
        work.timeline.time     = work.timeline.duration || 0
    }
}

function resetContinue(){
    if(work && work.timeline){
        work.timeline.continued = false
        work.timeline.continued_bloc = false
    }
}

function saveTimeView(){
    if(work && work.timeline && work.timeline.handler && !work.timeline.stop_recording){
        work.timeline.handler(work.timeline.percent, work.timeline.time, work.timeline.duration)
    }
}

function startSaveLoop(){
    if(work && work.timeline && !work.timeline.stop_recording){
        timer_save = setInterval(saveTimeView, 1000 * 60 * 2)
    }
}

function setRecording(status){
    if(work && work.timeline){
        work.timeline.stop_recording = !status
    }
}

function destroy(){
    saveTimeView()

    if(work && work.timeline) work.timeline.stop_recording = false

    clearTimeout(timer_ask)
    clearInterval(timer_save)

    work = null
}

export default {
    init,
    needToContinue,
    setEnd,
    resetContinue,
    saveTimeView,
    startSaveLoop,
    setRecording,
    destroy
}
