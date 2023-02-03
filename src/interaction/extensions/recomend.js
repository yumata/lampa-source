import Extension from "./extension"

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

        this.img.src = this.data.image
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