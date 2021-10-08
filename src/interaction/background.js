import Color from '../utils/color'
import Storage from '../utils/storage'
import Arrays from '../utils/arrays'

let html = $(`
    <div class="background">
        <canvas class="background__one"></canvas>
        <canvas class="background__two"></canvas>
    </div>
`)

let background = {
    one:{
        canvas: $('.background__one',html),
        ctx: $('.background__one',html)[0].getContext('2d')
    },
    two:{
        canvas: $('.background__two',html),
        ctx: $('.background__two',html)[0].getContext('2d')
    }
}

let view = 'one'
let src  = ''
let loaded = {}
let timer

function bg(){
    html.find('canvas').removeClass('visible');

    view = view == 'one' ? 'two' : 'one';

    return background[view]
}

function draw(data, item){
    if(!Storage.get('background','true')) {
        background.one.canvas.removeClass('visible')
        background.two.canvas.removeClass('visible')

        return
    }

    item.canvas[0].width  = window.innerWidth
	item.canvas[0].height = window.innerHeight

    var palette = data.palette
    var type    = Storage.get('background_type','complex')

    if(type !== 'poster'){
        var angle = 90 * Math.PI / 180,
            x2 = item.canvas[0].width * Math.cos(angle),
            y2 = item.canvas[0].height * Math.sin(angle)

        var gradient = item.ctx.createLinearGradient(0, 0, x2, y2)
            gradient.addColorStop(1, Color.tone(palette.average,0.7, 50, 80))
            gradient.addColorStop(0, Color.rgba(palette.dark,0.2))

        item.ctx.fillStyle = gradient

        item.ctx.fillRect(0, 0, item.canvas[0].width, item.canvas[0].height)
    }
    else{
        var ratio = Math.max(item.canvas[0].width / data.img.width, item.canvas[0].height / data.img.height);

		item.ctx.globalAlpha = data.img.width > 1000 ? 0.3 : 0.6
        item.ctx.filter      = data.img.width > 1000 ? '' : 'blur(14px)'

		var nw = data.img.width * ratio,
			nh = data.img.height * ratio;

            item.ctx.drawImage(data.img, -(nw-item.canvas[0].width) / 2, -(nh-item.canvas[0].height) / 2, nw, nh)

        item.ctx.globalAlpha = 0.7

        var angle = 90 * Math.PI / 180,
            x2 = item.canvas[0].width * Math.cos(angle),
            y2 = item.canvas[0].height * Math.sin(angle)

        var gradient = item.ctx.createLinearGradient(0, 0, x2, y2)
            gradient.addColorStop(0, 'rgba(0,0,0,1)')
            gradient.addColorStop(1, 'rgba(0,0,0,0)')

        item.ctx.fillStyle = gradient

        item.ctx.fillRect(0, 0, item.canvas[0].width, item.canvas[0].height)
    }

    if(type == 'complex'){
        for(let i = 0; i < 10; i++){
            let x = window.innerWidth * Math.random(),
                y = window.innerHeight * Math.random(),
                r = Math.max(window.innerHeight / 8, window.innerHeight / 5 * Math.random())

            var circle = item.ctx.createRadialGradient(x,y,r, x,y,r*2)
                circle.addColorStop(0, Color.tone(i < 5 ? palette.average : palette.bright,0.1))
                circle.addColorStop(0.5, Color.tone(i < 5 ? palette.average : palette.bright,0.05))
                circle.addColorStop(1, Color.tone(i < 5 ? palette.average : palette.bright,0))

            item.ctx.beginPath();

            item.ctx.fillStyle = circle

            item.ctx.arc(x, y, r*2, 0, 2 * Math.PI)

            item.ctx.fill()
        }
    }

    item.canvas.addClass('visible')
}

function resize(){
    if(loaded[src]) draw(loaded[src], background[view])
}

function limit(){
    let a = Arrays.getKeys(loaded)

    if(a.length > 30){
        let u = a.slice(0,1)

        delete loaded[u]
    }
}

function load(){
    if(loaded[src]){
        draw(loaded[src],bg())
    }
    else if(src){
        limit()

        let colors
        let img = new Image()
            img.crossOrigin = "Anonymous"

            img.onload = function(){
                try{
                    colors = Color.get(img)
                }
                catch(e){
                    colors = [
                        [200,200,200],
                        [100,100,100],
                        [10,10,10]
                    ]
                }

                loaded[src] = {
                    img: img,
                    palette: Color.palette(colors)
                }

                draw(loaded[src],bg())
            }

            img.src = src;
    }
}

function change(url = ''){
    url = url.replace('https://','http://')

    if(url == src) return

    if(url) src = url

    clearTimeout(timer)

    timer = setTimeout(()=>{
        load()
    },2000)
}

function immediately(url = ''){
    if(url) src = url

    clearTimeout(timer)

    load()
}

function render(){
    return html
}

function init(){
    Storage.listener.follow('change', (event)=>{
        if(event.name == 'background' || event.name == 'background_type') resize()
    })


    $(window).on('resize', resize)
}

export default {
    render,
    change,
    update: resize,
    init,
    immediately
}