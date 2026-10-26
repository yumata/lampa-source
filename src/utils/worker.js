import BlurWorker from 'web-worker:./worker/blur.js'
import JSONWorker from 'web-worker:./worker/json.js'
import UtilsWorker from 'web-worker:./worker/utils.js'
import Arrays from './arrays'
import Blur from './blur.js'

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

/**
 * То же, что parseCard в worker/utils.js (там свой файл без импортов): пустой или битый data
 * не обрывает разбор списка — карточка из card_id / card_title, иначе закладка пропускается
 */
function parseBookmarkCard(elem){
    let card = null

    try{
        card = JSON.parse(elem.data)
    }
    catch(e){}

    if(card && typeof card == 'object' && card.id) return card

    if(!elem.card_id) return null

    card = {id: parseInt(elem.card_id) || elem.card_id, source: 'tmdb', poster_path: elem.card_poster || ''}

    if(elem.card_type == 'tv') card.name = card.original_name = elem.card_title || ''
    else card.title = elem.card_title || ''

    return card
}

let utilsWorker = createWorker(UtilsWorker,{
    call: (msg, call)=>{
        if(msg.type == 'account_bookmarks_parse'){
            let bookmarks = msg.data.map((elem)=>{
                if(typeof elem.data == 'string'){
                    elem.data = parseBookmarkCard(elem)

                    if(!elem.data) return null

                    delete elem.data.release_quality
                    delete elem.data.quality
                }

                return elem
            }).filter(elem=>elem).reverse()
    
            call({data: bookmarks})
        }
    }
})

export default {
    blur: blurWorker.call,
    json: jsonWorker.call,
    utils: utilsWorker.call
}