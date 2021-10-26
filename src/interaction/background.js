import Color from '../utils/color'
import Storage from '../utils/storage'
import Arrays from '../utils/arrays'
import Platform from '../utils/platform'

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
let bokeh  = {
    c: [],
    h: [],
    d: true
}
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

    let palette = data.palette
    let type    = Storage.get('background_type','complex')

    blur(data, item, ()=>{
        if(type == 'complex' && bokeh.d){
            let bright = Color.rgbToHsl(palette.average[0],palette.average[1],palette.average[2]) 

            item.ctx.globalAlpha = bright[2] > 30 ? bright[2] / 100 * 0.6 : 0.4
            item.ctx.globalCompositeOperation = bright[2] > 30 ? 'color-dodge' : 'screen'
            
            for(let i = 0; i < 10; i++){
                let bp = Math.round(Math.random() * (bokeh.c.length - 1))
                let im = bright[2] > 30 ? bokeh.h[bp] : bokeh.c[bp]
                let xp = window.innerWidth * Math.random(),
                    yp = (window.innerHeight / 2) * Math.random() + (window.innerHeight / 2),
                    sz = Math.max(window.innerHeight / 8, window.innerHeight / 5 * Math.random()) * 0.01,
                    nw = im.width * sz,
                    nh = im.height * sz
                
                try{
                    item.ctx.drawImage(im, xp - (nw / 2), yp - (nw / 2), nw, nh)
                }
                catch(e){}
            }
        }


        item.ctx.globalAlpha = type == 'poster' ? 0.7 : 0.6
        item.ctx.globalCompositeOperation = 'multiply'

        let angle = 90 * Math.PI / 180,
            x2 = item.canvas[0].width * Math.cos(angle),
            y2 = item.canvas[0].height * Math.sin(angle)

        let gradient = item.ctx.createLinearGradient(0, 0, x2, y2)
            gradient.addColorStop(0, 'rgba(0,0,0,1)')
            gradient.addColorStop(1, 'rgba(0,0,0,0)')

        item.ctx.fillStyle = gradient

        item.ctx.fillRect(0, 0, item.canvas[0].width, item.canvas[0].height)

        item.canvas.addClass('visible')
    })
}

function blur(data, item, complite){
    let img = data.img.width > 1000 ? data.img : Color.blur(data.img)

    setTimeout(()=>{
        let ratio = Math.max(item.canvas[0].width / img.width, item.canvas[0].height / img.height)

		let nw = img.width * ratio,
			nh = img.height * ratio;

            item.ctx.globalAlpha = data.img.width > 1000 ? (bokeh.d ? 0.7 : 0.2) : 1

            item.ctx.drawImage(img, -(nw-item.canvas[0].width) / 2, -(nh-item.canvas[0].height) / 2, nw, nh)

            complite()
    },100)
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
    //url = url.replace('https://','http://')

    if(url == src) return

    bokeh.d = true

    if(url) src = url

    clearTimeout(timer)

    timer = setTimeout(()=>{
        load()
    },1000)
}

function immediately(url = ''){
    if(url) src = url

    clearTimeout(timer)

    bokeh.d = false

    load()
}

function render(){
    return html
}

function init(){
    Storage.listener.follow('change', (event)=>{
        if(event.name == 'background' || event.name == 'background_type') resize()
    })

    let u = Platform.any() ? 'https://yumata.github.io/lampa/' : './'

    for (let i = 1; i <= 6; i++) {
        let im = new Image()
            im.src = u + 'img/bokeh-h/'+i+'.png'

        bokeh.h.push(im)
    }

    for (let i = 1; i <= 6; i++) {
        let im = new Image()
            im.src = u + 'img/bokeh/'+i+'.png'

        bokeh.c.push(im)
    }

    $(window).on('resize', resize)
}

export default {
    render,
    change,
    update: resize,
    init,
    immediately
}