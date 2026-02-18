import Recorder from '../components/recorder.js'
import Upload from '../components/upload.js'
import Api from '../utils/api.js'
import Defined from '../defined.js'
import Utils from '../utils/utils.js'
import View from '../utils/view.js'

let button_record = null
let play_data     = {}
let player_shots  = null

function init(){
    Lampa.Player.listener.follow('ready', startPlayer)

    Lampa.Player.listener.follow('destroy', stopPlayer)

    button_record = Lampa.Template.get('shots_player_record_button')

    button_record.on('hover:enter', beforeRecording)

    button_record.addClass('hide')

    Lampa.PlayerPanel.render().find('.player-panel__settings').after(button_record)

    Lampa.Controller.listener.follow('toggle', (e)=>{
        if(player_shots) player_shots.toggleClass('focus', e.name == 'player_rewind' || Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice())
    })
}

function playerPanel(status){
    Lampa.Player.render().toggleClass('shots-player--recording',!status)
}

function startPlayer(data){
    play_data = {}

    if(data.card) play_data.card = data.card
    else if(Lampa.Activity.active().movie){
        play_data.card = Lampa.Activity.active().movie
    }

    let possibly = true
    let type     = play_data.card?.original_name ? 'tv' : 'movie'

    if(data.iptv || data.youtube) possibly = false
    else if(!Lampa.Account.Permit.token) possibly = false
    else if(type == 'tv' && (!data.season || !data.episode)) possibly = false

    if(possibly){
        play_data.season     = data.season || 0
        play_data.episode    = data.episode || 0
        play_data.voice_name = (data.voice_name || '').trim()

        setTimeout(()=>{
            play_data.balanser = Utils.getBalanser(play_data.card || {})
        },1000)

        if(play_data.card){
            let year = parseInt((play_data.card.release_date || play_data.card.first_air_date || '----').slice(0,4))

            if(type == 'movie'){
                let player_title = Lampa.Player.playdata().title || ''

                play_data.voice_name = (play_data.voice_name || player_title || '').trim()

                if(play_data.voice_name == play_data.card.title || play_data.torrent_hash) play_data.voice_name = ''
            }

            if(!(Utils.isTSQuality(play_data.voice_name) || Utils.isTSQuality(Lampa.Player.playdata().title)) && year >= 1985) button_record.removeClass('hide')
        }
    }

    if(play_data.card && (play_data.card.source == 'tmdb' || play_data.card.source == 'cub')){
        if(Lampa.Storage.field('shots_in_player')) playerShotsSegments()
    }
}

function stopPlayer(){
    button_record.addClass('hide')

    if(player_shots){
        player_shots.remove()
        player_shots = null
    }

    playerPanel(true)

    if(play_data.need_tocontent){
        setTimeout(()=>{
            Lampa.Controller.toggle('content')
        }, 100)
    }
}

function playerShotsSegments(){
    let type  = play_data.card.original_name ? 'tv' : 'movie'
    let video = Lampa.PlayerVideo.video()

    if(type == 'tv' && (!play_data.season || !play_data.episode)) return

    video.addEventListener('loadeddata', ()=>{
        View.load(play_data.card, (shots)=>{
            if(!Lampa.Player.opened()) return

            if(type == 'tv' && play_data.season && play_data.episode){
                shots = shots.filter((e)=>e.season == play_data.season && e.episode == play_data.episode)
            }

            if(shots.length){
                player_shots = $('<div class="shots-player-segments"></div>')

                player_shots.toggleClass('focus', Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice())

                shots = shots.filter(s=>{
                    // сортируем по start_point один раз и используем временные поля на массиве
                    if(!shots._sorted){
                        shots.sort((a,b)=> (Number(a.start_point)||0) - (Number(b.start_point)||0));
                        shots._sorted = true;
                        shots._last_end = -Infinity;
                    }

                    let start = Number(s.start_point || 0)
                    let end   = Number(s.end_point || start)

                    // если перекрывается с предыдущим включённым — исключаем
                    if(start < shots._last_end) return false

                    // обновляем край текущего включённого сегмента
                    shots._last_end = Math.max(shots._last_end, end)

                    return true
                })

                shots.forEach((elem)=>{
                    let segment = $('<div class="shots-player-segments__time"></div>')
                    let picture = $('<div class="shots-player-segments__picture"><img src="'+elem.img+'"></div>')

                    let img = picture.find('img')[0]

                    img.on('load', ()=>{
                        picture.addClass('shots-player-segments__picture--loaded')
                    })

                    segment.css({
                        left: (elem.start_point / video.duration * 100) + '%',
                        width: ((elem.end_point - elem.start_point) / video.duration * 100) + '%'
                    })

                    picture.css({
                        left: (elem.start_point / video.duration * 100) + '%'
                    })

                    player_shots.append(segment)
                    player_shots.append(picture)

                    img.src = elem.screen

                    picture.on('click', ()=>{
                        console.log('click shot', elem, elem.start_point)
                        Lampa.PlayerVideo.to(elem.start_point)
                    })
                })

                Lampa.PlayerPanel.render().find('.player-panel__timeline').before(player_shots)
            }
        })
    })
}

