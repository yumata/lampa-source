function exit() {
    if(typeof AndroidJS !== 'undefined') AndroidJS.exit()
    else $('<a href="lampa://exit"></a>')[0].click()
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

export default {
    exit,
    openTorrent,
    openPlayer
}