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

let network = new Reguest()

let SERVER = {}

let timers = {}

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
    } else if(Storage.get('torrserver_url')){
        SERVER.url = Utils.checkHttp(Storage.get(Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url'))

        loading()
        connect()
        hash()
    }
    else install()
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

    let ip = Storage.get('torrserver_url')

    network.silent(SERVER.url+'/settings',(json)=>{
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
    let data = {
        action: 'add',
        link: SERVER.object.MagnetUri || SERVER.object.Link,
        title: '[LAMPA] ' + SERVER.object.title,
        poster: SERVER.object.poster,
        save_to_db: Storage.get('torrserver_savedb','false'),
    }

    network.timeout(20000)

    network.silent(SERVER.url+'/torrents',(json)=>{
        SERVER.hash = json.hash

        files()
    },()=>{
        let jac = Storage.field('parser_torrent_type') == 'jackett'

        let tpl = Template.get('torrent_nohash',{
            title: 'Ошибка',
            text: 'Не удалось получить HASH',
            url: data.link
        })

        if(jac) tpl.find('.is--torlook').remove()
        else    tpl.find('.is--jackett').remove()

        Modal.update(tpl)

        network.clear()
    },JSON.stringify(data))
}

function files(){
    let data = JSON.stringify({
        action: 'get',
        hash: SERVER.hash
    })

    let repeat = 0;

    timers.files = setInterval(function(){
        repeat++;

        network.clear()

        network.timeout(2000)

        network.silent(SERVER.url+'/torrents',(json)=>{
            if(json.file_stats){
                clearInterval(timers.files)

                show(json.file_stats)
            }
        },false,data)

        if(repeat >= 45){
            Modal.update(Template.get('error',{title: 'Ошибка',text: 'Время ожидания истекло'}))

            network.clear()
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
        let hash = Timeline.hash(element, active.movie),
            view = Timeline.view(hash)

        Arrays.extend(element, {
            title: Utils.pathToNormalTitle(element.path),
            size: Utils.bytesToSize(element.length),
            url: SERVER.url + '/stream?link=' + SERVER.hash + '&index=' + element.id + '&play' +  (Storage.get('torrserver_preload', 'false') ? '&preload' : ''),
            timeline: view
        })

        playlist.push(element)

        let item = Template.get('torrent_file',element)

        item.append(Timeline.render(view))
        
        item.on('hover:enter',()=>{
            console.log('T',view)
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
}

function close(){
    network.clear()

    clearInterval(timers.files)

    Controller.toggle('content')
}

export default {
    start
}
