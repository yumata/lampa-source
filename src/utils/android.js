
function exit() {
    AndroidJS.exit()
}

function openTorrent(SERVER){
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

function openPlayer(link, data){
    AndroidJS.openPlayer(link, JSON.stringify(data))
}

export default {
    exit,
    openTorrent,
    openPlayer
}