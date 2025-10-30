import Template from './template'
import Layer from '../core/layer'
import Platform from '../core/platform'
import Storage from '../core/storage/storage'

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
    let screen  = Platform.screen('tv')

    let scroll_position        = 0
    let scroll_animating       = false

    let time_call_end = Date.now()

    let scroll_time = 0,
        scroll_step = params.step || 150

    
    if(params.horizontal) html.classList.toggle('scroll--horizontal',true)
    if(params.mask) html.classList.toggle('scroll--mask',true)
    if(params.over) html.classList.toggle('scroll--over',true)
    if(params.nopadding) html.classList.toggle('scroll--nopadding',true)
    if(params.notransition) body.classList.toggle('notransition',true)

    function wheel(e){
        let parent = $(e.target).parents('.scroll')
        let inner  = onTheRightSide(e, true)

        if(!params.horizontal && $(html).is(parent[0])) inner = true

        if(Date.now() - scroll_time > 200 && inner){
            scroll_time = Date.now()

            if(e.wheelDelta / 120 > 0) {
                if(_self.onWheel) _self.onWheel(-scroll_step)
                else _self.wheel(-scroll_step)
            }
            else{
                if(_self.onWheel) _self.onWheel(scroll_step)
                else _self.wheel(scroll_step)
            }
        }
    }
    
    // Обрабатываем скролл колесом мыши
    html.addEventListener('mousewheel', wheel)
    html.addEventListener('wheel', wheel)

    
    // Экспортируемые методы и свойства
    html.Scroll = _self

    // Если это телевизор и есть сенсорный экран, то делаем скролл тачем
    if(screen){
        html.addEventListener('scroll',(e)=>{
            html.scrollTop = 0
            html.scrollLeft = 0
        })

        let start_position = 0
        let move_position  = 0
        let end_position   = 0

        function movestart(e){
            start_position = params.horizontal ? e.clientX : e.clientY
            end_position   = start_position
            move_position  = start_position

            body.toggleClass('notransition', true)
        }

        function move(e){
            end_position = params.horizontal ? e.clientX : e.clientY

            if(move_position && end_position){
                let delta        = move_position - end_position
                let direct       = params.horizontal ? 'left' : 'top'
                let scrl         = scroll_position,
                    scrl_padding = parseInt(window.getComputedStyle(content, null).getPropertyValue('padding-' + direct))

                let max  = params.horizontal ? 30000 : body.offsetHeight
                    max -= params.horizontal ? html.offsetWidth : html.offsetHeight
                    max += scrl_padding * 2

                scrl -= delta
                scrl = Math.min(0,Math.max(-max,scrl))
                scrl = maxOffset(scrl)

                scroll_position = scrl

                translateScroll()

                move_position = end_position
            }
        }

        function moveend(e){
            end_position   = 0
            start_position = 0
            move_position  = 0

            body.toggleClass('notransition', false)

            scrollEnded()

            if(_self.onAnimateEnd) _self.onAnimateEnd()
        }

        html.addEventListener('touchstart',(e)=>{
            movestart(e.touches[0] || e.changedTouches[0])
        })

        html.addEventListener('touchmove',(e)=>{
            move(e.touches[0] || e.changedTouches[0])
        })

        html.addEventListener('touchend', moveend)
    }
    else{
        let native_scroll_animate = false
        let native_scroll_timer   = null

        html.addEventListener('scroll', ()=>{
            clearTimeout(native_scroll_timer)

            native_scroll_timer = setTimeout(()=>{
                if(_self.onAnimateEnd) _self.onAnimateEnd()
            },300)

            if(!native_scroll_animate){
                native_scroll_animate = true

                requestAnimationFrame(()=>{
                    native_scroll_animate = false

                    scroll_position = -(params.horizontal ? html.scrollLeft : html.scrollTop)

                    scrollEnded()
                })
            }
        })
    }

    /**
     * Определяет, находится ли курсор на правой стороне скрола
     * @param {Event} e - событие мыши
     * @param {boolean} inleft - если true, то проверяет левую сторону
     * @returns {boolean}
     */
    function onTheRightSide(e, inleft = false){
        let offset   = content.getBoundingClientRect().left
        let width    = window.innerWidth - offset
        let position = e.clientX - offset

        return params.horizontal ? position > width / 2 : inleft ? position < width / 2 : false
    }

    /**
     * Максимально возможный отступ
     * @param {number} offset - желаемый отступ
     * @returns {number}
     */
    function maxOffset(offset){
        let w = params.horizontal ? html.offsetWidth : html.offsetHeight
        let p = parseInt(window.getComputedStyle(content, null).getPropertyValue('padding-' + (params.horizontal ? 'left' : 'top')))
        let s = body[params.horizontal ? 'scrollWidth' : 'scrollHeight']
        
        offset = Math.min(0,offset)
        offset = Math.max(-((Math.max(s + p * 2,w) - w)),offset)

        return offset
    }

    /**
     * Вызов обновления скрола и вызов события конеца скрола
     */
    function scrollEnded(){
        if(_self.onScroll) _self.onScroll(!screen ? html[params.horizontal ? 'scrollLeft' : 'scrollTop'] : -scroll_position)
        else Layer.visible(html)

        if(_self.onEnd && _self.isEnd()) _self.onEnd()
    }

    /**
     * Перемещает скролл в указанную позицию без анимации
     */
    function translateScroll(){
        if(!screen){
            html[params.horizontal ? 'scrollLeft' : 'scrollTop'] = -scroll_position
        }
        else{
            body.style['-webkit-transform'] = 'translate3d('+Math.round(params.horizontal ? scroll_position : 0)+'px, '+Math.round(params.horizontal ? 0 : scroll_position)+'px, 0px)'
        }
    }

    /**
     * Начинает анимацию прокрутки к указанной позиции
     * @param {number} to_position - куда нужно прокрутить
     */
    function startScroll(to_position){
        // Зачем начинать анимацию, если мы уже там?
        if(scroll_position == to_position) {
            if(!_self.isFilled()) scrollEnded()
            
            return
        }

        scroll_position = to_position

        translateScroll()

        if(Storage.field('animation')){
            scroll_animating = true

            body.addEventListener('webkitTransitionEnd', () => {
                if(Date.now() - time_call_end < 300) return

                time_call_end = Date.now()

                scroll_animating = false

                requestAnimationFrame(() => {
                    scrollEnded()

                    if(_self.onAnimateEnd) _self.onAnimateEnd()
                })
            }, { once: true })
        }
        else{
            scrollEnded()

            if(_self.onAnimateEnd) _self.onAnimateEnd()
        } 
    }

    /**
     * Получить позицию элемента относительно скрола
     * @param {HTMLElement|jQuery} elem - элемент, который должен быть виден
     * @param {boolean} tocenter - выровнять элемент по центру скрола
     * @returns {number}
     */
    function getElementPosition(elem, tocenter){
        let dir = params.horizontal ? 'left' : 'top',
            siz = params.horizontal ? 'offsetWidth' : 'offsetHeight'

        let target = elem instanceof jQuery ? elem[0] : elem

        let p = tocenter ? parseInt(window.getComputedStyle(content, null).getPropertyValue('padding-' + (params.horizontal ? 'left' : 'top'))) : 0

        let ofs_elm = target.getBoundingClientRect()[dir],
            ofs_box = body.getBoundingClientRect()[dir],
            center  = ofs_box + (tocenter ? (content[siz] / 2) - target[siz] / 2 - p : 0),
            scrl    = Math.min(0,center - ofs_elm)
            scrl    = maxOffset(scrl)

        return scrl
    }

    /**
     * Добавить обработку свайпа вниз имитации скрытия шторки
     * @param {function} call - функция, которая будет вызвана при свайпе вниз
     */
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

    /**
     * Вызвать прокрутку
     * @param {number} size - на сколько пикселей прокрутить
     */
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

    /**
     * Обновить позицию скрола, чтобы элемент был виден
     * @param {HTMLElement|jQuery} elem - элемент, который должен быть виден
     * @param {boolean} tocenter - выровнять элемент по центру скрола
     * @returns {void}
     */
    this.update = function(elem, tocenter){
        startScroll(getElementPosition(elem, tocenter))
    }

    /**
     * Обновить позицию скрола, чтобы элемент был виден без анимации
     * @param {HTMLElement|jQuery} elem - элемент, который должен быть виден
     * @param {boolean} tocenter - выровнять элемент по центру скрола
     * @returns {void}
     */
    this.immediate = function(elem, tocenter){
        body.toggleClass('notransition', true)

        scroll_position = getElementPosition(elem, tocenter)

        translateScroll()

        setTimeout(()=>{
            body.toggleClass('notransition', false)
        },5)
    }

    /**
     * Сдвинуть скролл на указанное количество пикселей без анимации
     * @param {number} shift - на сколько пикселей сдвинуть скролл
     * @returns {void}
     */
    this.shift = function(shift){
        body.toggleClass('notransition', true)

        scroll_position = maxOffset(scroll_position - shift)

        translateScroll()

        setTimeout(()=>{
            body.toggleClass('notransition', false)
        },5)
    }

    /**
     * Получить параметры скрола
     * @returns {Object}
     */
    this.vieport = function(){
        let vieport = {}

        if(!screen){
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

    /**
     * Проверить, достигнут ли конец скрола
     * @param {number} [end_ratio] - соотношение для определения конца скрола (1 - конец, 2 - середина и т.д.)
     * @returns {boolean}
     */
    this.isEnd = function(end_ratio){
        let vieport = this.vieport()

        if(vieport.body < vieport.content) return vieport.position <= 0

        return vieport.body - (vieport.content * Math.max(1,end_ratio || params.end_ratio || 1)) < Math.abs(vieport.position)
    }

    /**
     * Проверить, заполнен ли скролл контентом
     * @returns {boolean}
     */
    this.isFilled = function(){
        let vieport = this.vieport()

        return vieport.body > vieport.content
    }

    /**
     * Добавить элемент в скролл
     * @param {HTMLElement|jQuery} object - элемент для добавления
     * @returns {void}
     */
    this.append = function(object){
        body.appendChild(object instanceof jQuery ? object[0] : object)
    }

    /**
     * Установить высоту скрола с учетом вычитаемого элемента и вычитом шапки
     * @param {HTMLElement|jQuery} minus - элемент, высота которого будет вычтена из высоты скрола
     * @returns {void}
     */
    this.minus = function(minus){
        html.classList.add('layer--wheight')

        html.mheight = minus instanceof jQuery ? minus[0] : minus
    }

    /**
     * Установить высоту скрола с учетом вычитаемого элемента
     * @param {HTMLElement|jQuery} minus - элемент, высота которого будет вычтена из высоты скрола
     * @returns {void}
     */
    this.height = function(minus){
        html.classList.add('layer--height')

        html.mheight = minus instanceof jQuery ? minus[0] : minus
    }

    /**
     * Получить тело скрола
     * @param {boolean} js - вернуть в виде DOM-элемента, а не jQuery
     * @returns {HTMLElement|jQuery}
     */
    this.body = function(js){
        return js ? body : $(body)
    }

    /**
     * Получить HTML скрола
     * @param {boolean} js - вернуть в виде DOM-элемента, а не jQuery
     * @returns {HTMLElement|jQuery}
     */
    this.render = function(js){
        return js ? html : $(html)
    }

    /**
     * Очистить скролл от элементов
     * @returns {void}
     */
    this.clear = function(){
        body.innerHTML = ''
    }

    /**
     * Получить параметры скрола
     * @returns {Object}
     */
    this.params = function(){
        return params
    }

    /**
     * Получить текущую позицию скрола
     * @returns {number}
     */
    this.position = function(){
        return scroll_position
    }

    /**
     * Восстановить позицию скрола 
     * Используется после detach активности, скролл сбивается и после start активности его нужно восстановить
     * @returns {void}
     */
    this.restorePosition = function(){
        if(Platform.screen('mobile')) translateScroll()
    }

    /**
     * Отключить паддинги у скрола
     * @returns {void}
     */
    this.nopadding = function(){
        html.classList.toggle('scroll--nopadding', true)
    }

    /**
     * Cбросить позицию скрола в 0
     * @returns {void}
     */
    this.reset = function(){
        scroll_position = 0

        translateScroll()
    }

    /**
     * Проверить, анимируется ли скролл в данный момент
     * @returns {boolean}
     */
    this.animated = function(){
        return scroll_animating ? true : false
    }

    /**
     * Удалить скролл
     * @returns {void}
     */
    this.destroy = function(){
        scroll_animating = false

        html.remove()
    }
}

export default Scroll