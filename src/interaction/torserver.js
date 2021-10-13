import Storage from '../utils/storage'
import Utils from '../utils/math'
import Reguest from '../utils/reguest'

let network = new Reguest()

function url(){
    let u = ip()

    return u ? Utils.checkHttp(u) : u
}

function ip(){
    return Storage.get(Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url')
}

function my(success, fail){
    let data = JSON.stringify({
        action: 'list'
    })

    clear()

    network.silent(url()+'/torrents', (result)=>{
        if(result.length) success(result)
        else fail()
    }, fail, data)
}

function add(object, success, fail){
    let data = JSON.stringify({
        action: 'add',
        link: object.link,
        title: '[LAMPA] ' + object.title,
        poster: object.poster,
        data: object.data ? JSON.stringify(object.data) : '',
        save_to_db: true,
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data)
}

function hash(object, success, fail){
    let data = JSON.stringify({
        action: 'add',
        link: object.link,
        title: '[LAMPA] ' + object.title,
        poster: object.poster,
        save_to_db: Storage.get('torrserver_savedb','false'),
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data)
}

function files(hash, success, fail){
    let data = JSON.stringify({
        action: 'get',
        hash: hash
    })

    clear()

    network.timeout(2000)

    network.silent(url()+'/torrents',(json)=>{
        if(json.file_stats){
            success(json)
        }
    }, fail, data)
}

function connected(success, fail){
    clear()

    network.timeout(5000)

    network.silent(url()+'/settings',(json)=>{
        if(typeof json.CacheSize == 'undefined'){
            fail('Не удалось подтвердить версию Matrix')
        }
        else{
            success(json)
        }
    },(a,c)=>{
        fail(network.errorDecode(a,c))
    },JSON.stringify({action: 'get'}))
}

function stream(hash, id){
    return url() + '/stream?link=' + hash + '&index=' + id + '&play' +  (Storage.get('torrserver_preload', 'false') ? '&preload' : '')
}

function drop(hash, success, fail){
    let data = JSON.stringify({
        action: 'drop',
        hash: hash
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data)
}

function remove(hash, success, fail){
    let data = JSON.stringify({
        action: 'rem',
        hash: hash
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data)
}

function parse(file_path, movie){
    let path = file_path.toLowerCase()
    let data = {
        hash: '',
        season: 0,
        episode: 0,
        serial: movie.number_of_seasons ? true : false
    }

    if(/s([0-9]+)(\.)?ep?([0-9]+)|s([0-9]+)|ep?([0-9]+)/.test(path) && movie.number_of_seasons){
        let math = path.match(/s([0-9]+)(\.)?ep?([0-9]+)/)

        if(math){
            data.season  = parseInt(math[1])
            data.episode = parseInt(math[3])
        }

        if(data.season === 0){
            math = path.match(/s([0-9]+)/)

            if(math) data.season = parseInt(math[1])
        }

        if(data.episode === 0){
            math = path.match(/ep?([0-9]+)/)

            if(math) data.episode = parseInt(math[1])
        }

        if(isNaN(data.season))  data.season  = 0
        if(isNaN(data.episode)) data.episode = 0

        if(data.season && data.episode){
            data.hash = [Utils.hash(movie.original_title), data.season, data.episode].join('_')
        }
        else if(data.episode){
            data.season = 1

            data.hash = [Utils.hash(movie.original_title), data.season, data.episode].join('_')
        }
        else{
            hash = Utils.hash(file_path)
        }
    } 
    else if(movie.original_title){
        data.hash = Utils.hash(movie.original_title)
    }
    else{
        data.hash = Utils.hash(file_path)
    }

    return data
}

function clear(){
    network.clear()
}

export default {
    ip,
    my,
    add,
    url,
    hash,
    files,
    clear,
    drop,
    stream,
    remove,
    connected,
    parse
}