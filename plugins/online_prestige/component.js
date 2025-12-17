import videocdn from './balansers/videocdn'
import rezka from './balansers/rezka'
import kinobase from './balansers/kinobase'
import collaps from './balansers/collaps'
import filmix from './balansers/filmix'

function component(object){
    let network  = new Lampa.Reguest()
    let scroll   = new Lampa.Scroll({mask:true,over: true})
    let files    = new Lampa.Explorer(object)
    let filter   = new Lampa.Filter(object)
    let sources  = {
        videocdn: videocdn,
        rezka: rezka,
        kinobase: kinobase,
        collaps: collaps,
        filmix: filmix
    }
    

    let last
    let extended
    let selected_id
    let source
    let balanser
    let initialized
    let balanser_timer
    let images = []

    let filter_sources   = Lampa.Arrays.getKeys(sources)
    let filter_translate = {
        season: Lampa.Lang.translate('torrent_serial_season'),
        voice: Lampa.Lang.translate('torrent_parser_voice'),
        source: Lampa.Lang.translate('settings_rest_source')
    }


    this.initialize = function(){
        source = this.createSource()

        filter.onSearch = (value)=>{
            Lampa.Activity.replace({
                search: value,
                clarification: true
            })
        }

        filter.onBack = ()=>{
            this.start()
        }

        filter.render().find('.selector').on('hover:enter',()=>{
            clearInterval(balanser_timer)
        })

        filter.onSelect = (type, a, b)=>{
            if(type == 'filter'){
                if(a.reset){
                    if(extended) source.reset()
                    else this.start()
                }
                else{
                    source.filter(type, a, b)
                }
            }
            else if(type == 'sort'){
                Lampa.Select.close()

                this.changeBalanser(a.source)
            }
        }

        if(filter.addButtonBack) filter.addButtonBack()

        filter.render().find('.filter--sort span').text(Lampa.Lang.translate('online_balanser'))

        files.appendFiles(scroll.render())
        files.appendHead(filter.render())

        scroll.body().addClass('torrent-list')

        scroll.minus(files.render().find('.explorer__files-head'))

        this.search()
    }

    this.changeBalanser = function(balanser_name){
        let last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {})
            last_select_balanser[object.movie.id] = balanser_name

        Lampa.Storage.set('online_last_balanser', last_select_balanser)
        Lampa.Storage.set('online_balanser', balanser_name)

        let to   = this.getChoice(balanser_name)
        let from = this.getChoice()

        if(from.voice_name) to.voice_name = from.voice_name

        this.saveChoice(to, balanser_name)

        Lampa.Activity.replace()
    }

    this.createSource = function(){
        let last_select_balanser = Lampa.Storage.cache('online_last_balanser', 3000, {})

        if(last_select_balanser[object.movie.id]){
            balanser = last_select_balanser[object.movie.id]

            Lampa.Storage.set('online_last_balanser', last_select_balanser)
        }
        else{
            balanser = Lampa.Storage.get('online_balanser', 'filmix')
        }

        if(!sources[balanser]){
            balanser = 'filmix'
        }

        return new sources[balanser](this, object)
    }

    this.proxy = function(name){
        let prox = Lampa.Storage.get('online_proxy_all')
        let need = Lampa.Storage.get('online_proxy_'+name)

        if(need) prox = need

        if(prox && prox.slice(-1) !== '/'){
            prox += '/'
        }

        return prox
    }

    /**
     * Подготовка
     */
    this.create = function(){
        return this.render()
    }

    /**
     * Начать поиск
     */
    this.search = function(){
        this.activity.loader(true)

        this.filter({
            source: filter_sources
        },this.getChoice())

        this.find()
    }

    this.find = function(){
        let url   = this.proxy('videocdn') + 'https://videocdn.tv/api/short'
        let query = object.search

        url = Lampa.Utils.addUrlComponent(url,'api_token=3i40G5TSECmLF77oAqnEgbx61ZWaOYaE')
        
        const display = (json)=>{
            if(object.movie.imdb_id){
                let imdb = json.data.filter(elem=>elem.imdb_id == object.movie.imdb_id)

                if(imdb.length) json.data = imdb
            }

            if(json.data && json.data.length){
                if(json.data.length == 1 || object.clarification){
                    this.extendChoice()

                    let kinopoisk_id = json.data[0].kp_id || json.data[0].filmId

                    if(kinopoisk_id && source.searchByKinopoisk){
                        source.searchByKinopoisk(object, kinopoisk_id)
                    }
                    else if(json.data[0].imdb_id && source.searchByImdbID){
                        source.searchByImdbID(object, json.data[0].imdb_id)
                    }
                    else if(source.search){
                        source.search(object, json.data)
                    }
                    else{
                        this.doesNotAnswer()
                    }
                }
                else{
                    this.similars(json.data)

                    this.loading(false)
                }
            }
            else this.doesNotAnswer(query)
        }

        const pillow = (a, c)=>{
            network.timeout(1000*15)

            network.native('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(query),(json)=>{
                json.data = json.films

                display(json)
            },(a, c)=>{
                this.doesNotAnswer()
            },false,{
                headers: {
                    'X-API-KEY': '2d55adfd-019d-4567-bbf7-67d503f61b5a'
                }
            })
        }

        const letgo = (imdb_id)=>{
            if(imdb_id && source.searchByImdbID){
                this.extendChoice()

                source.searchByImdbID(object, imdb_id)
            }
            else{
                let url_end = Lampa.Utils.addUrlComponent(url, imdb_id ? 'imdb_id=' + encodeURIComponent(imdb_id) : 'title='+encodeURIComponent(query))

                network.timeout(1000*15)
                
                network.native(url_end,(json)=>{
                    if(json.data && json.data.length) display(json)
                    else{
                        network.native(Lampa.Utils.addUrlComponent(url, 'title='+encodeURIComponent(query)),display.bind(this),pillow.bind(this))
                    }
                },pillow.bind(this))
            }
        }


        if(source.searchByTitle){
            this.extendChoice()

            source.searchByTitle(object, object.movie.title || object.movie.name)
        }
        else if(object.movie.kinopoisk_id && source.searchByKinopoisk){
            this.extendChoice()

            source.searchByKinopoisk(object, object.movie.kinopoisk_id)
        }
        else if(object.movie.imdb_id){
            letgo(object.movie.imdb_id)
        } 
        else if(object.movie.source == 'tmdb' || object.movie.source == 'cub'){
            let tmdburl = (object.movie.name ? 'tv' : 'movie') + '/' + object.movie.id + '/external_ids?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru'
            let baseurl = Lampa.TMDB.api(tmdburl)

            network.timeout(1000*10)

            network.native(baseurl, function (ttid) {
                letgo(ttid.imdb_id)
            },(a, c)=>{
                letgo()
            })
        }
        else{
            letgo()
        }
    }

    this.getChoice = function(for_balanser){
        let data = Lampa.Storage.cache('online_choice_'+(for_balanser || balanser), 3000, {})
        let save = data[selected_id || object.movie.id] || {}

        Lampa.Arrays.extend(save, {
            season: 0,
            voice: 0,
            voice_name: '',
            voice_id: 0,
            episodes_view: {},
            movie_view: ''
        })

        return save
    }

    this.extendChoice = function(){
        extended = true

        source.extendChoice(this.getChoice())
    }

    this.saveChoice = function(choice, for_balanser){
        let data = Lampa.Storage.cache('online_choice_'+(for_balanser || balanser), 3000, {})

            data[selected_id || object.movie.id] = choice

        Lampa.Storage.set('online_choice_'+(for_balanser || balanser), data)
    }

    /**
     * Есть похожие карточки
     * @param {Object} json 
     */
     this.similars = function(json){
        json.forEach(elem=>{
            let info = []
            let year = ((elem.start_date || elem.year || '') + '').slice(0,4)

            if(elem.rating && elem.rating !== 'null' && elem.filmId) info.push(Lampa.Template.get('online_prestige_rate',{rate: elem.rating},true))

            if(year) info.push(year)

            if(elem.countries && elem.countries.length){
                info.push((elem.filmId ? elem.countries.map(c=>c.country) : elem.countries).join(', '))
            }

            if(elem.categories && elem.categories.length){
                info.push(elem.categories.slice(0,4).join(', '))
            }

            let name = elem.title || elem.ru_title || elem.en_title || elem.nameRu || elem.nameEn
            let orig = elem.orig_title || elem.nameEn || ''

            elem.title = name + (orig && orig !== name ? ' / ' + orig : '') 
            elem.time  = elem.filmLength || ''
            elem.info  = info.join('<span class="online-prestige-split">●</span>')

            let item = Lampa.Template.get('online_prestige_folder',elem)

            item.on('hover:enter',()=>{
                this.activity.loader(true)

                this.reset()

                object.search_date = year

                selected_id = elem.id

                this.extendChoice()

                let kinopoisk_id = elem.kp_id || elem.filmId

                if(kinopoisk_id && source.searchByKinopoisk){
                    source.searchByKinopoisk(object, kinopoisk_id)
                }
                else if(source.search){
                    source.search(object, [elem])
                }
                else{
                    this.doesNotAnswer()
                }
            }).on('hover:focus',(e)=>{
                last = e.target
    
                scroll.update($(e.target),true)
            })

            scroll.append(item)
        })
    }

    this.clearImages = function(){
        images.forEach(img=>{
            img.onerror = ()=>{}
            img.onload = ()=>{}

            img.src = ''
        })

        images = []
    }

    /**
     * Очистить список файлов
     */
    this.reset = function(){
        last = false

        clearInterval(balanser_timer)

        network.clear()

        this.clearImages()

        scroll.render().find('.empty').remove()

        scroll.clear()
    }

    /**
     * Загрузка
     */
    this.loading = function(status){
        if(status) this.activity.loader(true)
        else{
            this.activity.loader(false)

            this.activity.toggle()
        }
    }

    /**
     * Построить фильтр
     */
    this.filter = function(filter_items, choice){
        let select = []

        let add = (type, title)=>{
            let need     = this.getChoice()
            let items    = filter_items[type]
            let subitems = []
            let value    = need[type]

            items.forEach((name, i) => {
                subitems.push({
                    title: name,
                    selected: value == i,
                    index: i
                })
            })

            select.push({
                title: title,
                subtitle: items[value],
                items: subitems,
                stype: type
            })
        }

        filter_items.source = filter_sources

        select.push({
            title: Lampa.Lang.translate('torrent_parser_reset'),
            reset: true
        })

        this.saveChoice(choice)

        if(filter_items.voice && filter_items.voice.length) add('voice',Lampa.Lang.translate('torrent_parser_voice'))

        if(filter_items.season && filter_items.season.length) add('season',Lampa.Lang.translate('torrent_serial_season'))

        filter.set('filter', select) 
        filter.set('sort', filter_sources.map(e=>{return {title:e,source:e,selected:e==balanser}})) 

        this.selected(filter_items)
    }

    /**
     * Закрыть фильтр
     */
    this.closeFilter = function(){
        if($('body').hasClass('selectbox--open')) Lampa.Select.close()
    }

    /**
     * Показать что выбрано в фильтре
     */
    this.selected = function(filter_items){
        let need   = this.getChoice(),
            select = []

        for(let i in need){
            if(filter_items[i] && filter_items[i].length){
                if(i == 'voice'){
                    select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
                }
                else if(i !== 'source'){
                    if(filter_items.season.length >= 1){
                        select.push(filter_translate.season + ': ' + filter_items[i][need[i]])
                    }
                }
            }
        }

        filter.chosen('filter', select)
        filter.chosen('sort', [balanser])
    }

    this.getEpisodes = function(season, call){
        let episodes = []

        if(typeof object.movie.id == 'number' && object.movie.name){
            Lampa.Api.sources.tmdb.get('tv/' + object.movie.id + '/season/'+season, {}, function(data){
                episodes = data.episodes || []

                call(episodes)
            }, function(){
                call(episodes)
            })
        }
        else call(episodes)
    }

    /**
     * Добавить элементы в список
     */
    this.append = function(item){
        item.on('hover:focus',(e)=>{
            last = e.target

            scroll.update($(e.target),true)
        })

        scroll.append(item)
    }

    this.watched = function(set){
        let file_id = Lampa.Utils.hash(object.movie.number_of_seasons ? object.movie.original_name : object.movie.original_title)
        let watched = Lampa.Storage.cache('online_watched_last', 5000, {})

        if(set){
            if(!watched[file_id]) watched[file_id] = {}

            Lampa.Arrays.extend(watched[file_id], set, true)

            Lampa.Storage.set('online_watched_last', watched)

            this.updateWatched()
        }
        else{
            return watched[file_id]
        }
    }

    this.updateWatched = function(){
        let watched = this.watched()
        let body    = scroll.body().find('.online-prestige-watched .online-prestige-watched__body').empty()

        if(watched){
            let line = []

            if(watched.balanser_name) line.push(watched.balanser_name)
            if(watched.voice_name)    line.push(watched.voice_name)
            if(watched.season)        line.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + watched.season)
            if(watched.episode)       line.push(Lampa.Lang.translate('torrent_serial_episode') + ' ' + watched.episode)

            line.forEach(n=>{
                body.append('<span>'+n+'</span>')
            })
        }
        else body.append('<span>'+Lampa.Lang.translate('online_no_watch_history')+'</span>')
    }

    /**
     * Отрисовка файлов
     */
    this.draw = function(items, params = {}){
        if(!items.length) return this.empty()

        scroll.append(Lampa.Template.get('online_prestige_watched', {}))

        this.updateWatched()

        this.getEpisodes(items[0].season,episodes=>{
            let viewed = Lampa.Storage.cache('online_view', 5000, [])
            let serial = object.movie.name ? true : false
            let choice = this.getChoice()
            let fully  = window.innerWidth > 480

            let scroll_to_element = false
            let scroll_to_mark    = false

            items.forEach((element, index) => {
                let episode      = serial && episodes.length && !params.similars ? episodes.find(e=>e.episode_number == element.episode) : false
                let episode_num  = element.episode || (index + 1)
                let episode_last = choice.episodes_view[element.season]

                Lampa.Arrays.extend(element,{
                    info: '',
                    quality: '',
                    time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60,true)
                })

                let hash_timeline = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title].join('') : object.movie.original_title)
                let hash_behold   = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title,element.voice_name].join('') : object.movie.original_title + element.voice_name)
                
                let data = {
                    hash_timeline,
                    hash_behold
                }

                let info = []

                if(element.season){
                    element.translate_episode_end = this.getLastEpisode(items)
                    element.translate_voice       = element.voice_name
                }

                element.timeline = Lampa.Timeline.view(hash_timeline)

                if(episode){
                    element.title = episode.name

                    if(element.info.length < 30 && episode.vote_average) info.push(Lampa.Template.get('online_prestige_rate',{rate: parseFloat(episode.vote_average +'').toFixed(1)},true))

                    if(episode.air_date && fully) info.push(Lampa.Utils.parseTime(episode.air_date).full)
                }
                else if(object.movie.release_date && fully){
                    info.push(Lampa.Utils.parseTime(object.movie.release_date).full)
                }

                if(!serial && object.movie.tagline && element.info.length < 30) info.push(object.movie.tagline)

                if(element.info) info.push(element.info) 

                if(info.length) element.info = info.map(i=>'<span>'+i+'</span>').join('<span class="online-prestige-split">●</span>')

                let html   = Lampa.Template.get('online_prestige_full', element)
                let loader = html.find('.online-prestige__loader')
                let image  = html.find('.online-prestige__img')

                if(!serial){
                    if(choice.movie_view == hash_behold) scroll_to_element = html
                }
                else if(typeof episode_last !== 'undefined' && episode_last == episode_num){
                    scroll_to_element = html
                }

                if(serial && !episode){
                    image.append('<div class="online-prestige__episode-number">'+('0' + (element.episode || (index + 1))).slice(-2)+'</div>')

                    loader.remove()
                }
                else{
                    let img = html.find('img')[0]

                    img.onerror = function(){
                        img.src = './img/img_broken.svg'
                    }

                    img.onload = function(){
                        image.addClass('online-prestige__img--loaded')

                        loader.remove()

                        if(serial) image.append('<div class="online-prestige__episode-number">'+('0' + (element.episode || (index + 1))).slice(-2)+'</div>')
                    }

                    img.src = Lampa.TMDB.image('t/p/w300' + (episode ? episode.still_path : object.movie.backdrop_path))

                    images.push(img)
                }
                
                html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline))

                if(viewed.indexOf(hash_behold) !== -1){
                    scroll_to_mark = html

                    html.find('.online-prestige__img').append('<div class="online-prestige__viewed">'+Lampa.Template.get('icon_viewed',{},true)+'</div>')
                } 


                element.mark = ()=>{
                    viewed = Lampa.Storage.cache('online_view', 5000, [])

                    if(viewed.indexOf(hash_behold) == -1){
                        viewed.push(hash_behold)

                        Lampa.Storage.set('online_view', viewed)

                        if(html.find('.online-prestige__viewed').length == 0){
                            html.find('.online-prestige__img').append('<div class="online-prestige__viewed">'+Lampa.Template.get('icon_viewed',{},true)+'</div>')
                        }
                    }

                    choice = this.getChoice()

                    if(!serial){
                        choice.movie_view = hash_behold
                    }
                    else{
                        choice.episodes_view[element.season] = episode_num
                    }

                    this.saveChoice(choice)

                    this.watched({
                        balanser: balanser,
                        balanser_name: Lampa.Utils.capitalizeFirstLetter(balanser),
                        voice_id: choice.voice_id,
                        voice_name: choice.voice_name || element.voice_name,
                        episode: element.episode,
                        season: element.season
                    })
                }

                element.unmark = ()=>{
                    viewed = Lampa.Storage.cache('online_view', 5000, [])

                    if(viewed.indexOf(hash_behold) !== -1){
                        Lampa.Arrays.remove(viewed, hash_behold)

                        Lampa.Storage.set('online_view', viewed)

                        if(Lampa.Manifest.app_digital >= 177) Lampa.Storage.remove('online_view', hash_behold)

                        html.find('.online-prestige__viewed').remove()
                    }
                }

                element.timeclear = ()=>{
                    element.timeline.percent  = 0
                    element.timeline.time     = 0
                    element.timeline.duration = 0
                    
                    Lampa.Timeline.update(element.timeline)
                }

                html.on('hover:enter',()=>{
                    if(object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                    if(params.onEnter) params.onEnter(element, html, data)
                }).on('hover:focus',(e)=>{
                    last = e.target

                    if(params.onFocus) params.onFocus(element, html, data)
        
                    scroll.update($(e.target), true)
                })

                if(params.onRender) params.onRender(element, html, data)

                this.contextMenu({
                    html,
                    element,
                    onFile: (call)=>{
                        if(params.onContextMenu) params.onContextMenu(element, html, data, call)
                    },
                    onClearAllMark: ()=>{
                        items.forEach(elem=>{
                            elem.unmark()
                        })
                    },
                    onClearAllTime: ()=>{
                        items.forEach(elem=>{
                            elem.timeclear()
                        })
                    }
                })
        
                scroll.append(html)
            })

            if(serial && episodes.length > items.length && !params.similars){
                let left = episodes.slice(items.length)

                left.forEach(episode=>{
                    let info = []

                    if(episode.vote_average) info.push(Lampa.Template.get('online_prestige_rate',{rate: parseFloat(episode.vote_average +'').toFixed(1)},true))
                    if(episode.air_date) info.push(Lampa.Utils.parseTime(episode.air_date).full)

                    let air = new Date((episode.air_date + '').replace(/-/g,'/'))
                    let now = Date.now()

                    let day = Math.round((air.getTime() - now)/(24*60*60*1000))
                    let txt = Lampa.Lang.translate('full_episode_days_left')+': ' + day

                    let html   = Lampa.Template.get('online_prestige_full', {
                        time: Lampa.Utils.secondsToTime((episode ? episode.runtime : object.movie.runtime) * 60,true),
                        info: info.length ? info.map(i=>'<span>'+i+'</span>').join('<span class="online-prestige-split">●</span>') : '',
                        title: episode.name,
                        quality: day > 0 ? txt : ''
                    })
                    let loader = html.find('.online-prestige__loader')
                    let image  = html.find('.online-prestige__img')
                    let season = items[0] ? items[0].season : 1

                    html.find('.online-prestige__timeline').append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([season,episode.episode_number,object.movie.original_title].join('')) )))

                    let img = html.find('img')[0]

                    if(episode.still_path){
                        img.onerror = function(){
                            img.src = './img/img_broken.svg'
                        }

                        img.onload = function(){
                            image.addClass('online-prestige__img--loaded')

                            loader.remove()

                            image.append('<div class="online-prestige__episode-number">'+('0' + (episode.episode_number)).slice(-2)+'</div>')
                        }

                        img.src = Lampa.TMDB.image('t/p/w300' + episode.still_path)

                        images.push(img)
                    }
                    else{
                        loader.remove()

                        image.append('<div class="online-prestige__episode-number">'+('0' + (episode.episode_number)).slice(-2)+'</div>')
                    }

                    html.on('hover:focus',(e)=>{
                        last = e.target
            
                        scroll.update($(e.target), true)
                    })

                    scroll.append(html)
                })
            }

            if(scroll_to_element){
                last = scroll_to_element[0]
            }
            else if(scroll_to_mark){
                last = scroll_to_mark[0]
            }

            Lampa.Controller.enable('content')
        })
    }

    /**
     * Меню
     */
    this.contextMenu = function(params){
        params.html.on('hover:long',()=>{
            function show(extra){
                let enabled = Lampa.Controller.enabled().name

                let menu = []

                if(Lampa.Platform.is('webos')){
                    menu.push({
                        title: Lampa.Lang.translate('player_lauch') + ' - Webos',
                        player: 'webos'
                    })
                }
                
                if(Lampa.Platform.is('android')){
                    menu.push({
                        title: Lampa.Lang.translate('player_lauch') + ' - Android',
                        player: 'android'
                    })
                }

                menu.push({
                    title: Lampa.Lang.translate('player_lauch') + ' - Lampa',
                    player: 'lampa'
                })

                menu.push({
                    title: Lampa.Lang.translate('online_video'),
                    separator: true
                })

                menu.push({
                    title: Lampa.Lang.translate('torrent_parser_label_title'),
                    mark: true
                })
                menu.push({
                    title: Lampa.Lang.translate('torrent_parser_label_cancel_title'),
                    unmark: true
                })
                menu.push({
                    title: Lampa.Lang.translate('time_reset'),
                    timeclear: true
                })

                if(extra){
                    menu.push({
                        title: Lampa.Lang.translate('copy_link'),
                        copylink: true
                    })
                }

                menu.push({
                    title: Lampa.Lang.translate('more'),
                    separator: true
                })

                if(Lampa.Account.logged() && params.element && typeof params.element.season !== 'undefined' && params.element.translate_voice){
                    menu.push({
                        title: Lampa.Lang.translate('online_voice_subscribe'),
                        subscribe: true
                    })
                }

                menu.push({
                    title: Lampa.Lang.translate('online_clear_all_marks'),
                    clearallmark: true
                })

                menu.push({
                    title: Lampa.Lang.translate('online_clear_all_timecodes'),
                    timeclearall: true
                })

                Lampa.Select.show({
                    title: Lampa.Lang.translate('title_action'),
                    items: menu,
                    onBack: ()=>{
                        Lampa.Controller.toggle(enabled)
                    },
                    onSelect: (a)=>{
                        if(a.mark)      params.element.mark()
                        if(a.unmark)    params.element.unmark()
                        if(a.timeclear) params.element.timeclear()

                        if(a.clearallmark) params.onClearAllMark()
                        if(a.timeclearall) params.onClearAllTime()

                        Lampa.Controller.toggle(enabled)

                        if(a.player){
                            Lampa.Player.runas(a.player)

                            params.html.trigger('hover:enter')
                        }

                        if(a.copylink){
                            if(extra.quality){
                                let qual = []

                                for(let i in extra.quality){
                                    qual.push({
                                        title: i,
                                        file: extra.quality[i]
                                    })
                                }

                                Lampa.Select.show({
                                    title: Lampa.Lang.translate('settings_server_links'), 
                                    items: qual,
                                    onBack: ()=>{
                                        Lampa.Controller.toggle(enabled)
                                    },
                                    onSelect: (b)=>{
                                        Lampa.Utils.copyTextToClipboard(b.file,()=>{
                                            Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'))
                                        },()=>{
                                            Lampa.Noty.show(Lampa.Lang.translate('copy_error'))
                                        })
                                    }
                                })
                            }
                            else{
                                Lampa.Utils.copyTextToClipboard(extra.file,()=>{
                                    Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'))
                                },()=>{
                                    Lampa.Noty.show(Lampa.Lang.translate('copy_error'))
                                })
                            }
                        }

                        if(a.subscribe){
                            Lampa.Account.subscribeToTranslation({
                                card: object.movie,
                                season: params.element.season,
                                episode: params.element.translate_episode_end,
                                voice: params.element.translate_voice
                            },()=>{
                                Lampa.Noty.show(Lampa.Lang.translate('online_voice_success'))
                            },()=>{
                                Lampa.Noty.show(Lampa.Lang.translate('online_voice_error'))
                            })
                        }
                    }
                })
            }

            params.onFile(show)
        }).on('hover:focus',()=>{
            if(Lampa.Helper) Lampa.Helper.show('online_file',Lampa.Lang.translate('helper_online_file'),params.html)
        })
    }

    /**
     * Показать пустой результат
     */
    this.empty = function(msg){
        let html = Lampa.Template.get('online_does_not_answer',{})

        html.find('.online-empty__buttons').remove()
        html.find('.online-empty__title').text(Lampa.Lang.translate('empty_title_two'))
        html.find('.online-empty__time').text(Lampa.Lang.translate('empty_text'))

        scroll.append(html)

        this.loading(false)
    }

    this.doesNotAnswer = function(){
        this.reset()

        let html = Lampa.Template.get('online_does_not_answer',{balanser})
        let tic  = 10

        html.find('.cancel').on('hover:enter',()=>{
            clearInterval(balanser_timer)
        })

        html.find('.change').on('hover:enter',()=>{
            clearInterval(balanser_timer)

            filter.render().find('.filter--sort').trigger('hover:enter')
        })

        scroll.append(html)

        this.loading(false)

        balanser_timer = setInterval(()=>{
            tic--

            html.find('.timeout').text(tic)

            if(tic == 0){
                clearInterval(balanser_timer)

                let keys = Lampa.Arrays.getKeys(sources)
                let indx = keys.indexOf(balanser)
                let next = keys[indx+1]

                if(!next) next = keys[0]

                balanser = next

                if(Lampa.Activity.active().activity == this.activity) this.changeBalanser(balanser)
            }
        },1000)
    }

    this.getLastEpisode = function(items){
        let last_episode = 0

        items.forEach(e=>{
            if(typeof e.episode !== 'undefined') last_episode = Math.max(last_episode, parseInt(e.episode))
        })

        return last_episode
    }

    /**
     * Начать навигацию по файлам
     */
    this.start = function(){
        if(Lampa.Activity.active().activity !== this.activity) return

        if(!initialized){
            initialized = true

            this.initialize()
        }

        Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie))

        Lampa.Controller.add('content',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(scroll.render(),files.render())
                Lampa.Controller.collectionFocus(last || false,scroll.render())
            },
            up: ()=>{
                if(Navigator.canmove('up')){
                    Navigator.move('up')
                }
                else Lampa.Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
                else filter.show(Lampa.Lang.translate('title_filter'),'filter')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Lampa.Controller.toggle('menu')
            },
            gone: ()=>{
                clearInterval(balanser_timer)
            },
            back: this.back
        })

        Lampa.Controller.toggle('content')
    }

    this.render = function(){
        return files.render()
    }

    this.back = function(){
        Lampa.Activity.backward()
    }

    this.pause = function(){}

    this.stop = function(){}

    this.destroy = function(){
        network.clear()

        this.clearImages()

        files.destroy()

        scroll.destroy()

        clearInterval(balanser_timer)

        if(source) source.destroy()
    }
}

export default component
