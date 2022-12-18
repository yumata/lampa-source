import Template from './template'
import Storage from '../utils/storage'
import Layer from '../utils/layer'
import Utils from '../utils/math'

function create(params = {}){
    let _self = this

    let html    = Template.js('scroll')
    let body    = html.querySelector('.scroll__body')
    let content = html.querySelector('.scroll__content')

    let scroll_position = 0
    let scroll_time = 0,
        scroll_step = params.step || 150

    let call_update_time = Date.now()
    let call_transition_time = Date.now()
    
    html.classList.toggle('scroll--horizontal',params.horizontal ? true : false)
    html.classList.toggle('scroll--mask',params.mask ? true : false)
    html.classList.toggle('scroll--over',params.over ? true : false)
    html.classList.toggle('scroll--nopadding',params.nopadding ? true : false)
    body.classList.toggle('notransition',params.notransition ? true : false)

    
    html.addEventListener('mousewheel',(e)=>{
        let parent = $(e.target).parents('.scroll')
        let inner  = onTheRightSide(e, true)

        if(!params.horizontal && $(html).is(parent[0])) inner = true

        if(Storage.field('navigation_type') == 'mouse' && Date.now() - scroll_time > 200 && inner){
            scroll_time = Date.now()

            if(e.wheelDelta / 120 > 0) {
                if(this.onWheel) this.onWheel(-scroll_step)
                else this.wheel(-scroll_step)
            }
            else{
                if(this.onWheel) this.onWheel(scroll_step)
                else this.wheel(scroll_step)
            }
        }
    })
    
    html.addEventListener('scroll',scrollEnded)
    body.addEventListener('transitionend', ()=>{
        if(Date.now() - call_transition_time > 400) return

        if(Date.now() - call_update_time > 200) scrollEnded()
    })

    function onTheRightSide(e, inleft = false){
        let offset   = content.getBoundingClientRect().left
        let width    = window.innerWidth - offset
        let position = e.clientX - offset

        return params.horizontal ? position > width / 2 : inleft ? position < width / 2 : false
    }

    function maxOffset(offset){
        let w = params.horizontal ? html.offsetWidth : html.offsetHeight
        let p = parseInt(window.getComputedStyle(content, null).getPropertyValue('padding-' + (params.horizontal ? 'left' : 'top')))
        let s = body[params.horizontal ? 'scrollWidth' : 'scrollHeight']
        
        offset = Math.min(0,offset)
        offset = Math.max(-((Math.max(s + p * 2,w) - w)),offset)

        return offset
    }

    function scrollEnded(){
        call_update_time = Date.now()

        if(_self.onScroll) _self.onScroll(Utils.isTouchDevice() ? html[params.horizontal ? 'scrollLeft' : 'scrollTop'] : scroll_position)
        else Layer.visible(html)

        if(_self.onEnd && _self.isEnd()) _self.onEnd()
    }

    function scrollTo(scrl){
        if(Utils.isTouchDevice()){
            let object = {
                behavior: 'smooth'
            }

            object[params.horizontal ? 'left' : 'top'] = -scrl

            html.scrollTo(object)
        }
        else if(Storage.field('scroll_type') == 'css'){
            body.style.transform = 'translate3d('+(params.horizontal ? scrl : 0)+'px, '+(params.horizontal ? 0 : scrl)+'px, 0px)'
        }
        else{
            body.css('margin-left',(params.horizontal ? scrl : 0)+'px')
            body.css('margin-top',(params.horizontal ? 0 : scrl)+'px')
        }

        scroll_position = scrl
    }

    function startScroll(scrl){
        scrollTo(scrl)

        if(!Storage.field('animation') || (Date.now() - call_update_time < 300)) scrollEnded()

        call_update_time = Date.now()
        call_transition_time = Date.now()
    }

    this.wheel = function(size){
        let direct = params.horizontal ? 'left' : 'top'

        let scrl         = scroll_position,
            scrl_offset  = html.getBoundingClientRect()[direct],
            scrl_padding = parseInt(window.getComputedStyle(content, null).getPropertyValue('padding-' + direct))

        if(params.scroll_by_item){
            let pos = body.scroll_position
                pos = pos || 0

            let items = Array.from(body.children)

            pos += size > 0 ? 1 : -1

            pos = Math.max(0,Math.min(items.length - 1, pos))

            body.scroll_position = pos

            let item = items[pos],
                ofst = item.getBoundingClientRect()[direct]

            size = ofst - scrl_offset - scrl_padding
        }

        let max  = params.horizontal ? body.offsetWidth : body.offsetHeight
            max -= params.horizontal ? html.offsetWidth : html.offsetHeight
            max += scrl_padding * 2

        scrl -= size
        scrl = Math.min(0,Math.max(-max,scrl))
        scrl = maxOffset(scrl)

        startScroll(scrl)
    }

    this.update = function(elem, tocenter){
        let dir = params.horizontal ? 'left' : 'top',
            siz = params.horizontal ? 'offsetWidth' : 'offsetHeight'

        let target = elem instanceof jQuery ? elem[0] : elem

        let ofs_elm = target.getBoundingClientRect()[dir],
            ofs_box = body.getBoundingClientRect()[dir],
            center  = ofs_box + (tocenter ? (content[siz] / 2) - target[siz] / 2 : 0),
            scrl    = Math.min(0,center - ofs_elm)
            scrl    = maxOffset(scrl)

        startScroll(scrl)
    }

    this.vieport = function(){
        let vieport = {}

        if(Utils.isTouchDevice()){
            vieport.position = html[params.horizontal ? 'scrollLeft' : 'scrollTop'],
            vieport.body     = body[params.horizontal ? 'scrollWidth' : 'scrollHeight'],
            vieport.content  = html[params.horizontal ? 'offsetWidth' : 'offsetHeight'] 
        }
        else{
            vieport.position = scroll_position
            vieport.body     = body[params.horizontal ? 'offsetWidth' : 'offsetHeight']
            vieport.content  = html[params.horizontal ? 'offsetWidth' : 'offsetHeight']
        }

        return vieport
    }

    this.isEnd = function(end_ratio){
        let vieport = this.vieport()

        if(vieport.body < vieport.content) return false

        return vieport.body - (vieport.content * Math.max(1,end_ratio || params.end_ratio || 1)) < Math.abs(vieport.position)
    }

    this.append = function(object){
        body.appendChild(object instanceof jQuery ? object[0] : object)
    }

    this.minus = function(minus){
        html.classList.add('layer--wheight')

        html.mheight = minus instanceof jQuery ? minus[0] : minus
    }

    this.height = function(minus){
        html.classList.add('layer--height')

        html.mheight = minus instanceof jQuery ? minus[0] : minus
    }

    this.body = function(js){
        return js ? body : $(body)
    }

    this.render = function(js){
        return js ? html : $(html)
    }

    this.clear = function(){
        body.innerHTML = ''
    }

    this.reset = function(){
        body.style.transform = 'translate3d(0px, 0px, 0px)'
        body.style.margin = '0px'
        
        scroll_position = 0
    }

    this.destroy = function(){
        html.remove()
    }
}

export default create