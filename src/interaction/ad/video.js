import Reguest from '../../utils/reguest'
import Subscribe from '../../utils/subscribe'
import Template from '../template'
import Controller from '../controller'
import Manifest from '../../utils/manifest'
import Utils from '../../utils/math'
import Platform from '../../utils/platform'
import Storage from '../../utils/storage'
import Lang from '../../utils/lang'
import Arrays from '../../utils/arrays'

let loaded_data = {
    ad: [],
    time: 0,
    position: 0
}

function stat(method, name){
    $.ajax({
        dataType: 'text',
        url: Utils.protocol() + Manifest.cub_domain + '/api/ad/stat?platform=' + Platform.get() + '&type=video&method='+method+'&name=' + name
    })
}

class VideoBlock{
    constructor(number){
        this.network  = new Reguest()
        this.listener = Subscribe()
        this.paused   = false
        this.number   = number || 1

        if(loaded_data.time < Date.now() + 1000*60*60*1) this.get()
        else if(loaded_data.ad.length) setTimeout(this.start.bind(this), 100)
        else this.get()
    }

    get(){
        let domain = Manifest.cub_domain

        this.network.silent(Utils.protocol() + domain+'/api/ad/all',(data)=>{
            loaded_data.time = Date.now()
            
            let need_shuffle = !loaded_data.ad.length

            data.forEach(elem => {
                let ad = loaded_data.ad.find(a=>a.url == elem.url)

                if(!ad){
                    ad = elem

                    loaded_data.ad.push(elem)
                }

                ad.volume   = elem.volume
                ad.duration = elem.duration
            })

            if(need_shuffle) Arrays.shuffle(loaded_data.ad)

            this.start()
        },()=>{
            this.listener.send('empty')
        })
    }

    start(){
        let ad = loaded_data.ad[loaded_data.position]

        if(!ad){
            loaded_data.position = 0

            Arrays.shuffle(loaded_data.ad)
            
            ad = loaded_data.ad[0]
        }

        loaded_data.position++

        if(ad){
            this.time = Date.now()

            this.create(ad)
            this.load(ad)
        }
    }

    load(data){
        this.video.src = data.url
        this.video.load()
    }

    create(data){
        stat('launch','')

        this.block = Template.js('ad_video_block')
        this.last_controller = Controller.enabled().name

        this.block.find('.ad-video-block__text').text(Lang.translate('ad')  + ' - ' + Lang.translate('ad_disable'))
        this.block.find('.ad-video-block__info').text(data.info || '')

        this.video = this.block.find('.ad-video-block__video')

        let detention   = 0
        let duration    = data.duration
        let passed      = 0
        let skip        = this.block.find('.ad-video-block__skip')
        let progressbar = this.block.find('.ad-video-block__progress-fill')
        let pause       = this.block.find('.player-video__paused')
        let skip_sec    = data.skip ? data.skip / 1000 : 10

        skip.find('span').text(skip_sec)

        if(duration <= 1000*skip_sec) skip.classList.add('hide')

        this.video.addEventListener('loadeddata',()=>{
            this.video.play()

            detention = Math.min(1000*2,Date.now() - this.time)

            this.video.classList.add('loaded')

            this.block.find('.ad-video-block__loader').remove()
        })

        this.video.addEventListener('timeupdate',()=>{
            this.listener.send('timeupdate')
        })

        this.video.addEventListener('ended',()=>{
            this.destroy()
        })

        function enter(){
            let left = Math.max(0,Math.round(skip_sec - passed/1000))

            if(left == 0) return this.destroy()

            if(this.video.paused){
                this.video.play()

                pause.classList.add('hide')

                this.paused = false
            }
            else{
                this.video.pause()

                pause.classList.remove('hide')

                this.paused = true
            }
        }

        this.block.on('click',enter.bind(this))

        this.video.volume = (Boolean(Platform.is('nw') || Platform.is('browser') || (Platform.is('apple') && !Utils.isPWA())) ? parseFloat(Storage.get('player_volume','1')) : 1) * data.volume
        this.video.muted  = false

        document.body.append(this.block)

        this.timer = setInterval(()=>{
            if(this.paused) return

            passed += 100

            let progress = Math.min(100,passed / (duration + detention) * 100)
            let left     = Math.max(0,Math.round(skip_sec - passed/1000))

            progressbar.style.width = progress + '%'

            skip.find('span').text(Lang.translate(left == 0 ? 'ad_skip' : left))

            if(progress == 100) this.destroy()
        },100)

        Controller.add('ad_video_block',{
            toggle: ()=>{
                Controller.clear()
            },
            enter: enter.bind(this),
            back: ()=>{}
        })

        Controller.toggle('ad_video_block')

        this.listener.send('launch')

        if(data.stat){
            $.ajax({
                dataType: 'text',
                url: data.stat
            })
        }
    }

    destroy(){
        clearInterval(this.timer)

        this.video.pause()

        this.video.src = ''

        this.block.remove()

        Controller.toggle(this.last_controller)

        this.listener.send('ended')
    }
}

export default VideoBlock