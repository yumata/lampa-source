import Template from './template'
import Api from './api'
import Lang from '../utils/lang'
import Emit from '../utils/emit'
import Arrays from '../utils/arrays'

class Folder extends Emit {
    constructor(data){
        super()

        Arrays.extend(data, {params: {}})

        this.data   = data
        this.params = data.params
    }

    create(){
        this.html = Template.js('bookmarks_folder')

        this.html.querySelector('.bookmarks-folder__title').innerText = Lang.translate('menu_' + this.data.media)
        this.html.querySelector('.bookmarks-folder__num').innerText   = this.data.results.length

        this.html.on('hover:focus', this.emit.bind(this, 'focus', this.html, this.data))

        this.html.on('hover:touch', this.emit.bind(this, 'touch', this.html, this.data))
        
        this.html.on('hover:hover', this.emit.bind(this, 'hover', this.html, this.data))

        this.html.on('hover:enter', this.emit.bind(this, 'enter', this.html, this.data))
        
        this.html.on('hover:long', this.emit.bind(this, 'long', this.html, this.data))
        
        // this.html.addEventListener('hover:enter',()=>{
        //     Activity.push({
        //         url: '',
        //         title: Lang.translate('title_' + params.category) + ' - ' + Lang.translate('menu_' + params.media),
        //         component: 'favorite',
        //         type: params.category,
        //         filter: params.media,
        //         page: 1
        //     })
        // })
        
        this.html.on('visible',this.visible.bind(this))
    }

    image(src, i){
        let img = document.createElement('img')
            img.addClass('card__img')
            img.addClass('i-' + i)

        img.onload = ()=>{
            this.html.addClass('card--loaded')
        }
    
        img.onerror = ()=>{
            img.src = './img/img_broken.svg'
        }

        this.html.find('.bookmarks-folder__body').append(img)

        img.src = src
    }

    visible(){
        let filtred = this.data.results.filter(a=>a.poster_path).slice(0,3)

        filtred.forEach((a,i)=>{
            this.image(Api.img(a.poster_path), i)
        })

        if(filtred.length == 0) this.image('./img/img_load.svg')

        this.emit('visible', this.html, this.data)
    }

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        this.html.remove()

        this.emit('destroy')
    }
}

export default Folder