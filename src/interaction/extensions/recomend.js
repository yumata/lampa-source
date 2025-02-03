import Extension from "./extension"
import Utils from '../../utils/math'

class Recomend extends Extension{
    constructor(data, params){
        super(data, params)

        this.template = 'extensions_recomend'
    }

    visible(){
        super.visible()

        this.img = this.html.querySelector('.extensions__item-image')

        this.img.onload = ()=>{
            this.img.classList.add('loaded')
        }

        this.img.src = Utils.fixMirrorLink(Utils.rewriteIfHTTPS(this.data.image))
    }

    destroy(){
        super.destroy()

        if(this.img){
            this.img.onload = false
            this.img.onerror = false
        }
    }
}

export default Recomend