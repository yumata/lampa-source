import BlurWorker from 'web-worker:./worker/blur.js'
import JSONWorker from 'web-worker:./worker/json.js'
import UtilsWorker from 'web-worker:./worker/utils.js'
import Arrays from './arrays'

function WebWorker(worker){
    let callback = false
        
    worker.onmessage = (data) => {
        if(callback){
            callback(data)
            callback = false
        }
    }
    
    this.call = function(data, call){
        callback = call

        worker.postMessage(data)
    }
}

function createWorker(extend, nosuport){
    let worker

    if(typeof nw !== 'undefined'){
        return nosuport || {call:()=>{}}
    }

    try{
        worker = new WebWorker(new extend())
    }
    catch(e){
        worker = nosuport || {call:()=>{}}
    }

    return worker
}

let blurWorker = createWorker(BlurWorker)

let jsonWorker = createWorker(JSONWorker,{
    call: (msg, call)=>{
        call({data: msg.type == 'parse' ? Arrays.decodeJson(msg.data, msg.empty) : JSON.stringify(msg.data)})
    }
})

let utilsWorker = createWorker(UtilsWorker,{
    call: (msg, call)=>{
        if(msg.type == 'account_bookmarks_parse'){
            let bookmarks = msg.data.reverse().map((elem)=>{
                if(typeof elem.data == 'string') elem.data = JSON.parse(elem.data)
        
                return elem
            })
    
            call({data: bookmarks})
        }
    }
})

export default {
    blur: blurWorker.call,
    json: jsonWorker.call,
    utils: utilsWorker.call
}