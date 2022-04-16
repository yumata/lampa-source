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
import Api from './api'
import Android from '../utils/android'
import Favorite from '../utils/favorite'
import Platform from '../utils/platform'
import Select from './select'

let SERVER = {}

let timers = {}

let callback
let callback_back

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
    'ts'
]

let formats_individual = ['vob', 'm2ts']

function start(element, movie){
    SERVER.object = element

    if(movie) SERVER.movie  = movie

    if(!Storage.field('internal_torrclient')){
        Android.openTorrent(SERVER)

        if(movie && movie.id) Favorite.add('history', movie, 100)

        if(callback) callback()
    } 
    else if(Torserver.url()){
        loading()
        connect()
    }
    else install()
}

function open(hash, movie){
    SERVER.hash = hash

    if(movie) SERVER.movie = movie

    if(!Storage.field('internal_torrclient')){
        Android.playHash(SERVER)

        if(callback) callback()
    } 
    else if(Torserver.url()){
        loading()
        files()
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
    Torserver.connected(()=>{
        hash()
    },(echo)=>{
        Torserver.error()

        /*
        let ip = Torserver.ip()

        let tpl = Template.get('torrent_noconnect',{
            title: 'Ошибка',
            text: 'Не удалось подключиться к TorrServer',
            ip: ip,
            href: window.location.href,
            echo: echo
        })

        if(!(ip.indexOf('127.') >= 0 || ip.indexOf(':8090') == -1)){
            tpl.find('.nocorect').remove()
        }

        Modal.update(tpl)
        */
    })
}

function hash(){
    Torserver.hash({
        title: SERVER.object.title,
        link: SERVER.object.MagnetUri || SERVER.object.Link,
        poster: SERVER.object.poster,
        data:{
            lampa: true,
            movie: SERVER.movie
        }
    },(json)=>{
        SERVER.hash = json.hash

        files()
    },(echo)=>{
        Torserver.error()
        
        /*
        let jac = Storage.field('parser_torrent_type') == 'jackett'

        let tpl = Template.get('torrent_nohash',{
            title: 'Ошибка',
            text: 'Не удалось получить HASH',
            url: SERVER.object.MagnetUri || SERVER.object.Link,
            echo: echo
        })

        if(jac) tpl.find('.is--torlook').remove()
        else    tpl.find('.is--jackett').remove()

        Modal.update(tpl)
        */
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
        title: '',
        html: Template.get('torrent_install',{}),
        size: 'large',
        onBack: ()=>{
            Modal.close()

            Controller.toggle('content')
        }
    })
}

function show(files){
    let plays = files.filter((a)=>{
        let exe = a.path.split('.').pop().toLowerCase()

        return formats.indexOf(exe) >= 0
    })

    let active   = Activity.active(),
        movie    = active.movie || SERVER.movie || {}

    let seasons  = []

    plays.forEach(element => {
        let info = Torserver.parse(element.path, movie)

        if(info.serial && info.season && seasons.indexOf(info.season) == -1){
            seasons.push(info.season)
        }
    })

    if(seasons.length){
        Api.seasons(movie, seasons, (data)=>{
            list(plays, {
                movie: movie,
                seasons: data,
                files: files
            })
        })
    }
    else{
        list(plays, {
            movie: movie,
            files: files
        })
    }
}

function parseSubs(path, files){
    let name  = path.split('/').pop().split('.').slice(0,-1).join('.')
    let index = -1

    let subtitles = files.filter((a)=>{
        let short = a.path.split('/').pop()
        let issub = ['srt','vtt'].indexOf(a.path.split('.').pop().toLowerCase()) >= 0

        return short.indexOf(name) >= 0 && issub
    }).map(a=>{
        index++

        return {
            label: '',
            url: Torserver.stream(a.path, SERVER.hash, a.id),
            index: index
        }
    })

    return subtitles.length ? subtitles : false
}

function list(items, params){
    let html     = $('<div class="torrent-files"></div>')
    let playlist = []

    items.forEach(element => {
        let exe  = element.path.split('.').pop().toLowerCase()
        let info = Torserver.parse(element.path, params.movie, formats_individual.indexOf(exe) >= 0)
        let view = Timeline.view(info.hash)
        let item

        Arrays.extend(element, {
            season: info.season,
            episode: info.episode,
            title: Utils.pathToNormalTitle(element.path),
            size: Utils.bytesToSize(element.length),
            url: Torserver.stream(element.path, SERVER.hash, element.id),
            timeline: view,
            air_date: '--',
            img: './img/img_broken.svg',
            exe: exe
        })

        if(params.seasons){
            let episodes = params.seasons[info.season]

            element.title = info.episode + ' / ' + Utils.pathToNormalTitle(element.path, false)
            element.fname = element.title

            if(episodes){
                let episode = episodes.episodes.filter((a)=>{
                    return a.episode_number == info.episode
                })[0]

                if(episode){
                    element.title    = info.episode + ' / ' +episode.name
                    element.air_date = episode.air_date
                    element.fname    = episode.name

                    if(episode.still_path) element.img  = Api.img(episode.still_path)
                    else if(episode.img)   element.img  = episode.img
                }
            }

            item = Template.get('torrent_file_serial', element)
        }
        else{
            item = Template.get('torrent_file', element)

            if(params.movie.title) element.title = params.movie.title
        }

        item.append(Timeline.render(view))

        element.subtitles = parseSubs(element.path, params.files)

        playlist.push(element)
        
        item.on('hover:enter',()=>{
            if(params.movie.id) Favorite.add('history', params.movie, 100)

            if (Platform.is('android') && playlist.length > 1){
                let trim_playlist = []

                playlist.forEach((elem)=>{
                    trim_playlist.push({
                        title: elem.title,
                        url: elem.url,
                        timeline: elem.timeline
                    })
                })

                element.playlist = trim_playlist
            }

            Player.play(element)

            Player.callback(()=>{
                Controller.toggle('modal')
            })

            Player.playlist(playlist)

            Player.stat(element.url)

            if(callback){
                callback()
        
                callback = false
            }
        }).on('hover:long',()=>{
            let enabled = Controller.enabled().name

            let menu = [
                {
                    title: 'Сбросить таймкод',
                    timeclear: true
                }
            ]

            if(Platform.is('webos')){
                menu.push({
                    title: 'Запустить плеер - Webos',
                    player: 'webos'
                })
            }
            
            if(Platform.is('android')){
                menu.push({
                    title: 'Запустить плеер - Android',
                    player: 'android'
                })
            }
            
            menu.push({
                title: 'Запустить плеер - Lampa',
                player: 'lampa'
            })

            Select.show({
                title: 'Действие',
                items: menu,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onSelect: (a)=>{
                    
                    if(a.timeclear){
                        view.percent  = 0
                        view.time     = 0
                        view.duration = 0
                        
                        Timeline.update(view)
                    }

                    Controller.toggle(enabled)

                    if(a.player){
                        Player.runas(a.player)

                        item.trigger('hover:enter')
                    }
                }
            })
        })

        html.append(item)
    })

    if(items.length == 0) html = Template.get('error',{title: 'Пусто',text: 'Не удалось извлечь подходящие файлы'})
    else Modal.title('Файлы')

    Modal.update(html)
}

function opened(call){
    callback = call
}

function back(call){
    callback_back = call
}

function close(){
    Torserver.drop(SERVER.hash)

    Torserver.clear()

    clearInterval(timers.files)

    if(callback_back){
        callback_back()
    }
    else{
        Controller.toggle('content')
    }
    
    callback_back = false

    SERVER = {}
}

export default {
    start,
    open,
    opened,
    back
}
