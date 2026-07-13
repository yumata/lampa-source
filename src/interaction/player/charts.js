import Video from './video'
import Arrays from '../../utils/arrays'
import Template from '../../interaction/template'
import Footer from './footer'
import Player from '../player'
import Panel from './panel'
import Controller from '../../core/controller'

let html
let row
let graphs = []

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

    if(!row) row = Footer.appendRow(html)

    Panel.visible(true)

    Controller.toggle('player_footer')
}

/**
 * Отрисовка графиков в плеере
 */
function draw(){
    graphs.filter(g=>!g.html).forEach((data) => {
        let graph    = Template.elem('div', {class: 'player-charts__graph graph--' + data.type})
        let duration = Video.video().duration

        if(data.type == 'segments'){
            let segments = data.data || []

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

                if(segment.label) segment_html.prepend(Template.elem('div', {class: 'player-charts-segment__label', html: segment.label}))

                if(segment.text) segment_html.prepend(Template.elem('div', {class: 'player-charts-segment__text player-charts__text', children: [
                    Template.elem('div', {html: segment.text})
                ]}))

                graph.append(segment_html)
            })
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