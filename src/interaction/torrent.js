import Reguest from '../utils/reguest'
import Storage from '../utils/storage'
import Modal from './modal'
import Controller from './controller'
import Utils from '../utils/math'
import Template from './template'
import Arrays from '../utils/arrays'
import Player from '../interaction/player'
import Timeline from '../interaction/timeline'
import Activity from '../interaction/activity'
import Torserver from '../interaction/torserver'

let network = new Reguest()

let SERVER = {}

let timers = {}

let callback

let formats = [
    'asf',
    'wmv',
    'divx',
    'avi',
    'mp4',
    'm4v',
    'mov',
    '3gp',
    '3g2',
    'mkv',
    'trp',
    'tp',
    'mts',
    'mpg',
    'mpeg',
    'dat',
    'vob',
    'rm',
    'rmvb',
    'm2ts',
    'bdmv',
    'ts'
]

function start(element){
    SERVER.object = element

    if(!Storage.field('internal_torrclient')){
        $('<a href="' + (SERVER.object.MagnetUri || SERVER.object.Link) + '"/>')[0].click()
    } 
    else if(Torserver.url()){
        loading()
        connect()
    }
    else install()
}

function open(hash, object){
    SERVER.hash   = hash
    SERVER.object = object
    SERVER.nodrop = true

    loading()
    files()
}

function loading(){
    Modal.open({
        title: '',
        html: Template.get('modal_loading'),
        size: 'large',
        mask: true,
        onBack: ()=>{
            Modal.close()

            close()
        }
    })
}

function connect(){
    network.timeout(3000)

    let ip = Torserver.ip()

    network.silent(Torserver.url()+'/settings',(json)=>{
        if(!json.CacheSize){
            let tpl = Template.get('torrent_nocheck',{
                title: 'Ошибка',
                ip: ip,
                text: 'Не удалось проверить на наличие TorrServer',
                echo: Utils.shortText(JSON.stringify(json),100)
            })

            Modal.update(tpl)

            network.clear()
        }
        else{
            hash()
        }
    },(a,c)=>{
        let tpl = Template.get('torrent_noconnect',{
            title: 'Ошибка',
            text: 'Не удалось подключиться к TorrServer',
            ip: ip,
            echo: network.errorDecode(a,c)
        })

        if(!(ip.indexOf('127.') >= 0 || ip.indexOf(':8090') == -1)){
            tpl.find('.nocorect').remove()
        }

        Modal.update(tpl)

        network.clear()
    },JSON.stringify({action: 'get'}))
}

function hash(){
    Torserver.hash({
        title: SERVER.object.title,
        link: SERVER.object.MagnetUri || SERVER.object.Link,
        poster: SERVER.object.poster
    },(json)=>{
        SERVER.hash = json.hash

        files()
    },()=>{
        let jac = Storage.field('parser_torrent_type') == 'jackett'

        let tpl = Template.get('torrent_nohash',{
            title: 'Ошибка',
            text: 'Не удалось получить HASH',
            url: SERVER.object.MagnetUri || SERVER.object.Link
        })

        if(jac) tpl.find('.is--torlook').remove()
        else    tpl.find('.is--jackett').remove()

        Modal.update(tpl)
    })
}

function files(){
    let repeat = 0;

    timers.files = setInterval(function(){
        repeat++;

        Torserver.files(SERVER.hash,(json)=>{
            if(json.file_stats){
                clearInterval(timers.files)

                show(json.file_stats)
            }
        })

        if(repeat >= 45){
            Modal.update(Template.get('error',{title: 'Ошибка',text: 'Время ожидания истекло'}))

            Torserver.clear()
            Torserver.drop(SERVER.hash)
        }
    },2000)
}

function install(){
    Modal.open({
        title: 'Необходим TorrServer',
        html: $('<div class="about"><div>Для просмотра торрента онлайн, необходимо установить TorrServer. Подробнее что такое TorrServer и как установить, вы можете найти на сайте https://github.com/YouROK/TorrServer</div></div>'),
        onBack: ()=>{
            Modal.close()

            Controller.toggle('content')
        }
    })
}

function show(files){
    let html  = $('<div class="torrent-files"></div>')
    let plays = files.filter((a)=>{
        let exe = a.path.split('.').pop().toLowerCase()

        return formats.indexOf(exe) >= 0
    })

    let playlist = []
    let active   = Activity.active()

    plays.forEach(element => {
        let hash = Timeline.hash(element, active.movie || SERVER.object || {}),
            view = Timeline.view(hash)

        Arrays.extend(element, {
            title: Utils.pathToNormalTitle(element.path),
            size: Utils.bytesToSize(element.length),
            url: Torserver.stream(SERVER.hash, element.id),
            timeline: view
        })

        playlist.push(element)

        let item = Template.get('torrent_file',element)

        item.append(Timeline.render(view))
        
        item.on('hover:enter',()=>{
            Player.play({
                url: element.url,
                title: element.title,
                path: element.path,
                timeline: view
            })

            Player.callback(()=>{
                Controller.toggle('modal')
            })

            Player.playlist(playlist)

            Player.stat(element.url)
        })

        html.append(item)
    })

    if(plays.length == 0) html = Template.get('error',{title: 'Пусто',text: 'Не удалось извлечь подходящие файлы'})
    else Modal.title('Файлы')

    Modal.update(html)

    if(callback){
        callback()

        callback = false
    }
}

function opened(call){
    callback = call
}

function close(){
    network.clear()

    if(!SERVER.nodrop) Torserver.drop(SERVER.hash)

    clearInterval(timers.files)

    Controller.toggle('content')

    SERVER = {}
}

export default {
    start,
    open,
    opened
}
