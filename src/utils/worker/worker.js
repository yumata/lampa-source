import BlurWorker from 'web-worker:./worker/blur.js'
import JSONWorker from 'web-worker:./worker/json.js'
import UtilsWorker from 'web-worker:./worker/utils.js'
import Arrays from '../arrays.js'
import Blur from '../blur.js'

let agent = navigator.userAgent.toLowerCase()

function WebWorker(worker, nosuport){
    let callback = false
    let timer
        
    worker.onmessage = (data) => {
        clearTimeout(timer)

        if(callback){
            callback(data)
            callback = false
        }
    }
    
    this.call = function(data, call){
        callback = call

        worker.postMessage(data)

        timer = setTimeout(()=>{
            nosuport.call(data, call)
        }, 1500)
    }
}

function createWorker(extend, nosuport){
    let worker

    if(agent.indexOf("netcast") > -1 || agent.indexOf("maple") > -1) return nosuport || {call:()=>{}}

    try{
        worker = new WebWorker(new extend(), nosuport || {call:()=>{}})
    }
    catch(e){
        worker = nosuport || {call:()=>{}}
    }

    return worker
}

let blurWorker = createWorker(BlurWorker,{
    call: (msg, call)=>{
        let imageData = Blur.imageDataRGB(
            msg.imageData, msg.topX, msg.topY, msg.width, msg.height, msg.radius
        )

        call({data: imageData})
    }
})

let jsonWorker = createWorker(JSONWorker,{
    call: (msg, call)=>{
        call({data: msg.type == 'parse' ? Arrays.decodeJson(msg.data, msg.empty) : JSON.stringify(msg.data)})
    }
})

let utilsWorker = createWorker(UtilsWorker,{
    call: (msg, call)=>{
        if(msg.type == 'account_bookmarks_parse'){
            let bookmarks = msg.data.map((elem)=>{
                if(typeof elem.data == 'string'){
                    elem.data = JSON.parse(elem.data)
                    
                    delete elem.data.release_quality
                    delete elem.data.quality
                }
        
                return elem
            }).reverse()
    
            call({data: bookmarks})
        }
    }
})

export default {
    blur: blurWorker.call,
    json: jsonWorker.call,
    utils: utilsWorker.call
}