function playPlayer(){
    Lampa.PlayerVideo.play()
    Lampa.PlayerPanel.visible(false)
    Lampa.PlayerPanel.hide()

    playerPanel(false)
}

function pausePlayer(){
    Lampa.PlayerVideo.pause()
    Lampa.PlayerPanel.visible(false)
    Lampa.PlayerPanel.hide()

    playerPanel(true)
}

function closeModal(){
    Lampa.Modal.close()

    Lampa.Controller.toggle('player')

    Lampa.PlayerVideo.pause()

    playerPanel(true)
}

function beforeRecording(){
    if(Lampa.Modal.opened()){
        Lampa.Modal.close()

        play_data.need_tocontent = true
    }

    pausePlayer()

    let left = Date.now() - Lampa.Storage.get('shots_last_record', '0')

    if(left < Defined.quota_next_record){
        return Lampa.Modal.open({
            html: Lampa.Template.get('shots_modal_quota_limit', {
                time: Lampa.Utils.secondsToTimeHuman((Defined.quota_next_record - left) / 1000)
            }),
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

    Utils.modal(Lampa.Template.get('shots_modal_before_recording'), [
        {
            name: Lampa.Lang.translate('shots_start_recording'),
            onSelect: ()=>{
                Lampa.Modal.close()

                startRecording()
            }
        },
        {
            name: Lampa.Lang.translate('shots_choice_start_point'),
            cancel: true,
            onSelect: ()=>{
                Lampa.Modal.close()

                Lampa.Controller.toggle('player_rewind')

                Lampa.PlayerPanel.visible(true)

                playerPanel(true)
            }
        }
    ], closeModal)
}

function startRecording(){
    let recorder = new Recorder(Lampa.PlayerVideo.video())

    recorder.onStop  = stopRecording
    recorder.onError = errorRecording
    recorder.onRun   = playPlayer

    recorder.start()
}

function errorRecording(e){
    Utils.modal(Lampa.Template.get('shots_modal_error_recording'), [
        {
            name: Lampa.Lang.translate('shots_button_good'),
            onSelect: closeModal
        }
    ], closeModal)
}

function stopRecording(recording){
    pausePlayer()

    if(recording.duration > 10){
        if(recording.start_point < 60 || recording.end_point > (Lampa.PlayerVideo.video().duration - 60 * 5)){
            recording.near_border = true

            Utils.modal(Lampa.Template.get('shots_modal_before_upload_recording'), [
                {
                    name: Lampa.Lang.translate('shots_button_choice_fragment'),
                    onSelect: closeModal
                },
                {
                    name: Lampa.Lang.translate('shots_button_continue_upload'),
                    onSelect: ()=>{
                        Lampa.Modal.close()

                        startUploadRecording(recording)
                    }
                }
            ], closeModal)
        }
        else startUploadRecording(recording)
    }
    else shortRecording()
}

function startUploadRecording(recording){
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

function shortRecording(){
    Utils.modal(Lampa.Template.get('shots_modal_short_recording'), [
        {
            name: Lampa.Lang.translate('shots_button_good'),
            onSelect: closeModal
        }
    ], closeModal)
}

export default {
    init
}