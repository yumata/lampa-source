import Template from './template'
import Storage from '../utils/storage'
import Layer from '../utils/layer'
import Platform from '../utils/platform'

/**
 * Создает кастомный скролл
 * @param {object} [params] - параметры скрола
 * @param {boolean} [params.horizontal=false] - горизонтальный скролл
 * @param {boolean} [params.mask=false] - отображать маску прокрутки
 * @param {boolean} [params.over=false] - разрешить скролл поверх других элементов
 * @param {boolean} [params.nopadding=false] - отключить паддинги
 * @param {boolean} [params.notransition=false] - отключить анимацию прокрутки
 * @param {number} [params.step=150] - шаг прокрутки колесом мыши
 * @param {boolean} [params.scroll_by_item=false] - прокручивать по элементам
 * @param {number} [params.end_ratio=1] - соотношение для определения конца скрола (1 - конец, 2 - середина и т.д.)
 * @param {function} [this.onWheel] - вызывается при прокрутке колесом мыши, вместо стандартной функции
 * @param {function} [this.onScroll] - вызывается при прокрутке скрола
 * @param {function} [this.onEnd] - вызывается при достижении конца скрола
 * @returns {Scroll}
 */
function Scroll(params = {}){
    let _self = this

    let html    = Template.js('scroll')
    let body    = html.querySelector('.scroll__body')
    let content = html.querySelector('.scroll__content')

    let caianimate = typeof requestAnimationFrame !== 'undefined'

    let frame_time = 0

    let scroll_position = 0
    let scroll_transition = 0
    let scroll_time = 0,
        scroll_step = params.step || 150

    let call_update_time = Date.now()
    let call_transition_time = Date.now()
    
    if(params.horizontal) html.classList.toggle('scroll--horizontal',true)
    if(params.mask) html.classList.toggle('scroll--mask',true)
    if(params.over) html.classList.toggle('scroll--over',true)
    if(params.nopadding) html.classList.toggle('scroll--nopadding',true)
    if(params.notransition) body.classList.toggle('notransition',true)
    
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
    
    html.Scroll = _self
    
    body.addEventListener('webkitTransitionEnd', ()=>{
        if(Date.now() - call_transition_time > 400) return

        //чет на моей карте выходит 180-190, странно, ну да ладно, поставил 150
        if(Date.now() - call_update_time > 150) scrollEnded()
    })

    if(Platform.screen('tv')){
        html.addEventListener('scroll',(e)=>{
            html.scrollTop = 0
            html.scrollLeft = 0
        })
    }
    else{
        html.addEventListener('scroll',scrollEnded)
    }

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

        if(_self.onScroll) _self.onScroll(!Platform.screen('tv') ? html[params.horizontal ? 'scrollLeft' : 'scrollTop'] : -scroll_position)
        else Layer.visible(html)

        if(_self.onEnd && _self.isEnd()) _self.onEnd()
    }

    function scrollTo(scrl){
        scroll_position = scrl

        if(!Platform.screen('tv')){
            let object = {}

            object[params.horizontal ? 'scrollLeft' : 'scrollTop'] = -scrl

            $(html).animate(object, 200)
        }
        else{
            if(scroll_transition == false){
                scroll_transition = scrl

                if(caianimate && Storage.field('animation')){
                    let cannow = Date.now() - frame_time > 500

                    if(cannow) animate()
                    else requestAnimationFrame(animate)
                }
                else animate()
            }
        }
    }

    function animate(){
        body.style['-webkit-transform'] = 'translate3d('+Math.round(params.horizontal ? scroll_transition : 0)+'px, '+Math.round(params.horizontal ? 0 : scroll_transition)+'px, 0px)'
        
        scroll_transition = false

        if(!Storage.field('animation') || (Date.now() - call_update_time < 300)) scrollEnded()

        frame_time = Date.now()
    }

    function startScroll(scrl){
        scrollTo(scrl)

        call_update_time = Date.now()
        call_transition_time = Date.now()
    }

    this.addSwipeDown = function(call){
        if(window.innerWidth > 480) return
        
        let s = 0
        let t = 0

        html.addEventListener('touchstart',(e)=>{
            let point = e.touches[0] || e.changedTouches[0]

            if(s == 0){
                s = point.clientY
                t = Date.now()
            }
        })

        html.addEventListener('touchmove',(e)=>{
            let point = e.touches[0] || e.changedTouches[0]

            if(s !== 0){
                if(point.clientY - s > 50 && html.scrollTop == 0 && Date.now() - t < 100){
                    s = 0

                    call()
                }
            }
        })

        html.addEventListener('touchend',(e)=>{
            s = 0
        })
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

        let max  = params.horizontal ? 30000 : body.offsetHeight
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

        if(!Platform.screen('tv')){
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

        if(vieport.body < vieport.content) return vieport.position <= 0

        return vieport.body - (vieport.content * Math.max(1,end_ratio || params.end_ratio || 1)) < Math.abs(vieport.position)
    }

    this.isFilled = function(){
        let vieport = this.vieport()

        return vieport.body > vieport.content
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

    this.params = function(){
        return params
    }

    this.position = function(){
        return scroll_position
    }

    this.nopadding = function(){
        html.classList.toggle('scroll--nopadding', true)
    }

    this.reset = function(){
        body.classList.add('transition-reset')

        body.style['-webkit-transform'] = 'translate3d(0px, 0px, 0px)'

        setTimeout(()=>{
            body.classList.remove('transition-reset')
        },0)
        
        scroll_position = 0
    }

    this.destroy = function(){
        html.remove()
    }
}

export default Scroll