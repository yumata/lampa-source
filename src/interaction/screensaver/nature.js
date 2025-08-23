import Template from '../template'
import Utils from '../../utils/utils'

class Nature{
    constructor(){
        this.slide = 'one'
        this.direct = ['lt','rt','br','lb','ct']
    }

    create(){
        this.html = Template.get('screensaver')

        this.timer = setInterval(this.next.bind(this), 30000)

        this.time = Utils.time(this.html)
        this.time.tik()

        this.next()
    }

    next(){
        let image = 'https://picsum.photos/1600/900?v='+Math.random()

        let to_img = $('.screensaver__slides-'+(this.slide == 'one' ? 'two' : 'one'), this.html)[0]

        to_img.onload = ()=>{
            $(to_img).removeClass(this.direct.join(' ') + ' animate').addClass(this.direct[Math.floor(Math.random() * this.direct.length)])

            setTimeout(()=>{
                $('.screensaver__slides-'+this.slide, this.html).removeClass('visible')

                this.slide = this.slide == 'one' ? 'two' : 'one'

                $(to_img).addClass('visible').addClass('animate')
            },100)
        }

        to_img.onerror = this.next.bind(this)

        to_img.src = image
    }

    render(){
        return this.html
    }

    destroy(){
        clearInterval(this.timer)

        clearInterval(this.time.timer)

        this.html.remove()
    }
}

export default Nature