import BlurWorker from 'web-worker:./worker/blur.js'

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

let blurWorker

try{
    blurWorker = new WebWorker(new BlurWorker())
}
catch(e){
    blurWorker = {call:()=>{}}
}

export default {
    blur: blurWorker.call
}