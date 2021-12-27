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
        let parent = $(e.target).parents('.scroll')

        if(Storage.get('navigation_type') == 'mouse' && Date.now() - scroll_time > 100 && html.is(parent[0])){
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

        let direct = params.horizontal ? 'left' : 'top'

        let scrl         = body.data('scroll'),
            scrl_offset  = html.offset()[direct],
            scrl_padding = parseInt(content.css('padding-' + direct))

        if(params.scroll_by_item){
            let pos = body.data('scroll-position')
                pos = pos || 0

            let items = $('>*',body)

            pos += size > 0 ? 1 : -1

            pos = Math.max(0,Math.min(items.length - 1, pos))

            body.data('scroll-position',pos)

            let item = items.eq(pos),
                ofst = item.offset()[direct]

            size = ofst - scrl_offset - scrl_padding
        }

        let max  = params.horizontal ? 10000 : body.height()
            max -= params.horizontal ? html.width() : html.height()
            max += scrl_padding * 2

        scrl -= size
        scrl = Math.min(0,Math.max(-max,scrl))
        

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