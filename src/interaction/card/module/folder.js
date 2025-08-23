import Lang from '../../../core/lang'
import Utils from '../../../utils/utils'
import Template from '../../template'
import TMDB from '../../../core/api/sources/tmdb'

class Module{
    onCreate(){
        this.html = Template.js('bookmarks_folder')

        this.html.find('.bookmarks-folder__title').text(Lang.translate('menu_' + this.data.media))
        this.html.find('.bookmarks-folder__num').text(this.data.results.length)
        
        this.html.on('visible', this.emit.bind(this, 'visible'))
    }

    onImage(src, i){
        let img = Template.elem('img', {class: 'card__img i-' + i})

        this.html.find('.bookmarks-folder__body').append(img)

        Utils.imgLoad(img, src, ()=>{
            this.html.addClass('card--loaded')
        }, ()=>{
            img.src = './img/img_broken.svg'
        })
    }

    onVisible(){
        let filtred = this.data.results.filter(a=>a.poster_path).slice(0,3)

        filtred.forEach((a,i)=>{
            this.emit('image', TMDB.img(a.poster_path), i)
        })

        if(filtred.length == 0) this.emit('image', './img/img_load.svg')
    }
}

export default Module
