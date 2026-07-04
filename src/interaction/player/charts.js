import Panel from './panel'
import Video from './video'
import Arrays from '../../utils/arrays'
import Template from '../../interaction/template'

let html
let graphs = []

function init(){
    html = Template.elem('div', {class: 'player-charts'})

    Panel.render().find('.player-panel__body').append(html)
}

function push(data){
    clear(data.name)

    graphs.push(data)

    draw()
}

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
}

export default {
    init,
    push,
    clear,
    destroy
}