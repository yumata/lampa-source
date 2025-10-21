import Storage from '../core/storage/storage'
import Head from '../interaction/head/head'
import Template from '../interaction/template'

function init() {
    let counter    = Template.elem('div', {class: 'head__fps-counter'})
    let canvas     = Template.elem('canvas', {class: 'head__fps-graph'})
    let ctx        = canvas.getContext("2d")
    let html       = Template.elem('div', {class: 'head__fps', children: [ canvas, counter ]})

    let last_time   = typeof performance !== 'undefined' ? performance.now() : Date.now()
    let fps         = 0
    let smoothing   = 0.8
    let history     = []
    let max_history = 0

    function updateFPS(now) {
        let delta = now - last_time

        last_time = now

        let current_fps = 1000 / delta
        
        fps = fps * smoothing + current_fps * (1 - smoothing)

        counter.textContent = fps.toFixed(1)

        // Добавляем FPS в историю
        history.push(fps)

        if (history.length > max_history) history.shift()

        drawGraph()

        if(window.lampa_settings.developer.fps) requestAnimationFrame(updateFPS);
    }

    function drawGraph() {
        let w = canvas.width;
        let h = canvas.height;
        let m = 60

        // Ищем максимальный FPS в истории для масштабирования
        history.forEach(v=>{
            m = Math.max(m, v)
        })

        // небольшой запас сверху
        m += m * 0.2 

        // Масштаб по вертикали
        let scale = h / m;

        ctx.clearRect(0, 0, w, h)


        let gradient = ctx.createLinearGradient(0, 0, 0, h)
            gradient.addColorStop(0, "rgba(0,255,0,0.4)")
            gradient.addColorStop(1, "rgba(0,255,0,0)")

        ctx.beginPath()

        for (let i = 0; i < history.length; i++) {
            let y = h - history[i] * scale

            if (i === 0) ctx.moveTo(i, y)
            else ctx.lineTo(i, y)
        }

        // Замыкаем форму до низа графика
        ctx.lineTo(history.length, h)
        ctx.lineTo(0, h)
        ctx.closePath()

        // Заливка
        ctx.fillStyle = gradient
        ctx.fill()

        // Контур линии FPS
        ctx.beginPath()

        for (let i = 0; i < history.length; i++) {
            let y = h - history[i] * scale

            if (i === 0) ctx.moveTo(i, y)
            else ctx.lineTo(i, y)
        }

        ctx.strokeStyle = "#0f0"
        ctx.lineWidth = 1.5
        ctx.stroke()
    }

    function start(){
        Head.render(true).find('.head__title').after(html)

        canvas.width  = $(canvas).width()
        canvas.height = $(canvas).height()

        history     = []
        max_history = canvas.width

        requestAnimationFrame(updateFPS)
    }

    Storage.listener.follow('change', (e) => {
        if (e.name === 'developer_fps') {
            if (e.value == 'true')  start()
            else {
                html.remove()
            }
        }
    })

    if(window.lampa_settings.developer.fps) start()
}

export default {
    init
}