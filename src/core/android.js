import Platform from '../core/platform.js'
import Favorite from '../core/favorite.js'
import Params from '../interaction/settings/params.js'
import Bell from '../interaction/bell.js'

let reqCallback = {}
let timeCallback = {}

function init(){
    if(Platform.is('android')){
        Params.listener.follow('button',(e)=>{
            if(e.name === 'reset_player'){
                resetDefaultPlayer()
            }
        })

        Lampa.Listener.follow('state:changed', (e)=>{
            if(e.target == 'favorite' && e.reason == 'update' && (e.method == 'add' || e.method == 'added' || e.method == 'remove')){
                updateChannel(e.type)
            }
        })
    }
}

function exit() {
    if(checkVersion(1)) AndroidJS.exit()
    else $('<a href="lampa://exit"></a>')[0].click()
}

function playHash(SERVER){
    let magnet = "magnet:?xt=urn:btih:"+SERVER.hash
    if(checkVersion(10)) {
        let intentExtra = ""
        if(SERVER.movie){
            intentExtra = {
                title: "[LAMPA] " + (SERVER.movie.title || 'No title').replace(/\s+/g, ' ').trim(),
                poster: SERVER.movie.img,
                media: SERVER.movie.name ? 'tv' : 'movie',
                data: {
                    lampa: true,
                    movie: SERVER.movie
                }
            }
        }

        AndroidJS.openTorrentLink(magnet, JSON.stringify(intentExtra))
    } else {
        $('<a href="'+ magnet+'"/>')[0].click()
    }
}

function openTorrent(SERVER){
    if(checkVersion(10)){
        let intentExtra = {
            title: "[LAMPA] " + (SERVER.movie.title || 'No title').replace(/\s+/g, ' ').trim(),
            poster: SERVER.object.poster,
            media: SERVER.movie.name ? 'tv' : 'movie',
            data: {
                lampa: true,
                movie: SERVER.movie
            }
        }

        AndroidJS.openTorrentLink(SERVER.object.MagnetUri || SERVER.object.Link, JSON.stringify(intentExtra))
    }
    else{
        $('<a href="' + (SERVER.object.MagnetUri || SERVER.object.Link) + '"/>')[0].click()
    }
}

function openPlayer(link, data){
    let updateTimeline = function(elem){
        if(elem.timeline){
            let new_timeline = Lampa.Timeline.view(elem.timeline.hash)

            elem.timeline.time     = Math.round(new_timeline.time)
            elem.timeline.duration = Math.round(new_timeline.duration)
            elem.timeline.percent  = new_timeline.percent

            timeCallback[elem.timeline.hash] = elem
        }
    }

    if(checkVersion(98, true)){
        if(data.timeline) {
            updateTimeline(data)
        }

        if(data.playlist){
            data.playlist.forEach(elem => {
                updateTimeline(elem)
            })
        }
    }
    if(checkVersion(10)) AndroidJS.openPlayer(link, JSON.stringify(data))
    else $('<a href="'+link+'"><a/>')[0].click()
}

function openYoutube(link){
    if(checkVersion(15)) AndroidJS.openYoutube(link)
    else $('<a href="'+link+'"><a/>')[0].click()
}

function openBrowser(link){
    if(checkVersion(484)) AndroidJS.openBrowser(link)
}

function resetDefaultPlayer(){
    if(checkVersion(15)) AndroidJS.clearDefaultPlayer()
}

function httpReq(data, call){
    let index = Math.floor(Math.random() * 5000)
    reqCallback[index] = {data, call}
    if(checkVersion(16)) AndroidJS.httpReq(JSON.stringify(data), index)
    else call.error({responseText: "No Native request"})
}

function httpCall(index, callback){
    let req = reqCallback[index]
    
    if(req && req.call[callback]){
        let resp = AndroidJS.getResp(index)

        if(!req.data.dataType || req.data.dataType && req.data.dataType.toLowerCase() == 'json' || callback === 'error'){
            try {
                resp = JSON.parse(resp)
            } 
            catch (e) {}
        }

        delete reqCallback[index]

        req.call[callback](resp)
    }
}

function timeCall(timeline){
    let hash = timeline.hash
    if(timeCallback[hash]){
        timeCallback[hash].timeline.handler(timeline.percent, timeline.time, timeline.duration)
        timeCallback[hash].timeline.percent = timeline.percent
        timeCallback[hash].timeline.duration = timeline.duration
        timeCallback[hash].timeline.time = timeline.time
        delete timeCallback[hash]
    }
}

function voiceStart(){
    if(checkVersion(25)) AndroidJS.voiceStart()
    else Lampa.Noty.show("Работает только на Android TV")
}

function updateChannel(where){
    if(checkVersion(28)) AndroidJS.updateChannel(where)
}

function checkVersion(needVersion, silent=false){
    if(typeof AndroidJS !== 'undefined') {
        try {
            let current = AndroidJS.appVersion().split('-')
            let versionCode = current.pop()
            if (parseInt(versionCode, 10) >= needVersion) {
                return true
            } else {
                if(!silent)
                    Bell.push({text: 'Обновите приложение до версии ' + needVersion})
                return false
            }
        } catch (e) {
            Bell.push({text: 'Обновите приложение до версии ' + needVersion})
            return false
        }
    } else return false
}

export default {
    init,
    exit,
    openTorrent,
    openPlayer,
    playHash,
    openYoutube,
    resetDefaultPlayer,
    httpReq,
    voiceStart,
    httpCall,
    timeCall,
    updateChannel,
    openBrowser
}
