import Template from './template'
import Api from './api'
import Tmdb from '../utils/tmdb'
import ImageCache from '../utils/cache/images'
import Lang from '../utils/lang'
import Activity from './activity'

/**
 * Карточка
 * @param {object} data
 * @param {{isparser:boolean, card_small:boolean, card_category:boolean, card_collection:boolean, card_wide:true}} params 
 */
function Folder(data, params = {}){
    this.data    = data
    this.params  = params

    this.filtred = data.filter(a=>{
        return params.media == 'tv' ? a.name : !a.name
    })

    this.card = this.filtred.length ? this.filtred[0] : {}

    this.create = function(){
        this.folder = Template.js('bookmarks_folder')

        this.folder.querySelector('.bookmarks-folder__title').innerText = Lang.translate(params.media == 'tv' ? 'menu_tv' : 'menu_movies')
        this.folder.querySelector('.bookmarks-folder__num').innerText   = this.filtred.length
        
        this.folder.addEventListener('hover:focus',()=>{
            if(this.onFocus) this.onFocus(this.folder, this.card)
        })

        this.folder.addEventListener('hover:touch',()=>{
            if(this.onTouch) this.onTouch(this.folder, this.card)
        })
        
        this.folder.addEventListener('hover:hover',()=>{
            if(this.onHover) this.onHover(this.folder, this.card)
        })

        this.folder.addEventListener('hover:enter',()=>{
            Activity.push({
                url: '',
                title: Lang.translate('title_' + params.category) + ' - ' + Lang.translate(params.media == 'tv' ? 'menu_tv' : 'menu_movies'),
                component: 'favorite',
                type: params.category,
                filter: params.media,
                page: 1
            })
        })
        
        this.folder.addEventListener('visible',this.visible.bind(this))
    }

    /**
     * Загрузить картинку
     */
    this.image = function(src, i){
        let img = document.createElement('img')
            img.addClass('card__img')
            img.addClass('i-' + i)

        img.onload = ()=>{
            this.folder.classList.add('card--loaded')
        }
    
        img.onerror = ()=>{
            img.src = './img/img_broken.svg'
        }

        this.folder.querySelector('.bookmarks-folder__body').append(img)

        img.src = src
    }

    /**
     * Загружать картинку если видна карточка
     */
    this.visible = function(){
        let filtred = this.filtred.filter(a=>a.poster_path).slice(0,3)

        filtred.forEach((a,i)=>{
            this.image(Api.img(a.poster_path), i)
        })

        if(filtred.length == 0) this.image('./img/img_load.svg')

        if(this.onVisible) this.onVisible(this.folder, data)
    }


    /**
     * Уничтожить
     */
    this.destroy = function(){
        this.folder.remove()
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = function(js){
        return js ? this.folder : $(this.folder)
    }
}

export default Folder