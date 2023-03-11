import Cache from '../cache'
import Storage from '../storage'

let canvas  = document.createElement('canvas')
let ctx     = canvas.getContext('2d')
let waiting = {}

function write(img, src){
    if(!Storage.field('cache_images')) return

    if(src.indexOf('http') === 0){
        if(waiting[src]) return

        waiting[src] = true

        img.crossOrigin = "Anonymous"

        Cache.getData('images',src).then((str)=>{
            if(!str || typeof src == 'string'){
                setTimeout(()=>{
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    try{
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        canvas.toBlob((blob)=>{
                            Cache.addData('images',src, blob).then(()=>{
                                console.log('ImagesCache','save to cache',src)
    
                                delete waiting[src]
                            }).catch(()=>{
                                delete waiting[src]
                            })
                        
                        }, 'image/jpeg', 1);
                    }
                    catch(e){
                        delete waiting[src]
                    }
                },1500 + Math.round(500 * Math.random()))
                
            }
            else delete waiting[src]
        }).catch((e)=>{
            delete waiting[src]
        })
    }
}

function read(img, src){
    if(Storage.field('cache_images')){
        Cache.getData('images',src).then(str=>{
            if(str){
                if(typeof str == 'string') img.src = str
                else{
                    img.src = URL.createObjectURL(str)
                }
            }
            else img.src = src
        }).catch(()=>{
            img.src = src
        })
    }
    else img.src = src
}

export default {
    write,
    read
}