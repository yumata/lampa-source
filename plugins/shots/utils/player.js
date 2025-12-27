import Recorder from '../components/recorder.js'
import Upload from '../components/upload.js'
import Api from '../utils/api.js'
import Defined from '../defined.js'

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
        if(player_shots) player_shots.toggleClass('focus', e.name == 'player_rewind')
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

    if(data.iptv) possibly = false
    else if(!Lampa.Account.Permit.token) possibly = false
    else if(Lampa.Storage.field('player') !== 'inner') possibly = false
    else if(Lampa.Platform.is('apple') && Lampa.Storage.field('player_normalization')) possibly = false
    else if(/\.m3u8/.test(data.url)){
        let use_program = Lampa.Storage.field('player_hls_method') == 'hlsjs' || Lampa.Platform.chromeVersion() > 120
        
        if(!Hls.isSupported()) use_program = false

        if(!use_program) possibly = false
    }

    if(possibly){
        play_data.season     = data.season || 0
        play_data.episode    = data.episode || 0
        play_data.voice_name = (data.voice_name || '').replace(/\s[^a-zA-Zа-яА-Я0-9].*$/, '').trim()

        if(play_data.card) button_record.removeClass('hide')
    }

    if(play_data.card && (play_data.card.source == 'tmdb' || play_data.card.source == 'cub')){
        playerShotsSegments()
        //playerShotsFooter()
    }
}

function stopPlayer(){
    button_record.addClass('hide')

    if(player_shots){
        player_shots.remove()
        player_shots = null
    }

    playerPanel(true)
}

function playerShotsSegments(){
    let video = Lampa.PlayerVideo.video()

    video.addEventListener('loadeddata', ()=>{
        Api.shotsCard(play_data.card, 1, (data)=>{
            if(!Lampa.Player.opened()) return

            let type = play_data.card.original_name ? 'tv' : 'movie'

            if(type == 'tv' && play_data.season && play_data.episode){
                data.results = data.results.filter((e)=>e.season == play_data.season && e.episode == play_data.episode)
            }

            if(data.results.length){
                player_shots = $('<div class="shots-player-segments"></div>')

                data.results.forEach((elem)=>{
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
                })

                Lampa.PlayerPanel.render().find('.player-panel__timeline').append(player_shots)
            }
        })
    })
}

function playerShotsFooter(){
    Api.shotsCard(play_data.card, 1, (data)=>{
        let type = play_data.card.original_name ? 'tv' : 'movie'

        if(type == 'tv' && play_data.season && play_data.episode){
            data.results = data.results.filter((e)=>e.season == play_data.season && e.episode == play_data.episode)
        }

        if(data.results.length){
            data.title = 'Shots'

            data.results.forEach((elem)=>{
                elem.img = elem.screen

                elem.params = {
                    createInstance: ()=> Lampa.Maker.make('Card', elem, (module)=>module.only('Card', 'Callback','Style')),
                    style: {
                        name: 'collection'
                    },
                    emit: {
                        onCreate: function(){
                            this.html.addClass('shots-player-card')
                        },
                        onEnter: ()=>{
                            Lampa.PlayerVideo.to(elem.start_point)
                        }
                    }
                }
            })

            let line = Lampa.Maker.make('Line', data, (module)=>module.only('Items', 'Create'))

            line.create()

            Lampa.PlayerFooter.appendRow(line.render(true))
        }
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

                    playerPanel(true)
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