let reqCallback = {}

function exit() {
    if(typeof AndroidJS !== 'undefined') AndroidJS.exit()
    else $('<a href="lampa://exit"></a>')[0].click()
}

function playHash(SERVER){
    let magnet = "magnet:?xt=urn:btih:"+SERVER.hash
    let intentExtra = ""
    if(SERVER.movie){
        intentExtra = {
            title: "[LAMPA] " + SERVER.movie.title,
            poster: SERVER.movie.img,
            data: {
                lampa: true,
                movie: SERVER.movie
            }
        }
    }

    AndroidJS.openTorrentLink(magnet, JSON.stringify(intentExtra))
}

function openTorrent(SERVER){
    if(typeof AndroidJS !== 'undefined'){
        let intentExtra = {
            title: "[LAMPA]" + SERVER.object.title,
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
    if(typeof AndroidJS !== 'undefined') AndroidJS.openPlayer(link, JSON.stringify(data))
    else $('<a href="'+link+'"><a/>')[0].click()
}

function openYoutube(link){
    AndroidJS.openYoutube(link)
}

function resetDefaultPlayer(){
    AndroidJS.clearDefaultPlayer()
}

function httpReq(data, call){
    let index = Math.floor(Math.random() * 5000)
    reqCallback[index] = call
    AndroidJS.httpReq(JSON.stringify(data), index)
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

export default {
    exit,
    openTorrent,
    openPlayer,
    playHash,
    openYoutube,
    resetDefaultPlayer,
    httpReq,
    httpCall
}
