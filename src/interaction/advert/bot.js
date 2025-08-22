import Template from '../template'
import Api from '../../core/api'
import Modal from '../modal'
import Controller from '../../core/controller'
import Tmdb from '../../utils/tmdb'
import Lang from '../../utils/lang'


class BotClass{
    constructor(params){
        this.params = params

        this.build()
        this.image()
    }

    build(){
        this.card    = Template.js('ad_bot')
        this.img     = this.card.querySelector('.ad-bot__img') || {}

        this.card.querySelector('.ad-bot__title').innerText = this.params.title
        this.card.querySelector('.ad-bot__text').innerText  = this.params.text
        this.card.querySelector('.ad-bot__more').innerText  = Lang.translate('full_detail')
        this.card.querySelector('.ad-bot__info').innerText  = Lang.translate('ad_disable')

        this.card.addEventListener('hover:enter',()=>{
            let tpl = Template.get('cub_premium')

                tpl.find('.cub-premium__title').text(Lang.translate('title_notice'))
                tpl.find('.cub-premium__descr').eq(0).empty().text(Lang.translate('ad_notice_'+this.params.type))

            Modal.open({
                title: '',
                size: 'medium',
                mask: true,
                html: tpl,
                onBack: ()=>{
                    Modal.close()
    
                    Controller.toggle('content')
                }
            })
        })

        this.visible()
    }
    
    image(){
        this.img.onload = ()=>{
            this.card.classList.add('img--loaded')
        }
    
        this.img.onerror = ()=>{
            Tmdb.broken()

            console.log('Img','noload', this.img.src)

            this.img.src = './img/img_broken.svg'
        }
    }

    visible(){
        if(this.params.poster)    this.img.src = Api.img(this.params.poster)
        else if(this.params.img)  this.img.src = this.params.img
        else                      this.img.src = './img/img_broken.svg'
    }

    destroy(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        this.img.src = ''

        this.card.remove()

        this.card = null

        this.img = null
    }

    render(js){
        return js ? this.card : $(this.card)
    }
}

export default BotClass