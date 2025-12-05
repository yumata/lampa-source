import Recorder from '../components/recorder.js'
import Upload from '../components/upload.js'
import Defined from '../defined.js'

let button_record = null
let play_data     = {}

function init(){
    Lampa.Player.listener.follow('ready', startPlayer)

    Lampa.Player.listener.follow('destroy', stopPlayer)

    button_record = Lampa.Template.get('shots_player_record_button')

    button_record.on('hover:enter', beforeRecording)

    button_record.addClass('hide')

    Lampa.PlayerPanel.render().find('.player-panel__settings').after(button_record)
}

function startPlayer(data){
    play_data = {}

    if(!data.iptv && Lampa.Storage.field('player') == 'inner'){
        if(data.card) play_data.card = data.card
        else if(Lampa.Activity.active().movie){
            play_data.card = Lampa.Activity.active().movie
        }

        play_data.season     = data.season || 0
        play_data.episode    = data.episode || 0
        play_data.voice_name = (data.voice_name || '').split(' ')[0].trim()

        if(play_data.card) button_record.removeClass('hide')
    }
}

function stopPlayer(){
    button_record.addClass('hide')
}

function playPlayer(){
    Lampa.PlayerVideo.play()
    Lampa.PlayerPanel.visible(false)
    Lampa.PlayerPanel.hide()
}

function pausePlayer(){
    Lampa.PlayerVideo.pause()
    Lampa.PlayerPanel.visible(false)
    Lampa.PlayerPanel.hide()
}

function closeModal(){
    Lampa.Modal.close()

    Lampa.Controller.toggle('player')

    Lampa.PlayerVideo.pause()
}

function beforeRecording(){
    pausePlayer()

    // if(Date.now() - Lampa.Storage.get('shots_last_record', '0') < Defined.quota_next_record){
    //     return Lampa.Modal.open({
    //         html: Lampa.Template.get('shots_modal_quota_limit', {
    //             time: 0
    //         }),
    //         size: 'small',
    //         scroll: {
    //             nopadding: true
    //         },
    //         buttons: [
    //             {
    //                 name: Lampa.Lang.translate('shots_button_good'),
    //                 onSelect: closeModal
    //             }
    //         ],
    //         onBack: closeModal
    //     })
    // }

    Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_before_recording'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        buttons: [
            {
                name: Lampa.Lang.translate('shots_start_recording'),
                onSelect: ()=>{
                    Lampa.Modal.close()

                    startRecording()
                }
            },
            {
                name: Lampa.Lang.translate('shots_choice_start_point'),
                onSelect: ()=>{
                    Lampa.Modal.close()

                    Lampa.Controller.toggle('player_rewind')

                    Lampa.PlayerPanel.visible(true)
                }
            }
        ],
        onBack: closeModal
    })
}

function startRecording(){
    let recorder = new Recorder(Lampa.PlayerVideo.video())

    recorder.onStop  = stopRecording
    recorder.onError = errorRecording
    recorder.onRun   = playPlayer

    recorder.start()
}

function errorRecording(e){
    Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_error_recording'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        buttons: [
            {
                name: Lampa.Lang.translate('shots_button_good'),
                onSelect: closeModal
            }
        ],
        onBack: closeModal
    })
}

function stopRecording(recording){
    pausePlayer()

    if(recording.duration > 10){
        let upload = new Upload({
            recording: recording,
            play_data: play_data
        })

        upload.onCancel = ()=>{
            Lampa.Controller.toggle('player')

            Lampa.PlayerVideo.pause()
        }

        upload.onComplete = ()=>{
            Lampa.Controller.toggle('player')

            Lampa.PlayerVideo.pause()
        }

        upload.start()
    }
    else shortRecording()
}

function shortRecording(){
    Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_short_recording'),
        size: 'small',
        scroll: {
            nopadding: true
        },
        buttons: [
            {
                name: Lampa.Lang.translate('shots_button_good'),
                onSelect: closeModal
            }
        ],
        onBack: closeModal
    })
}

export default {
    init
}