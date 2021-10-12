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

function stream(hash, id){
    return url() + '/stream?link=' + hash + '&index=' + id + '&play' +  (Storage.get('torrserver_preload', 'false') ? '&preload' : '')
}

function drop(hash, success, fail){
    let data = JSON.stringify({
        action: 'rem',
        hash: hash
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data)
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
    stream
}