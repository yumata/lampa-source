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

        this.html.find('.screensaver__slides').remove()

        this.time = Utils.time(this.html)
        this.time.tik()

        this.cache(this.url)
    }

    video(src){
        let video = $('<video class="screensaver__video" muted="" loop="" type="video/mp4"></video>')

        this.html.prepend(video)

        video[0].src = src

        video[0].load()
        video[0].play()
        .then(() => {
            console.log('Screesaver',"is ok, is playing")
        })
        .catch(error => {
            console.log('Screesaver', error)
            console.log('Screesaver', error.code)

            if(!this.error_ready){
                this.error_ready = true

                video.attr('autoplay','autoplay')
                
                video[0].src = this.url
            }
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

                    fetch(url).then(response => response.blob()).then(blob => {
                        console.log('Screesaver','complite download video')

                        connected.add(tablename, url, blob).then(()=>{
                            console.log('Screesaver','push blob to db')

                            resolve(blob)
                        }).catch(reject)
                    }).catch(reject)
                }
            })
        }

        request.then((db)=>{
            connected = db
            
            connected.get(tablename,url)
            .then(getblob)
            .then(blob=>{
                console.log('Screesaver','set video blob')

                this.video(window.URL.createObjectURL(new Blob( [ blob ], {type: "video/mp4"} )))
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