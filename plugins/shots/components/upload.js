import Preview from './preview.js'
import Checkbox from './checkbox.js'
import Api from '../utils/api.js'
import Progress from './progress.js'
import Handler from '../utils/handler.js'
import Created from '../utils/created.js'

function Upload(data){
    this.data = data
    this.html = Lampa.Template.get('shots_modal_upload')

    this.start = function(){
        this.preview  = new Preview(this.data)

        this.checkbox = new Checkbox({
            text: Lampa.Lang.translate('Сделать публичной'),
            state: true
        })

        this.progress = new Progress({
            text: Lampa.Lang.translate('shots_upload_progress_start')
        })

        this.checkbox.create()
        this.preview.create()
        this.progress.create()
        this.progress.render().addClass('hide')

        this.button_upload   = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_start')})
        this.button_cancel   = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_cancel')})
        this.button_again    = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_again')})
        this.button_complete = Lampa.Template.get('shots_button', {text: Lampa.Lang.translate('shots_modal_button_upload_complete')})
        this.text_complete   = Lampa.Template.get('shots_upload_complete_text')

        this.button_again.addClass('hide').on('hover:enter', this.startUpload.bind(this))
        this.button_upload.on('hover:enter', this.startUpload.bind(this))

        this.button_complete.addClass('hide').on('hover:enter', ()=>{
            this.destroy()

            this.onComplete(this.shot_ready)
        })

        this.text_complete.addClass('hide')

        this.button_cancel.addClass('shots-selector--transparent')
        this.button_cancel.on('hover:enter', this.cancelUpload.bind(this))

        this.html.find('.shots-modal-upload__preview').append(this.preview.render())
        this.html.find('.shots-modal-upload__body').append(this.button_upload).append(this.progress.render()).append(this.button_again).append(this.button_cancel).append(this.text_complete).append(this.button_complete)

        Lampa.Modal.open({
            html: this.html,
            size: 'small',
            scroll: {
                nopadding: true
            },
            onBack: ()=>{}
        })

        this.previewVideo()
    }

    this.previewVideo = function(){
        let video = this.html.find('video')[0]

        if(Lampa.Platform.is('apple')) video.setAttribute('playsinline', 'true')

        video.src   = URL.createObjectURL(this.data.recording.blob)
        video.loop  = true
        video.muted = false
        video.play()
    }

    this.setFocus = function(target){
        Lampa.Controller.clear()
        Lampa.Controller.collectionSet(this.html)
        Lampa.Controller.collectionFocus(target, this.html)
    }

    this.startUpload = function(){
        this.button_again.addClass('hide')
        this.button_upload.addClass('hide')
        this.progress.render().removeClass('hide')

        this.setFocus(this.progress.render())

        this.progress.setText(Lampa.Lang.translate('shots_upload_progress_start'))
        this.progress.setState('waiting')

        if(this.upload_ready) return this.notifyUpload()
        if(this.shot_ready)   return this.runUpload(this.shot_ready)

        let play = this.data.play_data
        let card = play.card

        let recorder_device = [Lampa.Utils.capitalizeFirstLetter(Lampa.Activity.active().component)]

        let history_data = Lampa.Storage.get('online_watched_last', '{}')
        let history_key  = Lampa.Utils.hash(card.number_of_seasons ? card.original_name : card.original_title)
        let history_item = history_data[history_key]

        if(history_item && history_item.balanser_name) recorder_device.push(history_item.balanser_name)

        recorder_device.push(navigator.userAgent)

        recorder_device = recorder_device.join(' / ')

        Api.uploadRequest({
            card_id: card.id,
            card_type: card.original_name ? 'tv' : 'movie',
            card_title: card.title || card.name || card.original_title || card.original_name || 'Unknown',
            card_year: (card.release_date || card.first_air_date || '----').slice(0,4),
            card_poster: card.poster_path || '',

            start_point: this.data.recording.start_point,
            end_point: this.data.recording.end_point,

            season: play.season || 0,
            episode: play.episode || 0,
            voice_name: play.voice_name || '',

            recorder: recorder_device,
        }, this.runUpload.bind(this), this.errorUpload.bind(this))
    }

    this.runUpload = function(shot){
        this.shot_ready = shot 

        this.progress.setText(Lampa.Lang.translate('shots_upload_progress_uploading'))
        this.progress.setState('uploading')

        let xhr = new XMLHttpRequest();

        this.uploading = xhr

        xhr.open('PUT', shot.upload_url)
        xhr.setRequestHeader('Content-Type', 'video/webm')

        // Показываем прогресс
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                let percent = (e.loaded / e.total * 100).toFixed(1)
                
                this.progress.setProgress(percent)
            }
        }

        // Успешная загрузка
        xhr.onload = () => {
            this.uploading = null

            if (xhr.status >= 200 && xhr.status < 300) {
                console.log('Upload', 'Успешно загружено', shot.video_id)

                this.upload_ready = true

                this.notifyUpload()
            }
            else {
                console.error('Upload', 'Ошибка загрузки', xhr.status)

                this.errorUpload()
            }
        }

        xhr.onerror = ()=>{
            this.uploading = null

            this.errorUpload()
        }

        xhr.send(this.data.recording.blob)

        Lampa.Storage.set('shots_last_record', Date.now())
    }

    this.errorUpload = function(e){
        this.progress.render().addClass('hide')
        this.button_again.removeClass('hide')

        this.setFocus(this.button_again)
    }

    this.notifyUpload = function(){
        this.progress.setText(Lampa.Lang.translate('shots_upload_progress_notify'))
        this.progress.setState('waiting')

        Api.uploadNotify(this.shot_ready, this.endUpload.bind(this), this.errorUpload.bind(this))
    }

    this.endUpload = function(){
        this.progress.render().addClass('hide')
        this.button_cancel.addClass('hide')
        this.button_complete.removeClass('hide')
        this.text_complete.removeClass('hide')

        Api.shotsVideo(this.shot_ready.id, (result)=>{
            Created.add(result.video)

            Handler.add(result.video)
        })

        this.setFocus(this.button_complete)
    }

    this.cancelUpload = function(){
        if(this.uploading) this.uploading.abort()
        
        this.destroy()

        this.onCancel()
    }

    this.destroy = function(){
        Lampa.Modal.close()

        this.preview.destroy()
        this.checkbox.destroy()
        this.html.remove()

        this.runUpload = ()=>{}
        this.endUpload = ()=>{}
        this.cancelUpload = ()=>{}
        this.notifyUpload = ()=>{}
    }
}

export default Upload