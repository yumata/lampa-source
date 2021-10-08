import Template from './template'

function create(params = {}){

    let html    = Template.get('scroll')
    let body    = html.find('.scroll__body')
    let content = html.find('.scroll__content')
    
    html.toggleClass('scroll--horizontal',params.horizontal ? true : false)
    html.toggleClass('scroll--mask',params.mask ? true : false)
    html.toggleClass('scroll--over',params.over ? true : false)
    html.toggleClass('scroll--nopadding',params.nopadding ? true : false)

    this.update = function(elem, tocenter){
        let dir = params.horizontal ? 'left' : 'top',
            siz = params.horizontal ? 'width' : 'height'

        let ofs_elm = elem.offset()[dir],
            ofs_box = body.offset()[dir],
            center  = ofs_box + (tocenter ? (content[siz]() / 2) - elem[siz]() / 2 : 0),
            scrl    = Math.min(0,center - ofs_elm)

            body.css('transform','translate3d('+(params.horizontal ? scrl : 0)+'px, '+(params.horizontal ? 0 : scrl)+'px, 0px)')
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
    }

    this.destroy = function(){
        html.remove()

        body    = null
        content = null
        html    = null
    }
}

export default create