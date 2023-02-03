import Template from '../template'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'

class Cub{
    constructor(params){
        this.params  = params
        this.default = 'http://cub.watch/img/background/default.mp4'
    }

    create(){
        this.html = Template.get('screensaver')

        let source = this.params && this.params.url ? this.params.url : Storage.get('cub_screensaver','')

        if(!source) source = this.default

        let url = Utils.addUrlComponent(source,'token=' + encodeURIComponent(Storage.get('account','{}').token))

        this.video = $('<video class="screensaver__video" autoplay="autoplay" muted="" loop=""></video>')

        this.html.find('.screensaver__slides').remove()

        this.html.prepend(this.video)

        this.video.attr('src', url)

        this.time = Utils.time(this.html)
        this.time.tik()
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()
    }
}

export default Cub