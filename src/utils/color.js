import Blur from './blur'

var canvas = document.createElement('canvas'),
	ctx    = canvas.getContext('2d')

canvas.width  = 30
canvas.height = 17

var canvas_poster = document.createElement('canvas'),
	ctx_poster    = canvas_poster.getContext('2d')

function extract(img_data){
    let data   = img_data.data,
		colors = []

    for(var i = 0, n = data.length; i < n; i += 4) {
        colors.push([data[i],data[i + 1],data[i + 2]])
    }

	return colors
}

function palette(palette){
    var colors = {
        bright: [0,0,0],
        average: [127,127,127],
        dark: [255,255,255]
    }

    var ar = 0,ag = 0,ab = 0,at = palette.length
    var bg = 0,dk = 765

    for (var i = 0; i < palette.length; i++) {
        var p = palette[i],
            a = p[0] + p[1] + p[2]

        ar+= p[0]
        ag+= p[1]
        ab+= p[2]

        if(a > bg){
            bg = a;

            colors.bright = p
        }

        if(a < dk){
            dk = a;

            colors.dark = p
        }
    }

    colors.average = [Math.round(ar/at),Math.round(ag/at),Math.round(ab/at)]

    return colors
}

function rgba(c,o = 1){
    return 'rgba('+c.join(',')+','+o+')';
}

function tone(c, o = 1, s = 30, l = 80){
    let hls = rgbToHsl(c[0],c[1],c[2])
    let rgb = hslToRgb(hls[0],Math.min(s,hls[1]),l)

    return rgba(rgb, o)
}

/**
 * Converts an RGB color value to HSL.
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r, g, b){
    let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
    rabs = r / 255;
    gabs = g / 255;
    babs = b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    diffc = c => (v - c) / 6 / diff + 1 / 2;
    percentRoundFn = num => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }

    return [Math.round(h * 360), percentRoundFn(s * 100), percentRoundFn(v * 100)]
}

/**
 * Converts an HSL color value to RGB.
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
 function hslToRgb(h, s, l){
    s /= 100;
    l /= 100;

    var C   = (1 - Math.abs(2 * l - 1)) * s;
    var hue = h / 60;
    var X   = C * (1 - Math.abs(hue % 2 - 1));

    var r = 0,
        g = 0,
        b = 0;

    if (hue >= 0 && hue < 1) {
        r = C;
        g = X;
    } else if (hue >= 1 && hue < 2) {
        r = X;
        g = C;
    } else if (hue >= 2 && hue < 3) {
        g = C;
        b = X;
    } else if(hue >= 3 && hue < 4) {
        g = X;
        b = C;
    } else if (hue >= 4 && hue < 5) {
        r = X;
        b = C;
    } else {
        r = C;
        b = X;
    }
    var m = l - C / 2;

    r += m;
    g += m;
    b += m;
    r *= 255.0;
    g *= 255.0;
    b *= 255.0;

    return [Math.round(r), Math.round(g), Math.round(b)];

}

function reset(width, height){
    canvas.width  = width
    canvas.height = height
}

function get(img){
    reset(30,17)

    let ratio = Math.max(canvas.width / img.width, canvas.height / img.height)
	let nw = img.width * ratio,
		nh = img.height * ratio

	ctx.drawImage(img, -(nw-canvas.width) / 2, -(nh-canvas.height) / 2, nw, nh)

	return extract(ctx.getImageData(0, 0, canvas.width, canvas.height))
}

function blur(img, callback){
    reset(200,130)

    let ratio = Math.max(canvas.width / img.width, canvas.height / img.height)

    let nw = img.width * ratio,
		nh = img.height * ratio

    ctx.drawImage(img, -(nw-canvas.width) / 2, -(nh-canvas.height) / 2, nw, nh)
    
    Blur.canvasRGB(canvas, 0, 0, canvas.width, canvas.height, 80,()=>{
        let nimg = new Image()

        try{
            nimg.src = canvas.toDataURL()
        }
        catch(e){}

        setTimeout(()=>{
            callback(nimg)
        },100)
    })
}

function getImg(callback){
    let im = new Image()

    try{
        im.src = canvas_poster.toDataURL()
    }
    catch(e){}

    setTimeout(()=>{
        callback(im)
    },100)
}

function blurPoster(img, w, h, callback){
    canvas_poster.width  = w
    canvas_poster.height = h

    let ratio = Math.max(canvas_poster.width / img.width, canvas_poster.height / img.height)

    let nw = img.width * ratio,
		nh = img.height * ratio

    setTimeout(()=>{
    
        ctx_poster.drawImage(img, -(nw-canvas_poster.width) / 2, -(nh-canvas_poster.height) / 2, nw, nh)
        
        Blur.canvasRGB(canvas_poster, 0, 0, canvas_poster.width, canvas_poster.height, 50,()=>{
            
            let gradient = ctx_poster.createLinearGradient(0, 0, 0, canvas_poster.height)
                gradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)')
                gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)')
                gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')

            ctx_poster.globalCompositeOperation = 'destination-out'
            ctx_poster.fillStyle = gradient
            ctx_poster.fillRect(0, 0, canvas_poster.width, canvas_poster.height)
            ctx_poster.globalCompositeOperation = 'source-over'

            
            getImg((blured)=>{
                canvas_poster.width  = w
                canvas_poster.height = h

                ctx_poster.drawImage(img, -(nw-canvas_poster.width) / 2, -(nh-canvas_poster.height) / 2, nw, nh)
                
                let gradient = ctx_poster.createLinearGradient(0, 0, 0, canvas_poster.height)
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
                    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)')
                    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)')
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

                ctx_poster.globalCompositeOperation = 'destination-in'
                ctx_poster.fillStyle = gradient
                ctx_poster.fillRect(0, 0, canvas_poster.width, canvas_poster.height)
                ctx_poster.globalCompositeOperation = 'source-over'

                ctx_poster.drawImage(blured, 0, 0)

                getImg(callback)
            })
        })
    },100)
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}  

export default {
    get,
    extract,
    palette,
    rgba,
    blur,
    tone,
    rgbToHsl,
    rgbToHex,
    hslToRgb,
    blurPoster
}