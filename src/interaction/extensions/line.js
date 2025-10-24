import Template from '../template'
import Scroll from '../scroll'
import Controller from '../../core/controller'
import Layer from '../../core/layer'
import Arrays from '../../utils/arrays'
import Platform from '../../core/platform'

import ClassExtension from './extension'
import ClassRecomend from './recomend'
import ClassTheme from './theme'
import ClassScreensaver from './screensaver'

class Line{
    constructor(data, params){
        this.params = params
        this.data   = data
        this.items  = []
        this.active = 0
        this.view   = 4
        this.last
    }

    create(){
        this.scroll = new Scroll({horizontal:true, step: window.innerWidth / 4})

        this.html = Template.js('extensions_block',{})

        this.html.querySelector('.extensions__block-title').innerText = this.params.title

        this.html.addEventListener('visible',this.visible.bind(this))

        this.html.querySelector('.extensions__block-body').appendChild(this.scroll.render(true))

        this.scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        this.scroll.onScroll = this.attach.bind(this)
    }

    display(num){
        this.data.filter(p=>{
            if(p.platform){
                let platforms = p.platform.split(',')

                return platforms.find(n=>Platform.is(n))
            }
            else return true
        }).filter(e=>e.premium ? window.lampa_settings.account_use : true).filter(e=>!this.items.find(f=>f.data==e)).forEach(this.append.bind(this))
    }

    visible(){
        this.display(this.view)

        Layer.visible(this.scroll.render(true))
    }

    append(elem){
        let Class = ClassExtension

        if(this.params.hpu == 'recomend')    Class = ClassRecomend
        if(this.params.hpu == 'theme')       Class = ClassTheme
        if(this.params.hpu == 'screensaver') Class = ClassScreensaver

        let item = new Class(elem, this.params)

        item.create()

        item.render().addEventListener('hover:focus',()=>{
            this.last = item.render()

            let prev_active = this.active

            this.active = this.items.indexOf(item)

            if(this.active > 0 || prev_active > this.active) this.scroll.update(this.last,true)
        })


        this.scroll.body(true).appendChild(item.render())

        this.items.push(item)

        if(Controller.own(this)) Controller.collectionAppend(item.render())
    }

    attach(){
        let size = Platform.screen('tv') ? (Math.round(this.active / this.view) + 1) * this.view + 1 : this.data.length

        this.display(size)

        Layer.visible(this.scroll.render(true))
    }

    render(){
        return this.html
    }

    toggle(){
        Controller.add('extensions_line',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.scroll.render(true))
                Controller.collectionFocus(this.items.length ? this.last : false,this.scroll.render(true))

                if(this.onToggle) this.onToggle(this)
            },
            update: ()=>{

            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                Navigator.move('left')
            },
            down:this.onDown,
            up: this.onUp,
            back: this.onBack
        })

        Controller.toggle('extensions_line')
    }

    destroy(){
        Arrays.destroy(this.items)

        this.scroll.destroy()

        this.html.remove()

        this.items = null
    }
}

export default Line