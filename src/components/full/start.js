import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Select from '../../interaction/select'
import Utils from '../../utils/math'
import Api from '../../interaction/api'
import YouTube from '../../interaction/youtube'
import Arrays from '../../utils/arrays'
import Favorite from '../../utils/favorite'
import Activity from '../../interaction/activity'
import Storage from '../../utils/storage'
import Background from '../../interaction/background'
import Player from '../../interaction/player'
import Android from "../../utils/android";
import Platform from "../../utils/platform";
import Scroll from '../../interaction/scroll'
import Lang from '../../utils/lang'
import VideoQuality from '../../utils/video_quality'
import Event from '../../utils/event'
import Noty from '../../interaction/noty'
import Account from '../../utils/account'

function create(data, params = {}){
    let html
    let last
    let tbtn
    let follow = function(e){
        if(e.name == 'parser_use'){
            let status = Storage.get('parser_use')

            tbtn.toggleClass('selector',status).toggleClass('hide',!status)
        }
    }

    let buttons_scroll = new Scroll({horizontal: true, nopadding: false})
    let load_images    = {
        poster: {},
        background: {}
    }

    let event = new Event()

    Arrays.extend(data.movie,{
        title: data.movie.name,
        original_title: data.movie.original_name,
        runtime: 0,
        img: data.movie.poster_path ? Api.img(data.movie.poster_path, Storage.field('poster_size')).replace(/\/w200/,'/w500') : 'img/img_broken.svg'
    })

    this.create = function(){
        let genres = (data.movie.genres || ['---']).slice(0,3).map((a)=>{
            return Utils.capitalizeFirstLetter(a.name)
        }).join(', ')

        html = Template.get('full_start',{
            title: data.movie.title,
            original_title: data.movie.original_title,
            descr: Utils.substr(data.movie.overview || Lang.translate('full_notext'), 420),
            time: Utils.secondsToTime(data.movie.runtime * 60,true),
            genres: Utils.substr(genres,30),
            r_themovie: parseFloat((data.movie.vote_average || 0) +'').toFixed(1),
            seasons: Utils.countSeasons(data.movie),
            episodes: data.movie.number_of_episodes
        })

        let year    = ((data.movie.release_date || data.movie.first_air_date) + '').slice(0,4)
        let quality = !data.movie.first_air_date ? VideoQuality.get(data.movie) : false

        if(year){
            html.find('.tag--year').removeClass('hide').find('> div').text(year)
        }

        if(quality){
            html.find('.tag--quality').removeClass('hide').find('> div').text(quality)
        }

        if(data.movie.number_of_seasons){
            html.find('.is--serial').removeClass('hide')
        }

        if(data.movie.imdb_rating){
            html.find('.rate--imdb').removeClass('hide').find('> div').eq(0).text(data.movie.imdb_rating)
        }

        if(data.movie.kp_rating){
            html.find('.rate--kp').removeClass('hide').find('> div').eq(0).text(data.movie.kp_rating)
        }

        if(!(data.movie.source == 'tmdb' || data.movie.source == 'cub')) html.find('.info__rate').eq(0).find('> div').text(data.movie.source.toUpperCase())
        else if(data.movie.number_of_seasons){
            html.find('.icon--subscribe').removeClass('hide')
        }

        $('.full-start__buttons-scroll',html).append(buttons_scroll.render())

        buttons_scroll.append($('.full-start__buttons',html))

        if(!data.movie.runtime) $('.tag--time',html).remove()

        if(data.movie.next_episode_to_air){
            let air = new Date(data.movie.next_episode_to_air.air_date)
            let now = Date.now()

            let day = Math.round((air.getTime() - now)/(24*60*60*1000))

            if(day > 0) $('.tag--episode',html).removeClass('hide').find('div').text(Lang.translate('full_next_episode')+': ' + Utils.parseTime(data.movie.next_episode_to_air.air_date).short + ' / '+Lang.translate('full_episode_days_left')+': ' + day)
        }

        tbtn = html.find('.view--torrent')

        tbtn.on('hover:enter',()=>{
            let year = ((data.movie.first_air_date || data.movie.release_date || '0000') + '').slice(0,4)
            let combinations = {
                'df': data.movie.original_title,
                'df_year': data.movie.original_title + ' ' + year,
                'df_lg': data.movie.original_title + ' ' + data.movie.title,
                'df_lg_year': data.movie.original_title + ' ' + data.movie.title + ' ' + year,

                'lg': data.movie.title,
                'lg_year': data.movie.title + ' ' + year,
                'lg_df': data.movie.title + ' ' + data.movie.original_title,
                'lg_df_year': data.movie.title + ' ' + data.movie.original_title + ' ' + year,
            }

            Activity.push({
                url: '',
                title: Lang.translate('title_torrents'),
                component: 'torrents',
                search: combinations[Storage.field('parse_lang')],
                search_one: data.movie.title,
                search_two: data.movie.original_title,
                movie: data.movie,
                page: 1
            })
        })

        html.find('.info__icon').not('[data-type="subscribe"]').on('hover:enter',(e)=>{
            let type = $(e.target).data('type')

            params.object.card        = data.movie
            params.object.card.source = params.object.source

            Favorite.toggle(type, params.object.card)

            this.favorite()
        })

        if(data.videos && data.videos.results.length){
            html.find('.view--trailer').on('hover:enter',()=>{
                let items = []

                data.videos.results.forEach(element => {
                    items.push({
                        title: element.name,
                        subtitle: element.official ? Lang.translate('full_trailer_official') : Lang.translate('full_trailer_no_official'),
                        id: element.key,
                        player: element.player,
                        url: element.url
                    })
                });

                Select.show({
                    title: Lang.translate('title_trailers'),
                    items: items,
                    onSelect: (a)=>{
                        this.toggle()

                        if(a.player){
                            Player.play(a)
                            Player.playlist([a])
                        } else if(Platform.is('android')){
                            Android.openYoutube(a.id)
                        }
                        else YouTube.play(a.id)
                    },
                    onBack: ()=>{
                        Controller.toggle('full_start')
                    }
                })
            })
        }
        else{
            html.find('.view--trailer').remove()
        }

        Storage.listener.follow('change',follow)

        follow({name: 'parser_use'})

        this.favorite()

        this.loadPoster()

        this.loadBackground()

        this.translations()

        this.parsePG()
    }

    this.translations = function(){
        html.find('.icon--subscribe').on('hover:enter',()=>{
            event.call({
                callback_name: 'translations',
                card_id: data.movie.id,
                imdb_id: data.movie.imdb_id,
                season: Utils.countSeasons(data.movie)
            },(result)=>{
                if(result.result){
                    let items = []

                    for(let voice in result.result.voice){
                        items.push({
                            title: voice + ' - ' + result.result.voice[voice],
                            selected: voice == result.result.subscribe,
                            voice: voice,
                            ghost: voice !== result.result.subscribe,
                            episode: result.result.voice[voice]
                        })
                    }

                    Select.show({
                        title: Lang.translate('title_subscribe'),
                        items: items,
                        onSelect: (a)=>{
                            if(a.voice == result.result.subscribe) Noty.show(Lang.translate('subscribe_already'))
                            else if(Account.working()){
                                Account.subscribeToTranslation({
                                    card: data.movie,
                                    season: Utils.countSeasons(data.movie),
                                    episode: a.episode,
                                    voice: a.voice
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_success'))
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_error'))
                                })
                            }
                            else{
                                Noty.show(Lang.translate('subscribe_account'))
                            }

                            this.toggle()
                        },
                        onBack: ()=>{
                            Controller.toggle('full_start')
                        }
                    })
                }
                else Noty.show(Lang.translate('subscribe_error'))
            })
        })
    }

    this.parsePG = function(){
        let pg
        let cd = Storage.field('language')

        if(data.movie.content_ratings){
            try{
                let find = data.movie.content_ratings.results.find(a=>a.iso_3166_1 == cd.toUpperCase())

                if(!find) find = data.movie.content_ratings.results.find(a=>a.iso_3166_1 == 'US')
                
                if(find) pg = find.rating
            }
            catch(e){}
        }
        
        if(data.movie.release_dates && !pg){
            let find = data.movie.release_dates.results.find(a=>a.iso_3166_1 == cd.toUpperCase())

            if(!find) find = data.movie.release_dates.results.find(a=>a.iso_3166_1 == 'US')

            if(find && find.release_dates.length){
                pg = find.release_dates[0].certification
            }
        }
        
        if(data.movie.restrict) pg = data.movie.restrict + '+'

        if(pg) html.find('.full-start__pg').removeClass('hide').text(pg)
    }

    this.loadPoster = function(){
        load_images.poster = html.find('.full-start__img')[0] || {}

        load_images.poster.onerror = function(e){
            load_images.poster.src = './img/img_broken.svg'
        }

        let poster

        if(window.innerWidth <= 400){
            if(data.movie.backdrop_path) poster = Api.img(data.movie.backdrop_path,'original')
            else if(data.movie.background_image) poster = data.movie.background_image
        }

        if(poster) html.find('.full-start__poster').addClass('background--poster')

        load_images.poster.src = poster || data.movie.img
    }

    this.loadBackground = function(){
        let background = data.movie.backdrop_path ? Api.img(data.movie.backdrop_path,'original') : data.movie.background_image ? data.movie.background_image : ''

        if(window.innerWidth > 790 && background && !Storage.field('light_version') && Storage.field('background_type') !== 'poster'){
            load_images.background = html.find('.full-start__background')[0] || {}

            load_images.background.onload = function(e){
                html.find('.full-start__background').addClass('loaded')
            }

            load_images.background.src = background
        }
        else html.find('.full-start__background').remove()
    }

    this.groupButtons = function(){
        buttons_scroll.render().find('.selector').on('hover:focus',function(){
            last = $(this)[0]

            buttons_scroll.update($(this), false)
        })
    }

    this.favorite = function(){
        let status = Favorite.check(params.object.card)

        $('.info__icon',html).removeClass('active')

        $('.icon--book',html).toggleClass('active',status.book)
        $('.icon--like',html).toggleClass('active',status.like)
        $('.icon--wath',html).toggleClass('active',status.wath)
    }

    this.toggleBackground = function(){
        if(Storage.field('background')) Background.immediately(window.innerWidth <= 400 ? (data.movie.backdrop_path ? Api.img(data.movie.backdrop_path,'w500') : data.movie.background_image ? data.movie.background_image : data.movie.poster || data.movie.img || '') : Utils.cardImgBackground(data.movie))
    }

    this.toggle = function(){
        Controller.add('full_start',{
            toggle: ()=>{
                let btns = html.find('.full-start__buttons > *').filter(function(){
                    return $(this).is(':visible')
                })

                Controller.collectionSet(this.render())
                Controller.collectionFocus(last || (btns.length ? btns.eq(0)[0] : false), this.render())
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
                else this.onDown()
            },
            up: ()=>{
                let inbuttons = this.render().find('.full-start__buttons .focus').length
                
                if(Navigator.canmove('up')) Navigator.move('up')
                else if(inbuttons) {
                    Navigator.focus(this.render().find('.full-start__left .selector')[0])
                }
                else this.onUp()
            },
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('full_start')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        last = null

        buttons_scroll.destroy()

        event.destroy()

        load_images.poster.onerror = ()=>{}
        load_images.background.onload = ()=>{}

        html.remove()

        Storage.listener.remove('change',follow)
    }
}

export default create