import Extension from './extension'
import Utils from '../../utils/utils'
import Manifest from '../../core/manifest'

/**
 * Карточка магазина: цветная плашка с иконкой, автор, название, установки и цена
 */
class Store extends Extension{
    constructor(data, params){
        super(data, params)

        this.template = 'extensions_store'
    }

    visible(){
        super.visible()

        this.background()
        this.installs()
        this.price()
        this.icon()
    }

    background(){
        let rgb = this.rgb(this.data.color)

        if(rgb){
            let color = rgb.join(',')
            let stops = 'rgba(' + color + ',0.6) 0%, rgba(' + color + ',0.25) 45%, rgba(' + color + ',0.06) 100%'
            let box   = this.html.querySelector('.extensions__item-imagebox')

            // Радиальный от центра к краям; старые ТВ без стандартного синтаксиса — через -webkit-
            box.style.backgroundImage = 'radial-gradient(ellipse farthest-corner at center, ' + stops + ')'

            if(!box.style.backgroundImage) box.style.backgroundImage = '-webkit-radial-gradient(center, ellipse farthest-corner, ' + stops + ')'
        }
    }

    rgb(hex){
        if(!/^#[0-9a-f]{6}$/i.test(hex || '')) return false

        return [1, 3, 5].map(i=>parseInt(hex.slice(i, i + 2), 16))
    }

    icon(){
        let box    = this.html.querySelector('.extensions__item-imagebox')
        let letter = this.html.querySelector('.extensions__item-letter')

        this.img = this.html.querySelector('.extensions__item-icon')

        let fallback = ()=>{
            letter.innerText = (this.data.name || '?').trim().slice(0, 1).toUpperCase()
            letter.classList.remove('hide')

            box.classList.add('extensions__item-imagebox--loaded')

            this.img.classList.add('hide')
        }

        if(!this.data.icon) return fallback()

        this.img.onload = ()=>{
            this.img.classList.add('loaded')

            box.classList.add('extensions__item-imagebox--loaded')
        }

        this.img.onerror = fallback

        this.img.src = Utils.protocol() + Manifest.cub_domain + '/img/extensions/icons/' + encodeURIComponent(this.data.icon)
    }

    destroy(){
        super.destroy()

        if(this.img){
            this.img.onload = false
            this.img.onerror = false
        }
    }
}

export default Store
