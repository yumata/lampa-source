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
import Event from '../../utils/event'
import Noty from '../../interaction/noty'
import Account from '../../utils/account'
import Loading from '../../interaction/loading'
import Manifest from '../../utils/manifest'
import Color from '../../utils/color'

function create(data, params = {}){
    let html
    let last
    let tbtn
    let self = this
    let follow = function(e){
        if(e.name == 'parser_use'){
            let status = Storage.field('parser_use')

            if(window.lampa_settings.torrents_use) tbtn.toggleClass('selector',status).toggleClass('hide',!status)

            self.groupButtons()
        }
    }

    let buttons_scroll = new Scroll({horizontal: true, nopadding: false})
    let load_images    = {
        poster: {}
    }

    let event = new Event()
    let new_html  = Storage.field('card_interfice_type') == 'new'

    Arrays.extend(data.movie,{
        title: data.movie.name,
        original_title: data.movie.original_name,
        runtime: 0,
        img: data.movie.poster_path ? Api.img(data.movie.poster_path, Storage.field('poster_size')).replace(/\/w200/,'/w500') : './img/img_broken.svg'
    })

    this.create = function(){
        let genres = (data.movie.genres || ['---']).slice(0,3).map((a)=>{
            return Utils.capitalizeFirstLetter(a.name)
        }).join(', ')

        let countries = Api.sources.tmdb.parseCountries(data.movie)
        let seasons   = Utils.countSeasons(data.movie)
        let tmdb_rating = parseFloat((data.movie.vote_average || 0) +'').toFixed(1)

        if(tmdb_rating >= 10) tmdb_rating = 10

        html = Template.get('full_start' + (new_html ? '_new' : ''),{
            title: data.movie.title,
            original_title: data.movie.original_title,
            descr: Utils.substr(data.movie.overview || Lang.translate('full_notext'), 420),
            time: Utils.secondsToTime(data.movie.runtime * 60,true),
            genres: Utils.substr(genres,30),
            rating: tmdb_rating,
            seasons: seasons,
            countries: countries.join(', '),
            episodes: data.movie.number_of_episodes,
            tagline: data.movie.tagline,
        })

        if(!window.lampa_settings.torrents_use) html.find('.view--torrent').addClass('hide')

        if(new_html && data.movie.name) html.find('.full-start-new__poster').addClass('card--tv').append('<div class="card__type">TV</div>')

        let relise  = (data.movie.release_date || data.movie.first_air_date || '') + ''
        let year    = relise ? relise.slice(0,4) : ''
        let quality = !data.movie.first_air_date ? data.movie.release_quality || data.movie.quality : false
        let head    = []
        let info    = []

        if(year){
            html.find('.tag--year').removeClass('hide').find('> div').text(year)

            head.push('<span>'+year+'</span>')
        }

        if(countries.length){
            head.push(countries.slice(0,5).join(' | '))
        }

        if(!data.movie.tagline){
            html.find('.full--tagline').remove()
        }

        if(!data.movie.tagline && data.movie.title.length > 25){
            html.find('.full-start-new__title').addClass('twolines')
        }

        if(data.movie.runtime > 0){
            info.push('<span>'+Utils.secondsToTime(data.movie.runtime * 60,true)+'</span>')
        }

        if(quality){
            html.find('.tag--quality').removeClass('hide').find('> div').text(quality)
            
            info.push('<span>'+Lang.translate('player_quality')+': '+quality.toUpperCase()+'</span>')
        }

        if(seasons){
            info.push('<span>'+Lang.translate('title_seasons')+': '+seasons+'</span>')
        }

        if(data.movie.number_of_episodes){
            info.push('<span>'+Lang.translate('title_episodes')+': '+data.movie.number_of_episodes+'</span>')
        }

        if(data.movie.genres){
            genres = data.movie.genres.slice(0,5).map((a)=>{
                return Utils.capitalizeFirstLetter(a.name)
            }).join(' | ')

            info.push('<span>'+genres+'</span>')
        }

        if(data.movie.number_of_seasons){
            html.find('.is--serial').removeClass('hide')
        }

        if(data.movie.vote_average == 0){
            html.find('.rate--tmdb').addClass('hide')
        }

        if(data.movie.imdb_rating && parseFloat(data.movie.imdb_rating) > 0){
            html.find('.rate--imdb').removeClass('hide').find('> div').eq(0).text(parseFloat(data.movie.imdb_rating) >= 10 ? 10 : data.movie.imdb_rating)
        }

        if(data.movie.kp_rating && parseFloat(data.movie.kp_rating) > 0){
            html.find('.rate--kp').removeClass('hide').find('> div').eq(0).text(parseFloat(data.movie.kp_rating) >= 10 ? 10 : data.movie.kp_rating)
        }

        if(!(data.movie.source == 'tmdb' || data.movie.source == 'cub')) html.find('.source--name').text(data.movie.source.toUpperCase())
        else if(data.movie.number_of_seasons && window.lampa_settings.account_use && !window.lampa_settings.disable_features.subscribe){
            html.find('.button--subscribe').removeClass('hide')

            this.subscribed()
        }

        if(!new_html){
            $('.full-start__buttons-scroll',html).append(buttons_scroll.render())

            buttons_scroll.append($('.full-start__buttons',html))
        }

        if(!data.movie.runtime) $('.tag--time',html).remove()

        if(data.movie.next_episode_to_air){
            let air = Utils.parseToDate(data.movie.next_episode_to_air.air_date)
            let now = Date.now()

            let day = Math.ceil((air.getTime() - now)/(24*60*60*1000))
            let txt = Lang.translate('full_next_episode')+': ' + Utils.parseTime(data.movie.next_episode_to_air.air_date).short + ' / '+Lang.translate('full_episode_days_left')+': ' + day

            if(day > 0){
                $('.tag--episode',html).removeClass('hide').find('div').text(txt)

                info.push('<span>'+txt+'</span>')
            } 
        }

        if(data.movie.status){
            html.find('.full-start__status').removeClass('hide').text(Lang.translate('tv_status_' + data.movie.status.toLowerCase().replace(/ /g,'_')))
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

        if(!new_html){
            buttons_scroll.render().find('.selector').on('hover:focus',function(){
                last = $(this)[0]
    
                buttons_scroll.update($(this), false)
            })
        }
        else{
            $('.full-start-new__buttons',html).find('.selector').on('hover:focus',function(){
                last = $(this)[0]
            })
        }
        
        html.find('.full-start-new__head').toggleClass('hide',!head.length).html(head.join(', '))
        html.find('.full-start-new__details').html(info.join('<span class="full-start-new__split">●</span>'))

        Storage.listener.follow('change',follow)

        follow({name: 'parser_use'})

        this.trailers()

        this.favorite()

        this.loadPoster()

        this.translations()

        this.bookmarks()

        this.reactions()

        if(Account.logged() && !window.lampa_settings.disable_features.ai){
            this.options()
        }
        else{
            html.find('.button--options').remove()
        }

        let pg = Api.sources.tmdb.parsePG(data.movie)

        if(pg) html.find('.full-start__pg').removeClass('hide').text(pg)
        
        if(window.lampa_settings.read_only) html.find('.button--play').remove()
    }

    this.options = function(){
        html.find('.button--options').on('hover:enter',()=>{
            let items = []

            items.push({
                title: Lang.translate('title_ai_assistant'),
                separator: true,
            })

            items.push({
                title: Lang.translate('title_recomendations'),
                component: 'ai_recommendations',
            })

            items.push({
                title: Lang.translate('title_facts'),
                component: 'ai_facts',
            })

            Select.show({
                title: Lang.translate('more'),
                items: items,
                onSelect: (a)=>{
                    Activity.push({
                        url: '',
                        title: a.title,
                        component: a.component,
                        movie: data.movie
                    })
                },
                onBack: ()=>{
                    Controller.toggle('full_start')
                }
            })
        })
    }

    this.setBtnInPriority = function(btn){
        let cont = html.find('.full-start-new__buttons')
        let clon = btn.clone()

        cont.find('.button--priority').remove()
        
        clon.addClass('button--priority').removeClass('view--torrent').on('hover:enter',()=>{
            btn.trigger('hover:enter')
        }).on('hover:long',()=>{
            clon.remove()

            Storage.set('full_btn_priority','')

            last = html.find('.button--play')[0]

            Controller.toggle('full_start')
        })

        cont.prepend(clon)
    }

    this.vote = function(type, add){
        let mine = Storage.get('mine_reactions',{})
        let id   = (data.movie.name ? 'tv' : 'movie') + '_' + data.movie.id

        if(!mine[id]) mine[id] = []

        let ready = mine[id].indexOf(type) >= 0 

        if(add){
            if(!ready) mine[id].push(type)

            Storage.set('mine_reactions',mine)
        }

        return ready
    }

    this.reactions = function(){
        if(!Storage.field('card_interfice_reactions') || window.lampa_settings.disable_features.discuss) return html.find('.full-start-new__reactions, .button--reaction').remove()

        let drawReactions = ()=>{
            if(data.reactions && data.reactions.result && data.reactions.result.length){
                let reactions = data.reactions.result
                let reactions_body = html.find('.full-start-new__reactions')[0]
    
                reactions.sort((a,b)=>{
                    return a.counter > b.counter ? -1 : a.counter < b.counter ? 1 : 0
                })

                reactions_body.empty()
    
                reactions.forEach(r=>{
                    let reaction = document.createElement('div'),
                        icon     = document.createElement('img'),
                        count    = document.createElement('div'),
                        wrap     = document.createElement('div')
    
                    reaction.addClass('reaction')
                    icon.addClass('reaction__icon')
                    count.addClass('reaction__count')
    
                    reaction.addClass('reaction--' + r.type)
    
                    count.text(Utils.bigNumberToShort(r.counter))
    
                    icon.src = Utils.protocol() + Manifest.cub_domain + '/img/reactions/' + r.type + '.svg'
    
                    reaction.append(icon)
                    reaction.append(count)
    
                    wrap.append(reaction)
    
                    if(this.vote(r.type)) reaction.addClass('reaction--voted')
    
                    reactions_body.append(wrap)
                })
            }
        }

        let items = [
            {type: 'fire'},
            {type: 'nice'},
            {type: 'think'},
            {type: 'bore'},
            {type: 'shit'}
        ]

        items.forEach(a=>{
            a.template = 'selectbox_icon',
            a.icon     = '<img src="'+Utils.protocol() + Manifest.cub_domain + '/img/reactions/' + a.type + '.svg'+'" />'
            a.ghost    = this.vote(a.type)
            a.noenter  = a.ghost
            a.title    = Lang.translate('reactions_' + a.type)
        })

        html.find('.button--reaction').on('hover:enter',()=>{
            Select.show({
                title: Lang.translate('title_reactions'),
                items: items,
                onSelect: (a)=>{
                    Controller.toggle('full_start')

                    Api.sources.cub.reactionsAdd({
                        method: data.movie.name ? 'tv' : 'movie',
                        id: data.movie.id,
                        type: a.type
                    },()=>{
                        this.vote(a.type, true)

                        let find = data.reactions.result.find(r=>r.type == a.type)

                        if(find) find.counter++
                        else{
                            data.reactions.result.push({
                                type: a.type,
                                counter: 1
                            })
                        }

                        a.ghost   = true
                        a.noenter = true

                        drawReactions()
                    },(e)=>{
                        Lampa.Noty.show(Lang.translate('reactions_ready'))
                    })
                },
                onBack: ()=>{
                    Controller.toggle('full_start')
                }
            })
        })

        drawReactions()
    }

    this.bookmarks = function(){
        html.find('.button--book').on('hover:enter',()=>{
            let status = Favorite.check(params.object.card)
            let items  = [
                {
                    title: Lang.translate('title_book'),
                    type: 'book',
                    checkbox: true,
                    checked: status.book,
                },
                {
                    title: Lang.translate('title_like'),
                    type: 'like',
                    checkbox: true,
                    checked: status.like,
                },
                {
                    title: Lang.translate('title_wath'),
                    type: 'wath',
                    checkbox: true,
                    checked: status.wath,
                },
                {
                    title: Lang.translate('menu_history'),
                    type: 'history',
                    checkbox: true,
                    checked: status.history,
                }
            ]
            
            let marks = ['look', 'viewed', 'scheduled', 'continued', 'thrown']
            let label = (a)=>{
                params.object.card        = data.movie
                params.object.card.source = params.object.source

                Favorite.toggle(a.type, params.object.card)

                if(a.collect) Controller.toggle('full_start')

                this.favorite()
            }

            if(window.lampa_settings.account_use){
                items.push({
                    title: Lang.translate('settings_cub_status'),
                    separator: true
                })

                marks.forEach(m=>{
                    items.push({
                        title: Lang.translate('title_'+m),
                        type: m,
                        picked: status[m],
                        collect: true,
                        noenter: !Account.hasPremium()
                    })
                })
            }

            Select.show({
                title: Lang.translate('settings_input_links'),
                items: items,
                onCheck: label,
                onSelect: label,
                onBack: ()=>{
                    Controller.toggle('full_start')
                },
                onDraw: (item, elem)=>{
                    if(elem.collect){
                        if(!Account.hasPremium()){
                            let wrap = $('<div class="selectbox-item__lock"></div>')
                                wrap.append(Template.js('icon_lock'))

                            item.append(wrap)

                            item.on('hover:enter', ()=>{
                                Select.close()

                                Account.showCubPremium()
                            })
                        }
                    }
                }
            })
        })
    }

    this.groupButtons = function(){
        let play = html.find('.button--play')
        let btns = html.find('.buttons--container > .full-start__button').not('.hide')

        let priority = Storage.get('full_btn_priority','') + ''
        
        if(priority){
            let priority_button
            
            btns.each(function(){
                let hash = Utils.hash($(this).clone().removeClass('focus').prop('outerHTML'))

                if(hash == priority) priority_button = $(this)
            })

            if(priority_button) this.setBtnInPriority(priority_button)
        }

        
        play.unbind().on('hover:enter',(e)=>{
            priority = Storage.get('full_btn_priority','') + ''

            btns = html.find('.buttons--container > .full-start__button').not('.hide').filter(function(){
                return priority !== Utils.hash($(this).clone().removeClass('focus').prop('outerHTML'))
            })

            if(btns.length == 1){
                btns.trigger('hover:enter')
            }
            else{
                let items = []

                btns.each(function(){
                    let icon = $(this).find('svg').prop('outerHTML')

                    items.push({
                        title: $(this).text(),
                        subtitle: $(this).data('subtitle'),
                        template: typeof icon == 'undefined' || icon == 'undefined' ? 'selectbox_item' : 'selectbox_icon',
                        icon: icon,
                        btn: $(this)
                    })
                })

                Select.show({
                    title: Lang.translate('settings_rest_source'),
                    items: items,
                    onSelect: (a)=>{
                        a.btn.trigger('hover:enter')
                    },
                    onLong: (a)=>{
                        Storage.set('full_btn_priority',Utils.hash(a.btn.clone().removeClass('focus').prop('outerHTML')))
                        
                        this.setBtnInPriority(a.btn)
                    },
                    onBack: ()=>{
                        Controller.toggle('full_start')
                    }
                })
            }
        }).on('hover:focus',function(){
            last = $(this)[0]
        })
        
        
        play.toggleClass('hide',!Boolean(btns.length))
    }

    this.trailers = function(){
        if(data.videos && data.videos.results.length && !window.lampa_settings.disable_features.trailers){
            html.find('.view--trailer').on('hover:enter',()=>{
                let items = []

                data.videos.results.forEach(element => {
                    let date = Utils.parseTime(element.published_at).full

                    items.push({
                        title: Utils.shortText(element.name, 50),
                        subtitle: (element.official ? Lang.translate('full_trailer_official') : Lang.translate('full_trailer_no_official')) + ' - ' + date,
                        id: element.key,
                        player: element.player,
                        code: element.iso_639_1,
                        time: new Date(element.published_at).getTime(),
                        url: element.url || 'https://www.youtube.com/watch?v=' + element.key,
                        youtube: typeof element.youtube !== 'undefined' ? element.youtube : true,
                        icon: '<img class="size-youtube" src="'+(element.icon || 'https://img.youtube.com/vi/'+element.key+'/default.jpg')+'" />',
                        template: 'selectbox_icon'
                    })
                })

                items.sort((a,b)=>{
                    return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
                })

                let my_lang = items.filter(n=>n.code == Storage.field('tmdb_lang'))
                let en_lang = items.filter(n=>n.code == 'en' && my_lang.indexOf(n) == -1)
                let al_lang = []

                if(my_lang.length){
                    al_lang = al_lang.concat(my_lang)
                }

                if(al_lang.length && en_lang.length){
                    al_lang.push({
                        title: Lang.translate('more'),
                        separator: true
                    })
                }

                al_lang = al_lang.concat(en_lang)

                Select.show({
                    title: Lang.translate('title_trailers'),
                    items: al_lang,
                    onSelect: (a)=>{
                        this.toggle()

                        if(Platform.is('android') && Storage.field('player_launch_trailers') == 'youtube' && a.youtube){
                            Android.openYoutube(a.id)
                        }
                        else{
                            let playlist = al_lang.filter(v=>!v.separator)

                            Player.play(a)
                            Player.playlist(playlist)
                        }
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
    }

    this.subscribed = function(){
        event.call('subscribed',{
            card_id: data.movie.id
        },(result)=>{
            if(result.result){
                html.find('.button--subscribe').data('voice',result.result).addClass('active').find('path').attr('fill', 'currentColor')
            }
        })
    }

    this.translations = function(){
        if(window.lampa_settings.disable_features.subscribe) return

        let button = html.find('.button--subscribe')
        
        button.on('hover:enter',()=>{
            Loading.start(()=>{
                event.cancel('translations')

                Loading.stop()
            })

            event.call('translations',{
                card_id: data.movie.id,
                imdb_id: data.movie.imdb_id,
                season: Utils.countSeasons(data.movie)
            },(result)=>{
                Loading.stop()
                
                if(!result.result){
                    result.result = {
                        voice: {},
                        subscribe: ''
                    }
                }

                let items = []
                let subscribed = result.result.subscribe || button.data('voice')

                if(subscribed){
                    items.push({
                        title: Lang.translate('title_unsubscribe'),
                        subtitle: subscribed,
                        unsubscribe: true
                    })
                }

                for(let voice in result.result.voice){
                    items.push({
                        title: voice,
                        voice: voice,
                        ghost: voice !== result.result.subscribe,
                        episode: result.result.voice[voice]
                    })
                }

                if(items.length){
                    Select.show({
                        title: Lang.translate('title_subscribe'),
                        items: items,
                        onSelect: (a)=>{
                            this.toggle()

                            if(a.unsubscribe){
                                event.call('unsubscribe',{
                                    card_id: data.movie.id
                                },(result)=>{
                                    if(result.result){
                                        button.removeClass('active').data('voice','').find('path').attr('fill', 'transparent')
                                    }
                                })
                            }
                            else if(Account.logged()){
                                Account.subscribeToTranslation({
                                    card: data.movie,
                                    season: Utils.countSeasons(data.movie),
                                    episode: a.episode,
                                    voice: a.voice
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_success'))

                                    button.addClass('active').data('voice',a.voice).find('path').attr('fill', 'currentColor')
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_error'))
                                })
                            }
                            else{
                                Account.showNoAccount()
                            }
                        },
                        onBack: ()=>{
                            Controller.toggle('full_start')
                        }
                    })
                }
                else Noty.show(Lang.translate('subscribe_noinfo'))
                
            })
        })
    }

    this.loadPoster = function(){
        let im = html.find('.full--poster')

        if(window.innerWidth <= 480){
            load_images.poster = new Image()
            load_images.poster.crossOrigin = "Anonymous"
        }
        else load_images.poster = im[0] || {}

        load_images.poster.onerror = (e)=>{
            load_images.poster.src = './img/img_broken.svg'
        }

        load_images.poster.onload = (e)=>{
            im.parent().addClass('loaded')
        }

        let poster

        if(window.innerWidth <= 480){
            if(data.movie.backdrop_path) poster = Api.img(data.movie.backdrop_path,'w780')
            else if(data.movie.background_image) poster = data.movie.background_image

            load_images.poster.onerror = (e)=>{
                load_images.poster = im[0]

                load_images.poster.onerror = (e)=>{
                    load_images.poster.src = './img/img_broken.svg'
                }
        
                load_images.poster.onload = (e)=>{
                    im.parent().addClass('loaded').addClass('with-out')
                }

                im[0].src = poster || data.movie.img
            }

            load_images.poster.onload = (e)=>{
                Color.blurPoster(load_images.poster, im.width(), im.height(), (nim)=>{
                    im[0].src = nim.src
                    
                    im.parent().addClass('loaded')

                    setTimeout(()=>{
                        im[0].style.transition = 'none'
                    },500)

                    let sc = this.mscroll.render(true)
                    let an = 0
                    let ts = 0
                    let dl = window.innerHeight * 0.1

                    let smoothParallax = ()=>{
                        im[0].style.transform = 'translate3d(0, ' + ts * 0.35 + 'px, 0)'
                        im[0].style.opacity   = ts >= dl ? Math.max(0, 1 - (ts - dl) / (window.innerHeight * 0.2)) : 1;

                        an--

                        if(an > 0) smoothParallax()
                    }

                    sc.addEventListener('scroll', function(e) {
                        ts = sc.scrollTop
                        
                        if(an == 0){
                            an = 100

                            requestAnimationFrame(smoothParallax)
                        }
                    })
                })
            }
        }

        if(poster) html.find('.full-start__poster').addClass('background--poster')

        load_images.poster.src = poster || data.movie.img
    }

    this.favorite = function(){
        let status = Favorite.check(params.object.card)
        let any    = Favorite.checkAnyNotHistory(status)

        $('.button--book path', html).attr('fill', any ? 'currentColor' : 'transparent')
    }

    this.toggleBackground = function(){
        Background.immediately(Utils.cardImgBackgroundBlur(data.movie))
    }

    this.toggle = function(){
        Controller.add('full_start',{
            update: ()=>{},
            toggle: ()=>{
                this.groupButtons()
                
                let btns = html.find('.full-start__buttons > *').filter(function(){
                    return $(this).is(':visible')
                })

                Controller.collectionSet(this.render())
                Controller.collectionFocus(last || (btns.length ? btns.eq(0)[0] : false), this.render())

                if(window.innerWidth <= 480) this.mscroll.render(true).scrollTop = 1

                if(this.onToggle) this.onToggle(this)
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
                if(Navigator.canmove('up')) Navigator.move('up')
                this.onUp()
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

        html.remove()

        Storage.listener.remove('change',follow)
    }
}

export default create