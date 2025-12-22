import Template from '../template'
import Utils from '../../utils/utils'
import Storage from '../../core/storage/storage'
import Platform from '../../core/platform'
import Cache from '../../utils/cache'
import Manifest from '../../core/manifest'

class Cub{
    constructor(params){
        this.params  = params
        this.default = Utils.protocol()+Manifest.cub_domain+'/img/background/default.mp4'
    }

    create(){
        this.html = Template.get('screensaver')

        let source = this.params && this.params.url ? this.params.url : Storage.get('cub_screensaver','')

        if(!source) source = this.default

        this.url = Utils.fixMirrorLink(Utils.addUrlComponent(source,'token=' + encodeURIComponent(Storage.get('account','{}').token)))

        this.preload = $('<div class="screensaver__preload"></div>')

        this.html.prepend(this.preload)

        this.html.find('.screensaver__slides').remove()

        this.time = Utils.time(this.html)
        this.time.tik()

        if(Platform.is('webos')) this.video(this.url)
        else this.cache(this.url)
    }

    load(video, er){
        video.load()

        let playPromise

        try{
            playPromise = video.play()
        }
        catch(e){ }

        let startPlay = ()=>{
            console.log('Screesaver','playing')

            this.preload.remove()
        }

        if (playPromise !== undefined) {
            playPromise.then(()=>startPlay())
            .catch((e)=>{
                console.log('Screesaver','play promise error:', e.message)
            })
        }
        else startPlay()
    }

    video(src){
        let video = $('<video class="screensaver__video visible" muted loop poster="./img/video_poster.png" type="video/mp4"></video>')

        this.html.prepend(video)

        video[0].src = src

        this.load(video[0])
    }

    cache(url){
        let getblob = (result)=>{
            return new Promise((resolve, reject) => {
                console.log('Screesaver','db find:', result ? 'true' : 'false')

                if(result) resolve(result)
                else{
                    console.log('Screesaver','start download video')

                    let xhr = new XMLHttpRequest()
                    xhr.open('GET', url, true)
                    xhr.responseType = 'blob'

                    xhr.onload = function(e) {
                        if (this.status == 200) {
                            Cache.addData('screensavers',url, this.response).then(()=>{
                                console.log('Screesaver','push blob to db')
    
                                resolve(this.response)
                            }).catch(resolve.bind(this.response))
                        }
                        else reject()
                    }
                    xhr.onerror = reject

                    xhr.send()
                }
            })
        }

        Cache.getData('screensavers',url).then(getblob).then(blob=>{
            console.log('Screesaver','set video blob')

            this.create_url_blob = URL.createObjectURL(new Blob( [ blob ], {type: "video/mp4"} ))

            this.video(this.create_url_blob)
        }).catch(e=>{
            console.log('Screesaver','error:', typeof e == 'string' ? e : e.message)

            this.video(url)
        })
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()

        this.video = ()=>{}

        if(this.create_url_blob) URL.revokeObjectURL(this.create_url_blob)
    }
}

export default Cub