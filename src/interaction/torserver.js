import Storage from '../core/storage/storage'
import Utils from '../utils/utils'
import Request from '../utils/reguest'
import Template from './template'
import Controller from '../core/controller'
import Modal from './modal'
import Lang from '../core/lang'
import EpisodeParser from '../utils/episodes_parser'
import Arrays from '../utils/arrays'

let network = new Request()

function url(){
    let u = ip()

    return u ? Utils.checkEmptyUrl(u) : u
}

function ip(){
    let one = Storage.get('torrserver_url')
    let two = Storage.get('torrserver_url_two')

    return Storage.field('torrserver_use_link') == 'two' ? two || one : one || two
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

function cache(hash, success, fail){
    let data = JSON.stringify({
        action: 'get',
        hash: hash
    })

    network.silent(url()+'/cache', success, fail, data)
}

function add(object, success, fail){
    let send_data = object.data ? Arrays.clone(object.data) : false

    if(send_data && send_data.movie) send_data.movie = Utils.clearCard(send_data.movie)

    let json = {
        action: 'add',
        link: object.link,
        title: '[LAMPA] ' + ((object.title)+'').replace('??', '?'),
        poster: object.poster,
        data: send_data ? JSON.stringify(send_data) : '',
        save_to_db: true,
    }

    console.log('Torserver', 'send data', send_data)
    console.log('Torserver', 'add', json)

    let data = JSON.stringify(json)

    clear()

    network.silent(url()+'/torrents', success, fail, data)
}

function hash(object, success, fail){
    let send_data = object.data ? Arrays.clone(object.data) : false

    if(send_data && send_data.movie) send_data.movie = Utils.clearCard(send_data.movie)

    let json = {
        action: 'add',
        link: object.link,
        title: '[LAMPA] ' + ((object.title)+'').replace('??', '?'),
        poster: object.poster,
        data: send_data ? JSON.stringify(send_data) : '',
        save_to_db: Storage.get('torrserver_savedb','false'),
    }

    console.log('Torserver', 'send data', send_data)
    console.log('Torserver', 'hash', json)

    let data = JSON.stringify(json)

    clear()

    network.silent(url()+'/torrents', success, (a,c)=>{
        fail(network.errorDecode(a,c))
    }, data)
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
            fail(Lang.translate('torrent_error_nomatrix'))
        }
        else{
            success(json)
        }
    },(a,c)=>{
        fail(network.errorDecode(a,c))
    },JSON.stringify({action: 'get'}))
}

function stream(path, hash, id){
    return url() + '/stream/'+ encodeURIComponent(path.split('\\').pop().split('/').pop()) +'?link=' + hash + '&index=' + id + '&' + (Storage.field('torrserver_preload') ? 'preload' : 'play')
}

function drop(hash, success, fail){
    let data = JSON.stringify({
        action: 'drop',
        hash: hash
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data, {dataType: 'text'})
}

function remove(hash, success, fail){
    let data = JSON.stringify({
        action: 'rem',
        hash: hash
    })

    clear()

    network.silent(url()+'/torrents', success, fail, data, {dataType: 'text'})
}

function parse(data){
    let result = EpisodeParser.parse(data)
        result.hash = Utils.hash(result.hash_string)

    return result
}

function clearFileName(files){
    let combo = []

    files.forEach(element => {
        let spl = element.path.split('/')
        let nam = spl[spl.length - 1].split('.')
        
        if(nam.length > 1) nam.pop()
        
        nam = nam.join('.')
        
        element.path_human = Utils.pathToNormalTitle(nam, false).trim()

        if(spl.length > 1){
            spl.pop()
            
            element.folder_name = Utils.pathToNormalTitle(spl.pop(), false).trim()
        }
    })

    if(files.length > 1){

        files.forEach(element => {
            let spl = element.path_human.split(' ')
            
            for (let i = spl.length - 1; i >= 0; i--) {
                let com = spl.join(' ')

                if(combo.indexOf(com) == -1) combo.push(com)

                spl.pop()
            }
        })

        combo.sort((a,b)=>{
            return a.length > b.length ? -1 : a.length < b.length ? 1 : 0
        })

        for (let i = combo.length - 1; i >= 0; i--) {
            let com = combo[i]
            let len = files.filter(f=>f.path_human.slice(0, com.length) == com).length
            
            if(len < files.length) Arrays.remove(combo, com)
        }

        files.forEach(element => {
            for(let i = 0; i < combo.length; i++){
                let com = combo[i]
                let inx = element.path_human.indexOf(com)

                if(inx >= 0 && com !== element.path_human){
                    element.path_human = element.path_human.slice(com.length).trim()

                    break
                }
            }
        })
    }

    return files
}

function clear(){
    network.clear()
}

function error(){
    let temp = Template.get('torrent_error',{ip: ip()})
    let list = temp.find('.torrent-checklist__list > li')
    let info = temp.find('.torrent-checklist__info > div')
    let next = temp.find('.torrent-checklist__next-step')
    let prog = temp.find('.torrent-checklist__progress-bar > div')
    let comp = temp.find('.torrent-checklist__progress-steps')
    let btn  = temp.find('.selector')

    let position = -2

    function makeStep(){
        position++

        list.slice(0, position+1).addClass('wait')

        let total = list.length

        comp.text(Lang.translate('torrent_error_made') + ' ' + Math.max(0,position) + ' '+Lang.translate('torrent_error_from')+' ' + total)

        if(position > list.length){
            Modal.close()

            Controller.toggle('content')
        }
        else if(position >= 0){
            info.addClass('hide')
            info.eq(position).removeClass('hide')

            let next_step = list.eq(position+1)

            prog.css('width', Math.round(position / total * 100) + '%')

            list.slice(0, position).addClass('check')

            btn.text(position < total ? Lang.translate('torrent_error_next')  : Lang.translate('torrent_error_complite'))

            next.text(next_step.length ? '- '+next_step.text() : '')
        }
    }

    makeStep()

    btn.on('hover:enter',()=>{
        makeStep()
    })

    Modal.title(Lang.translate('torrent_error_connect'))
    Modal.update(temp)

    Controller.add('modal',{
        invisible: true,
        toggle: ()=>{
            Controller.collectionSet(temp)
            Controller.collectionFocus(false,temp)
        },
        back: ()=>{
            Modal.close()

            Controller.toggle('content')
        }
    })

    Controller.toggle('modal')
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
    parse,
    error,
    cache,
    clearFileName
}
