let reqCallback = {}

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
                title: "[LAMPA] " + SERVER.movie.title.replace(/\s+/g, ' ').trim(),
                poster: SERVER.movie.img,
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
            title: "[LAMPA] " + SERVER.object.title.replace(/\s+/g, ' ').trim(),
            poster: SERVER.object.poster,
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
    if(checkVersion(10)) AndroidJS.openPlayer(link, JSON.stringify(data))
    else $('<a href="'+link+'"><a/>')[0].click()
}

function openYoutube(link){
    if(checkVersion(15)) AndroidJS.openYoutube(link)
    else $('<a href="'+link+'"><a/>')[0].click()
}

function resetDefaultPlayer(){
    if(checkVersion(15)) AndroidJS.clearDefaultPlayer()
}

function httpReq(data, call){
    let index = Math.floor(Math.random() * 5000)
    reqCallback[index] = call
    if(checkVersion(16)) AndroidJS.httpReq(JSON.stringify(data), index)
    else call.error({responseText: "No Native request"})
}

function httpCall(index, callback){
    let req = reqCallback[index]
    if(req[callback]){
        let resp = AndroidJS.getResp(index)
        try {
            let json = JSON.parse(resp)
            req[callback](json)
        } catch {
            req[callback](resp)
        } finally {
            delete reqCallback[index]
        }
    } else {
        //console.log("Android", "Req index not found")
    }
}

function voiceStart(){
    if(checkVersion(25)) AndroidJS.voiceStart()
    else Lampa.Noty.show("Работает только на Android TV")
}

function showInput(inputText){
    if(checkVersion(27)) AndroidJS.showInput(inputText)
}

function updateChannel(where){
    if(checkVersion(28)) AndroidJS.updateChannel(where)
}

function checkVersion(needVersion){
    if(typeof AndroidJS !== 'undefined') {
        try {
            let current = AndroidJS.appVersion().split('-')
            let versionCode = current.pop()
            if (parseInt(versionCode, 10) >= needVersion) {
                return true
            } else {
                Lampa.Noty.show("Обновите приложение.<br>Требуется версия: " + needVersion + "<br>Текущая версия: " + versionCode)
                return false
            }
        } catch (e) {
            Lampa.Noty.show("Обновите приложение.<br>Требуется версия: " + needVersion)
            return false
        }
    } else return false
}

export default {
    exit,
    openTorrent,
    openPlayer,
    playHash,
    openYoutube,
    resetDefaultPlayer,
    httpReq,
    voiceStart,
    httpCall,
    showInput,
    updateChannel
}
