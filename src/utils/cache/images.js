import Cache from '../cache'

let canvas  = document.createElement('canvas')
let ctx     = canvas.getContext('2d')
let waiting = {}

function write(img, src){
    if(src.indexOf('http') === 0){
        if(waiting[src]) return

        waiting[src] = true

        img.crossOrigin = "Anonymous"

        Cache.getData('images',src).then((str)=>{
            if(!str){
                setTimeout(()=>{
                    canvas.width = img.width;
                    canvas.height = img.height;

                    let drawed = false
                    
                    try{
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        drawed = canvas.toDataURL()
                    }
                    catch(e){}
                    
                    if(drawed){
                        Cache.addData('images',src, drawed).then(()=>{
                            console.log('ImagesCache','save to cache',src)

                            delete waiting[src]
                        }).catch(()=>{
                            delete waiting[src]
                        })
                    }
                    else delete waiting[src]
                },1000)
                
            }
            else delete waiting[src]
        }).catch((e)=>{
            delete waiting[src]
        })
    }
}

function read(img, src){
    Cache.getData('images',src).then(str=>{
        img.src = str || src
    }).catch(()=>{
        img.src = src
    })
}

export default {
    write,
    read
}