import Item from "./item"
import Controller from '../controller'
import Select from '../select'
import Lang from '../../utils/lang'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'
import Screen from '../screensaver'
import Manifest from '../../utils/manifest'
import Account from '../../utils/account'

class Screensaver extends Item{
    constructor(data, params){
        super(data, params)

        this.template = 'extensions_screensaver'

        this.link = Utils.rewriteIfHTTPS(Utils.protocol() + Manifest.cub_domain + '/extensions/' + this.data.id)
    }

    update(){
        this.html.querySelector('.extensions__item-name').innerText    = this.data.name || Lang.translate('extensions_no_name')
        this.html.querySelector('.extensions__item-time').innerText    = Utils.parseTime(Date.now()).time

        if(this.active()) this.html.classList.add('active')
        else this.html.classList.remove('active')
    }

    active(){
        return Storage.field('screensaver_type') == 'cub' && Storage.get('cub_screensaver','') == this.link
    }

    visible(){
        super.visible()

        if(this.data.premium) this.premium()

        this.img = this.html.querySelector('.extensions__item-image')

        this.img.onload = ()=>{
            this.img.classList.add('loaded')
        }

        this.img.src = Utils.fixMirrorLink(Utils.rewriteIfHTTPS(this.data.image))

        this.html.addEventListener('hover:enter',this.menu.bind(this))
    }

    menu(){
        let menu = []
        let controller = Controller.enabled().name

        menu.push({
            title: Lang.translate('extensions_' + (this.active() ? 'disable': 'enable')),
            toggle: true
        })

        menu.push({
            title: Lang.translate('title_watch'),
            watch: true
        })

        Select.show({
            title: Lang.translate('title_action'),
            items: menu,
            onBack: (a)=>{
                Controller.toggle(controller)
            },
            onSelect: (a)=>{
                Controller.toggle(controller)

                if(a.toggle){
                    if(this.active()) Storage.set('cub_screensaver','')
                    else{
                        if(this.data.premium && !Account.hasPremium()) return Lampa.Account.showCubPremium()

                        Storage.set('cub_screensaver',this.link)
                        Storage.set('screensaver_type','cub')
                    }

                    this.update()
                }
                else{
                    Screen.show('cub', {
                        url: this.link
                    })
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

export default Screensaver