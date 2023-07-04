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
import Noty from './noty'
import Account from '../utils/account'
import Helper from './helper'
import Lang from '../utils/lang'
import subsrt from "../utils/subsrt/subsrt";

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
        //Torserver.error()

        let jac = Storage.field('parser_torrent_type') == 'jackett'

        let tpl = Template.get('torrent_nohash',{
            title: Lang.translate('title_error'),
            text: Lang.translate('torrent_parser_no_hash'),
            url: SERVER.object.MagnetUri || SERVER.object.Link,
            echo: echo
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
            Modal.update(Template.get('error',{title: Lang.translate('title_error'),text: Lang.translate('torrent_parser_timeout')}))

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
    let active   = Activity.active(),
        movie    = active.movie || SERVER.movie || {}

    let plays = Torserver.clearFileName(files.filter((a)=>{
        let exe = a.path.split('.').pop().toLowerCase()

        return formats.indexOf(exe) >= 0
    }))

    let seasons  = []

    plays.forEach(element => {
        let info = Torserver.parse({
            movie: movie,
            files: plays,
            filename: element.path_human,
            path:  element.path
        })
        
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
    const supportedFormats = subsrt.list()

    let subtitles = files.filter((a)=>{
        let short = a.path.split('/').pop()
        let issub = supportedFormats.indexOf(a.path.split('.').pop().toLowerCase()) >= 0

        return short.indexOf(name) >= 0 && issub
    }).map(a=>{
        index++
        const segments = a.path.split('/')
        segments.pop() // drop filename
        const label = segments.slice(1).join(' - ') // drop initial folder and concat the rest

        return {
            label: label,
            url: Torserver.stream(a.path, SERVER.hash, a.id),
            index: index
        }
    })

    return subtitles.length ? subtitles : false
}

function list(items, params){
    let html     = $('<div class="torrent-files"></div>')
    let playlist = []
    let scroll_to_element

    Lampa.Listener.send('torrent_file',{type:'list_open',items})

    items.forEach(element => {
        let exe  = element.path.split('.').pop().toLowerCase()
        let info = Torserver.parse({
            movie: params.movie,
            files: items,
            filename: element.path_human,
            path:  element.path,
            is_file: formats_individual.indexOf(exe) >= 0,
        })
        let view = Timeline.view(info.hash)
        let item

        let viewed = function(viewing){
            Account.torrentViewed({
                object: SERVER.object,
                viewing,
                card: SERVER.movie
            })
        }

        Arrays.extend(element, {
            season: info.season,
            episode: info.episode,
            title: element.path_human,
            size: Utils.bytesToSize(element.length),
            url: Torserver.stream(element.path, SERVER.hash, element.id),
            torrent_hash: SERVER.hash,
            timeline: view,
            air_date: '--',
            img: './img/img_broken.svg',
            exe: exe,
            viewed
        })

        if(params.seasons){
            let episodes = params.seasons[info.season]

            element.title = (info.episode ? info.episode + ' / ' : '') + element.path_human
            element.fname = element.title

            if(episodes){
                let episode = episodes.episodes.filter((a)=>{
                    return a.episode_number == info.episode
                })[0]

                if(episode){
                    element.title    = info.episode + ' / ' +episode.name
                    element.air_date = Utils.parseTime(episode.air_date).full
                    element.fname    = episode.name

                    if(episode.still_path) element.img  = Api.img(episode.still_path)
                    else if(episode.img)   element.img  = episode.img
                }
            }

            if(info.episode){
                item = Template.get('torrent_file_serial', element)

                item.find('.torrent-serial__content').append(Timeline.render(view))
            }
            else{
                item = Template.get('torrent_file', element)

                item.append(Timeline.render(view))
            }
        }
        else if(items.length == 1 && params.movie && !params.movie.name){
            element.fname = params.movie.title

            if(params.movie.backdrop_path) element.img = Api.img(params.movie.backdrop_path)

            item = Template.get('torrent_file_serial', element)

            item.find('.torrent-serial__line').empty().text(params.movie.tagline || '')

            item.find('.torrent-serial__episode').remove()

            item.find('.torrent-serial__content').append(Timeline.render(view))
        }
        else{
            item = Template.get('torrent_file', element)

            item.append(Timeline.render(view))

            if(params.movie.title) element.title = params.movie.title
        }

        item[0].visibility = 'hidden'

        if(view.percent > 0) scroll_to_element = item

        element.subtitles = parseSubs(element.path, params.files)

        element.title = (element.fname || element.title).replace(/<[^>]*>?/gm, '')

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

            Lampa.Listener.send('torrent_file',{type:'onenter',element,item,items})
        }).on('hover:long',()=>{
            let enabled = Controller.enabled().name

            let menu = [
                {
                    title: Lang.translate('time_reset'),
                    timeclear: true
                }
            ]

            if(Platform.is('webos')){
                menu.push({
                    title: Lang.translate('player_lauch') + ' - WebOS',
                    player: 'webos'
                })
            }
            
            if(Platform.is('android')){
                menu.push({
                    title: Lang.translate('player_lauch') + ' - Android',
                    player: 'android'
                })
            }
            
            menu.push({
                title: Lang.translate('player_lauch') + ' - Lampa',
                player: 'lampa'
            })

            if(!Platform.tv()){
                menu.push({
                    title: Lang.translate('copy_link'),
                    link: true
                })
            }

            Lampa.Listener.send('torrent_file',{type:'onlong',element,item,menu,items})

            Select.show({
                title: Lang.translate('title_action'),
                items: menu,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onSelect: (a)=>{
                    
                    if(a.timeclear){
                        view.percent  = 0
                        view.time     = 0
                        view.duration = 0

                        element.timeline = view
                        
                        Timeline.update(view)
                    }

                    if(a.link){
                        Utils.copyTextToClipboard(element.url.replace('&preload','&play'),()=>{
                            Noty.show(Lang.translate('copy_secuses'))
                        },()=>{
                            Noty.show(Lang.translate('copy_error'))
                        })
                    }

                    Controller.toggle(enabled)

                    if(a.player){
                        Player.runas(a.player)

                        item.trigger('hover:enter')
                    }
                }
            })
        }).on('hover:focus',()=>{
            Lampa.Listener.send('torrent_file',{type:'onfocus',element,item,items})

            Helper.show('torrents_view',Lang.translate('helper_torrents_view'),item)
        }).on('visible',()=>{
            let img = item.find('img')

            img[0].onload = ()=>{
                img.addClass('loaded')
            }

            img[0].src = img.attr('data-src')
        })

        html.append(item)

        Lampa.Listener.send('torrent_file',{type:'render',element,item,items})
    })

    if(items.length == 0) html = Template.get('error',{title: Lang.translate('empty_title'),text: Lang.translate('torrent_parser_nofiles')})
    else Modal.title(Lang.translate('title_files'))

    Modal.update(html)

    if(scroll_to_element) Controller.collectionFocus(scroll_to_element,Modal.scroll().render())
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

    Lampa.Listener.send('torrent_file',{type:'list_close'})
}

export default {
    start,
    open,
    opened,
    back
}
