import Controller from '../core/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Background from '../interaction/background'
import Activity from '../interaction/activity/activity'
import Empty from '../interaction/empty/empty'
import Lang from '../core/lang'
import Template from '../interaction/template'
import Api from '../core/api/api'
import Manifest from '../core/manifest'
import Utils from '../utils/utils'

/**
 * Компонент "Лента"
 * @param {*} object 
 */
function Feed(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step: 250,end_ratio:2})
    let html    = document.createElement('div')
    let feed    = []
    let last
    
    
    this.create = function(){
        this.activity.loader(true)

        network.silent(Utils.protocol() + Manifest.cub_domain + '/api/feed/all',this.build.bind(this),()=>{
            let empty = new Empty()

            html.append(empty.render(true))

            this.start = empty.start.bind(empty)

            this.activity.loader(false)

            this.activity.toggle()
        })

        return this.render()
    }

    this.next = function(){
        if(object.page < 15){

            object.page++

            let offset = object.page - 1

            this.append(feed.slice(20 * offset,20 * offset + 20), true)
        }
    }

    this.loadImg = function(box, src){
        let img = box.find('img')

        img.onload = ()=>{
            box.addClass('loaded')
        }

        img.onerror = ()=>{
            img.src = './img/img_broken.svg'
        }

        img.src = src
    }

    this.append = function(data, append){
        data.forEach(element => {
            let item = Template.js(element.type == 'episode' || element.type == 'trailer' ? 'feed_episode' : 'feed_item')

            item.addClass('feed-item--' + element.type)

            let type = {
                top: Lampa.Lang.translate('title_in_top'),
                now_playing: Lampa.Lang.translate('title_now_watch'),
                uhd: Lampa.Lang.translate('title_in_high_quality'),
                popular: Lampa.Lang.translate('title_popular'),
                trailer: Lampa.Lang.translate('title_trailers'),
                episode: Lampa.Lang.translate('card_new_episode'),
                now: Lampa.Lang.translate('title_new')
            }

            let sity = element.data.countries || []
            let year = ((element.data.release_date || element.data.first_air_date) + '').slice(0,4)
            let info = []
            let tags = []

            info.push(year + (sity.length ? ' - ' + sity.slice(0,2).join(', ') : ''))

            if(element.data.imdb_rating && parseFloat(element.data.imdb_rating) > 0){
                info.push('IMDB ' + element.data.imdb_rating)
            }
    
            if(element.data.kp_rating && parseFloat(element.data.kp_rating) > 0){
                info.push('KP ' + element.data.kp_rating)
            }

            if(element.type == 'episode'){
                tags = element.hash.split(';').map(a=>{
                    return Lang.translate(a.slice(0,1) == 's' ? 'torrent_serial_season' : 'torrent_serial_episode') + ' - ' + a.slice(1)
                })
            }
            else if(element.data.genres) tags.push(element.data.genres.join(', '))
            else if(element.data.genre_ids){
                tags.push(Api.sources.tmdb.getGenresNameFromIds(element.card_type, element.data.genre_ids).join(', '))
            }

            item.find('.feed-item__label').addClass('feed-item__label--' + element.type).text(type[element.type])
            item.find('.feed-item__title').text(element.data.title || element.data.name)
            item.find('.feed-item__info').text(info.join(' / '))
            item.find('.feed-item__descr').text(element.data.overview || '')
            item.find('.feed-item__tags').text(tags.join(' / '))

            this.loadImg(item.find('.feed-item__poster-box'), element.data.poster_path ? Api.img(element.data.poster_path, 'w500') : './img/img_broken.svg')

            let image = item.find('.feed-item__image-box')

            if(image){
                this.loadImg(image, Api.img(element.type == 'episode' ? element.data.episode.still_path : element.data.backdrop_path ,'w780'))
            }

            scroll.append(item)

            let btn_watch = document.createElement('div')
                btn_watch.addClass('simple-button selector')
                btn_watch.text(Lang.translate('title_watch'))

                btn_watch.on('hover:focus',()=>{
                    last = btn_watch

                    scroll.update(item)

                    Background.change(Api.img(element.data.poster_path, 'w500'))
                })

                btn_watch.on('hover:enter',()=>{
                    Activity.push({
                        url: '',
                        component: 'full',
                        id: element.card_id,
                        method: element.card_type,
                        card: element.data,
                        source: element.data.source || 'tmdb'
                    })
                })

            item.find('.feed-item__buttons').append(btn_watch)

            if(append) Controller.collectionAppend(btn_watch)
        })
    }

    this.build = function(data){
        feed = data.result

        html.addClass('feed')

        let head = Template.js('feed_head')

        head.find('.feed-head__title').text(Lang.translate('lampa_movie_title'))
        head.find('.feed-head__info').html(Lang.translate('lampa_movie_descr'))

        head.on('hover:focus',scroll.update.bind(scroll, head))

        scroll.minus()

        scroll.onWheel = (step)=>{
            Navigator.move(step > 0 ? 'down' : 'up')
        }

        scroll.onEnd = this.next.bind(this)

        scroll.append(head)

        this.append(feed.slice(0,20))

        html.append(scroll.render(true))

        this.activity.loader(false)

        this.activity.toggle()
    }


    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render(true))
                Controller.collectionFocus(last || false,scroll.render(true))
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        network.clear()

        scroll.destroy()

        html.remove()
    }
}

export default Feed