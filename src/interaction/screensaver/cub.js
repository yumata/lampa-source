import Template from '../template'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'
import DB from '../../utils/db'

class Cub{
    constructor(params){
        this.params  = params
        this.default = 'http://cub.watch/img/background/default.mp4'
    }

    create(){
        this.html = Template.get('screensaver')

        let source = this.params && this.params.url ? this.params.url : Storage.get('cub_screensaver','')

        if(!source) source = this.default

        this.url = Utils.addUrlComponent(source,'token=' + encodeURIComponent(Storage.get('account','{}').token))

        this.preload = $('<div class="screensaver__preload"></div>')

        this.html.prepend(this.preload)

        this.html.find('.screensaver__slides').remove()

        this.time = Utils.time(this.html)
        this.time.tik()

        this.cache(this.url)
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
                console.log('Player','play promise error:', e.message)

                if(er) er()
            })
        }
        else startPlay()
    }

    video(src){
        let video = $('<video class="screensaver__video visible" muted="" loop="" preload="" type="video/mp4"></video>')

        this.html.prepend(video)

        video[0].src = src

        this.load(video[0], ()=>{
            video[0].src = this.url

            this.load(video[0])
        })
    }

    cache(url){
        let basename  = 'lampa'
        let tablename = 'screensavers'
        let connected

        let request = new DB(basename,3,(db)=>{
            console.log('Screesaver','db upgraded')

            db.createObjectStore(tablename, { keyPath: "name" })
        })

        let getblob = (result)=>{
            return new Promise((resolve, reject) => {
                console.log('Screesaver','db find:', result ? 'true' : 'false')

                if(result) resolve(result.value)
                else{
                    console.log('Screesaver','start download video')

                    let xhr = new XMLHttpRequest()
                    xhr.open('GET', url, true)
                    xhr.responseType = 'blob'

                    xhr.onload = function(e) {
                        if (this.status == 200) {
                            connected.add(tablename, url, this.response).then(()=>{
                                console.log('Screesaver','push blob to db')
    
                                resolve(this.response)
                            }).catch(reject)
                        }
                        else reject()
                    }
                    xhr.onerror = reject

                    xhr.send()
                }
            })
        }

        request.then((db)=>{
            connected = db
            
            connected.get(tablename,url)
            .then(getblob)
            .then(blob=>{
                console.log('Screesaver','set video blob')

                let src = window.URL.createObjectURL(new Blob( [ blob ], {type: "video/mp4"} ))

                setTimeout(()=>{
                    this.video(src)
                },300)
                
            })
            .catch(e=>{
                console.log('Screesaver','error:', e.message, e.stack)

                this.video(url)
            })
        })

        request.catch(e=>{
            console.log('Screesaver','db error:', e)

            this.video(url)
        })
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()

        this.video = ()=>{}
    }
}

export default Cub