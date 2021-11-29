import Template from './template'
import Storage from '../utils/storage'

function create(params = {}){

    let html    = Template.get('scroll')
    let body    = html.find('.scroll__body')
    let content = html.find('.scroll__content')
    
    html.toggleClass('scroll--horizontal',params.horizontal ? true : false)
    html.toggleClass('scroll--mask',params.mask ? true : false)
    html.toggleClass('scroll--over',params.over ? true : false)
    html.toggleClass('scroll--nopadding',params.nopadding ? true : false)

    body.data('scroll',0)

    let scroll_time = 0,
        scroll_step = params.step || 150

    html.on('mousewheel',(e)=>{
        if(Date.now() - scroll_time > 200 && html.find('.scroll').length == 0){
            scroll_time = Date.now()

            if(e.originalEvent.wheelDelta / 120 > 0) {
                this.wheel(-scroll_step)
            }
            else{
                this.wheel(scroll_step)
            }
        }
    })

    this.wheel = function(size){
        html.toggleClass('scroll--wheel',true)

        let scrl = body.data('scroll')
            scrl -= size
            scrl = Math.min(0,scrl)

        this.reset()

        if(Storage.field('scroll_type') == 'css'){
            body.css('transform','translate3d('+(params.horizontal ? scrl : 0)+'px, '+(params.horizontal ? 0 : scrl)+'px, 0px)')
        }
        else{
            body.css('margin-left',(params.horizontal ? scrl : 0)+'px')
            body.css('margin-top',(params.horizontal ? 0 : scrl)+'px')
        }

        body.data('scroll', scrl)
    }

    this.update = function(elem, tocenter){
        if(elem.data('ismouse')) return

        html.toggleClass('scroll--wheel',false)

        let dir = params.horizontal ? 'left' : 'top',
            siz = params.horizontal ? 'width' : 'height'

        let ofs_elm = elem.offset()[dir],
            ofs_box = body.offset()[dir],
            center  = ofs_box + (tocenter ? (content[siz]() / 2) - elem[siz]() / 2 : 0),
            scrl    = Math.min(0,center - ofs_elm)

            this.reset()

            if(Storage.field('scroll_type') == 'css'){
                body.css('transform','translate3d('+(params.horizontal ? scrl : 0)+'px, '+(params.horizontal ? 0 : scrl)+'px, 0px)')
            }
            else{
                body.css('margin-left',(params.horizontal ? scrl : 0)+'px')
                body.css('margin-top',(params.horizontal ? 0 : scrl)+'px')
            }

            body.data('scroll', scrl)
    }

    this.append = function(object){
        body.append(object)
    }

    this.minus = function(minus){
        html.addClass('layer--wheight')
        
        if(minus) html.data('mheight',minus)
    }

    this.body = function(){
        return body
    }

    this.render = function(object){
        if(object) body.append(object)

        return html
    }

    this.clear = function(){
        body.empty()
    }

    this.reset = function(){
        body.css('transform','translate3d(0px, 0px, 0px)')
        body.css('margin','0px')
    }

    this.destroy = function(){
        html.remove()

        body    = null
        content = null
        html    = null
    }
}

export default create