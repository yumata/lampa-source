import Video from './video'
import Arrays from '../../utils/arrays'
import Template from '../../interaction/template'
import Footer from './footer'
import Player from '../player'
import Panel from './panel'
import Controller from '../../core/controller'
import Register from '../../interaction/register/register'
import RegisterModule from '../../interaction/register/module/module'
import Utils from '../../utils/utils'
import Lang from '../../core/lang'
import Scroll from '../../interaction/scroll'

let html
let row
let graphs = []
let scroll

/**
 * Графики в плеере
 */
function init(){
    html = Template.elem('div', {class: 'player-charts'})

    Player.listener.follow('destroy', destroy)
}

/**
 * Добавление графика в плеер
 * @param {Object} data - Данные графика
 * @param {String} data.name - Имя графика
 * @param {String} data.type - Тип графика (segments)
 * @param {Array} data.data - Данные графика
 */
function push(data){
    clear(data.name)

    graphs.push(data)

    draw()

    if(!row){ 
        row = Footer.appendRow(html)

        row.use({
            onToggle(){
                let focus

                $(this.html).find('.selector').each(function(){
                    let segment = this.segment
                    let active  = segment && Video.video().currentTime >= segment.start && Video.video().currentTime <= segment.end

                    if(active) focus = this

                    this.toggleClass('player-charts-segment--current', Boolean(active))
                })

                if(focus){
                    Controller.collectionFocus(focus, this.html)
                }
            }
        })
    }

    Panel.visible(true)

    Controller.toggle('player_footer')
}

/**
 * Отрисовка графиков в плеере
 */
function draw(){
    graphs.filter(g=>!g.html).forEach((data) => {
        let graph = Template.elem('div', {class: 'player-charts__graph graph--' + data.type})

        if(data.type == 'graph'){
            let segments = data.data || []
            let segments_duration = 0

            segments.forEach(segment => {
                if(segment.end > segments_duration) segments_duration = segment.end
            })

            let duration = Math.max(Video.video().duration || 0, data.duration || segments_duration) || 1

            let W = window.innerWidth - 30
            let H = 210

            let canvas = document.createElement('canvas')
            canvas.width  = W
            canvas.height = H
            canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block'

            let ctx = canvas.getContext('2d')

            let real = segments.map(segment => ({
                x: ((segment.start + segment.end) / 2 / duration) * W,
                y: H - (Math.min(100, segment.height || 5) / 100) * H
            }))

            if(real.length >= 2){
                // Edge anchors + ghost points for smooth Catmull-Rom spline clamping
                let pts = [
                    {x: -W * 0.05, y: real[0].y},
                    {x: 0,          y: real[0].y},
                    ...real,
                    {x: W,          y: real[real.length - 1].y},
                    {x: W * 1.05,   y: real[real.length - 1].y}
                ]

                let curve = () => {
                    for(let i = 1; i < pts.length - 2; i++){
                        let p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2]
                        let cp1x = p1.x + (p2.x - p0.x) / 6
                        let cp1y = p1.y + (p2.y - p0.y) / 6
                        let cp2x = p2.x - (p3.x - p1.x) / 6
                        let cp2y = p2.y - (p3.y - p1.y) / 6
                        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
                    }
                }

                let grad = ctx.createLinearGradient(0, 0, 0, H)
                grad.addColorStop(0,    'rgba(255,255,255,0.85)')
                grad.addColorStop(0.55, 'rgba(200,200,200,0.3)')
                grad.addColorStop(1,    'rgba(0,0,0,0)')

                ctx.save()
                ctx.beginPath()
                ctx.moveTo(0, H)
                ctx.lineTo(0, pts[1].y)
                curve()
                ctx.lineTo(W, H)
                ctx.closePath()
                ctx.fillStyle = grad
                ctx.fill()
                ctx.restore()

                ctx.save()
                ctx.shadowColor = 'rgba(255,255,255,0.5)'
                ctx.shadowBlur  = 8
                ctx.beginPath()
                ctx.moveTo(0, pts[1].y)
                curve()
                ctx.strokeStyle = 'rgba(255,255,255,0.9)'
                ctx.lineWidth   = 3
                ctx.lineJoin    = 'round'
                ctx.lineCap     = 'round'
                ctx.stroke()
                ctx.restore()
            }

            graph.append(canvas)
        }
        else if(data.type == 'segments'){
            let segments = data.data || []
            let segments_duration = 0

            segments.forEach((segment) => {
                if(segment.end > segments_duration) segments_duration = segment.end
            })

            let duration = Math.max(Video.video().duration, data.duration || segments_duration)
            let current  = Video.video().currentTime || 0

            segments.forEach((segment, i) => {
                let width  = (segment.end - segment.start) / duration * 100
                let height = (segment.height ? 11 * segment.height / 100 : 0.4).toFixed(2)
                let level  = (segment.level ? 11 * segment.level / 100 : 0).toFixed(2)

                let segment_html = Template.elem('div', {
                    class: 'player-charts-segment', 
                    attrs: {
                        style: 'width:' + width + '%; left:' + (segment.start / duration * 100) + '%'
                    },
                    children: [
                        Template.elem('div', {
                            class: 'player-charts-segment__bar', 
                            attrs: {style: 'height:' + height + 'em; margin-bottom:' + level + 'em'}
                        })
                    ]
                })

                let label = segment.label
                let text  = segment.title

                if(label) segment_html.prepend(Template.elem('div', {class: 'player-charts-segment__label', html: label}))

                if(segment.title && segment.description && width > 40) text += '<br>' + segment.description

                if(text && width > 5) segment_html.prepend(Template.elem('div', {class: 'player-charts-segment__text player-charts__text', children: [
                    Template.elem('div', {html: text})
                ]}))

                if(segment.onSelect){
                    segment_html.addClass('selector').on('hover:enter', () => {
                        segment.onSelect(segment, segment_html)
                    })
                }

                if(segment.onFocus) {
                    segment_html.on('hover:focus hover:hover hover:touch', () => {
                        segment.onFocus(segment, segment_html)
                    })
                }

                segment_html.segment = segment

                graph.append(segment_html)
            })
        }
        else if(data.type == 'metadata'){
            let segments = data.data || []
            
            scroll = new Scroll({nopadding: true, horizontal: true})

            segments.forEach((meter) => {
                let register = Utils.createInstance(Register, meter, {
                    module: RegisterModule.toggle(RegisterModule.MASK.base, 'Line', 'Chart', 'Icon', 'Callback')
                })

                register.use({
                    onFocus: ()=>{
                        scroll.update(register.render(), true)
                    }
                })

                register.create()

                scroll.body().addClass('mapping--line')

                scroll.append(register.render())
            })

            graph.append(scroll.render())
        }

        data.html = graph

        html.append(graph)
    })
}

/**
 * Удаляет график по имени
 * @param {String} graph_name - Имя графика для удаления. Если не указано, удаляются все графики.
 */
function clear(graph_name){
    if(graph_name){
        let remove = graphs.filter(g => g.name == graph_name)

        remove.forEach(r => {
            Arrays.remove(graphs, r)
            
            r.html && r.html.remove()
        })
    }
    else{
        graphs.forEach(g => {
            g.html && g.html.remove()
        })

        graphs = []
    }

    if(scroll){
        scroll.destroy()
        scroll = null
    }
}

function destroy(){
    clear()

    if(row){
        row.destroy()
        row = null
    }

    graphs = []
}

export default {
    init,
    push,
    clear,
    destroy
}