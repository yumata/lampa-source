import Item from "./item"
import Controller from '../controller'
import Select from '../select'
import Lang from '../../utils/lang'
import Storage from '../../utils/storage'
import Themes from '../../utils/theme'
import Manifest from '../../utils/manifest'
import Utils from '../../utils/math'

class Theme extends Item{
    constructor(data, params){
        super(data, params)

        this.template = 'extensions_theme'

        this.link = Utils.protocol() + Manifest.cub_domain + '/extensions/' + this.data.id
    }

    update(){
        this.html.querySelector('.extensions__item-name').innerText = this.data.name || Lang.translate('extensions_no_name')

        if(this.active()) this.html.classList.add('active')
        else this.html.classList.remove('active')
    }

    active(){
        return Storage.get('cub_theme','') == this.link
    }

    visible(){
        super.visible()

        if(this.data.premium) this.premium()

        this.img = this.html.querySelector('.extensions__item-image')

        this.img.onload = ()=>{
            this.img.classList.add('loaded')
        }

        this.img.src = this.data.image

        this.html.addEventListener('hover:enter',this.menu.bind(this))
    }

    menu(){
        let menu = []
        let controller = Controller.enabled().name

        menu.push({
            title: Lang.translate('extensions_' + (this.active() ? 'disable': 'enable')),
            toggle: true
        })

        Select.show({
            title: Lang.translate('title_action'),
            items: menu,
            onBack: ()=>{
                Controller.toggle(controller)
            },
            onSelect: (a)=>{
                Controller.toggle(controller)

                if(a.toggle){
                    Themes.toggle(this.active() ? '' : this.link)

                    this.update()
                }
            }
        })
    }

    destroy(){
        super.destroy()

        if(this.img){
            this.img.onload = false
            this.img.onerror = false
        }
    }
}

export default Theme