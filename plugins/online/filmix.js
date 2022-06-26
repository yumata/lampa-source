function filmix(component, _object){
    let network  = new Lampa.Reguest()
    let extract  = {}
    let results  = []
    let object   = _object
    let embed    = 'http://filmixapp.cyou/api/v2/';
    let select_title = ''

    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0
    }

    let token = Lampa.Storage.get('filmix_token','')

    if (!window.filmix){
        window.filmix = {
            max_qualitie: 720,
            is_max_qualitie: false
        }
    } 

    let dev_token = '?user_dev_apk=1.1.2&&user_dev_name=Xiaomi&user_dev_os=11&user_dev_token=' + token + '&user_dev_vendor=Xiaomi'

    /**
     * Начать поиск
     * @param {Object} _object 
     */
    this.search = function(_object, data){
        if(this.wait_similars) return this.find(data[0].id)

        object  = _object

        select_title = object.movie.title

        let item = data[0]
        let year = parseInt((object.movie.release_date || object.movie.first_air_date || '0000').slice(0,4))
        let orig = object.movie.original_title || object.movie.original_name

        let url = embed + 'suggest'
            url = Lampa.Utils.addUrlComponent(url, 'word=' + encodeURIComponent(item.title))

        network.clear()
        network.silent(url, (json)=> {
            let cards = json.filter(c=>{
                c.year = parseInt(c.alt_name.split('-').pop())

                return c.year > year - 2 && c.year < year + 2
            })

            let card = cards.find(c=>c.year == year)

            if(!card){
                card = cards.find(c=>c.original_title == orig)
            }

            if(!card && cards.length == 1) card = cards[0]

            if(card) this.find(card.id)
            else if(json.length){
                this.wait_similars = true

                component.similars(json)
                component.loading(false)
            }
            else component.emptyForQuery(select_title)
        }, (a, c)=> {
            component.empty(network.errorDecode(a, c))
        })
    }

    this.find = function (filmix_id) {
        var url = embed;
        if (!window.filmix.is_max_qualitie && token) {
            window.filmix.is_max_qualitie = true

            network.clear()
            network.timeout(10000)
            network.silent(url + 'user_profile' + dev_token, function (found) {
                if (found && found.user_data) {
                    if (found.user_data.is_pro) window.filmix.max_qualitie      = 1080
                    if (found.user_data.is_pro_plus) window.filmix.max_qualitie = 2160
                }

                end_search(filmix_id)
            })
        }
        else end_search(filmix_id)

        function end_search(filmix_id) {
            network.clear();
            network.timeout(10000);
            network.silent((window.filmix.is_max_qualitie ? url + 'post/' + filmix_id + dev_token : url + 'post/' + filmix_id), function (found) {
                if (found && Object.keys(found).length) {
                    success(found)

                    component.loading(false)
                }
                else component.emptyForQuery(select_title)
            }, function (a, c) {
                component.empty(network.errorDecode(a, c))
            })
        }
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }

    /**
     * Сброс фильтра
     */
    this.reset = function(){
        component.reset()

        choice = {
            season: 0,
            voice: 0
        }

        extractData(results)

        filter()

        append(filtred())

        component.saveChoice(choice)
    }

    /**
     * Применить фильтр
     * @param {*} type 
     * @param {*} a 
     * @param {*} b 
     */
    this.filter = function(type, a, b){
        choice[a.stype] = b.index

        component.reset()

        extractData(results)

        filter()

        append(filtred())

        component.saveChoice(choice)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        network.clear()

        results = null
    }

    /**
     * Успешно, есть данные
     * @param {Object} json
     */
    function success(json) {
        results = json

        extractData(json)

        filter()

        append(filtred())
    }

    /**
     * Получить информацию о фильме
     * @param {Arrays} data
     */
    function extractData(data) {
        extract = {}

        let pl_links = data.player_links

        if (pl_links.playlist && Object.keys(pl_links.playlist).length > 0) {
            let seas_num = 0

            for (let season in pl_links.playlist) {
                let episode = pl_links.playlist[season]

                ++seas_num

                let transl_id = 0

                for (let voice in episode) {
                    let episode_voice = episode[voice]
                    ++transl_id

                    let items = [],
                        epis_num = 0

                    for (let ID in episode_voice) {
                        let file_episod = episode_voice[ID]

                        ++epis_num

                        let quality_eps = file_episod.qualities.filter(function (qualitys) {
                            return qualitys <= window.filmix.max_qualitie
                        })

                        let max_quality = Math.max.apply(null, quality_eps)
                        let stream_url = file_episod.link.replace('%s.mp4', max_quality + '.mp4')
                        let s_e = stream_url.slice(0 - stream_url.length + stream_url.lastIndexOf('/'))
                        let str_s_e = s_e.match(/s(\d+)e(\d+?)_\d+\.mp4/i)

                        if (str_s_e) {
                            let seas_num = parseInt(str_s_e[1])
                            let epis_num = parseInt(str_s_e[2])

                            items.push({
                                id: seas_num + '_' + epis_num,
                                comment: epis_num + ' ' + Lampa.Lang.translate('torrent_serial_episode') + ' <i>' + ID + '</i>',
                                file: stream_url,
                                episode: epis_num,
                                season: seas_num,
                                quality: max_quality,
                                qualities: quality_eps,
                                translation: transl_id
                            })
                        }
                    }
                    if (!extract[transl_id]) extract[transl_id] = {
                        json: [],
                        file: ''
                    }

                    extract[transl_id].json.push({
                        id: seas_num,
                        comment: seas_num + ' ' + Lampa.Lang.translate('torrent_serial_season'),
                        folder: items,
                        translation: transl_id
                    })
                }
            }
        } 
        
        else if (pl_links.movie && pl_links.movie.length > 0) {
            let transl_id = 0

            for (let ID in pl_links.movie) {
                let file_episod = pl_links.movie[ID]

                ++transl_id

                let quality_eps = file_episod.link.match(/.+\[(.+[\d]),?\].+/i)

                if (quality_eps) quality_eps = quality_eps[1].split(',').filter(function (quality_) {
                    return quality_ <= window.filmix.max_qualitie
                })

                let max_quality = Math.max.apply(null, quality_eps)
                let file_url = file_episod.link.replace(/\[(.+[\d]),?\]/i, max_quality)

                extract[transl_id] = {
                    file: file_url,
                    translation: file_episod.translation,
                    quality: max_quality,
                    qualities: quality_eps
                }
            }
        }
    }


    /**
     * Найти поток
     * @param {Object} element
     * @param {Int} max_quality
     * @returns string
     */
    function getFile(element, max_quality) {
        let translat = extract[element.translation]
        let id       = element.season + '_' + element.episode
        let file     = ''
        let quality  = false

        if (translat) {
            if (element.season)
                for (let i in translat.json) {
                    let elem = translat.json[i]

                    if (elem.folder)
                        for (let f in elem.folder) {
                            let folder = elem.folder[f]

                            if (folder.id == id) {
                                file = folder.file
                                break
                            }
                        } else {
                            if (elem.id == id) {
                                file = elem.file
                                break
                            }
                        }
                } 
                else file = translat.file
        }

        max_quality = parseInt(max_quality)

        if (file) {
            let link = file.slice(0, file.lastIndexOf('_')) + '_'
            let orin = file.split('?')
                orin = orin.length > 1 ? '?'+orin.slice(1).join('?') : ''

            if (file.split('_').pop().replace('.mp4', '') !== max_quality) {
                file = link + max_quality + '.mp4' + orin
            }

            quality = {}

            let mass = [2160, 1440, 1080, 720, 480, 360]

            mass = mass.slice(mass.indexOf(max_quality))

            mass.forEach(function (n) {
                quality[n + 'p'] = link + n + '.mp4' + orin
            })

            let preferably = Lampa.Storage.get('video_quality_default','1080') + 'p'
            
            if(quality[preferably]) file = quality[preferably]
        }

        return {
            file: file,
            quality: quality
        }
    }

    /**
     * Построить фильтр
     */
    function filter(){
        filter_items = {
            season: [],
            voice: [],
            voice_info: []
        }

        if (results.last_episode && results.last_episode.season) {
            let s = results.last_episode.season

            while (s--) {
                filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (results.last_episode.season - s))
            }
        }

        let i = 0;

        for (let Id in results.player_links.playlist) {
            let season = results.player_links.playlist[Id]

            ++i

            let d = 0

            for (let voic in season) {
                ++d

                if (filter_items.voice.indexOf(voic) == -1) {
                    filter_items.voice.push(voic);
                    filter_items.voice_info.push({
                        id: d
                    })
                }
            }
        }

        component.filter(filter_items, choice)
    }

    /**
     * Отфильтровать файлы
     * @returns array
     */
    function filtred(){
        let filtred = [];
        let filter_data = Lampa.Storage.get('online_filter', '{}')

        if (Object.keys(results.player_links.playlist).length) {
            for (let transl in extract) {
                let element = extract[transl];
                for (let season_id in element.json) {
                    let episode = element.json[season_id];
                    if (episode.id == filter_data.season + 1) {
                        episode.folder.forEach(function (media) {
                            if (media.translation == filter_items.voice_info[filter_data.voice].id) {
                                filtred.push({
                                    episode: parseInt(media.episode),
                                    season: media.season,
                                    title: media.episode + (media.title ? ' - ' + media.title : ''),
                                    quality: media.quality + 'p ',
                                    translation: media.translation
                                })
                            }
                        })
                    }
                }
            }
        } 
        else if (Object.keys(results.player_links.movie).length) {
            for (let transl_id in extract) {
                let element = extract[transl_id]

                filtred.push({
                    title: element.translation,
                    quality: element.quality + 'p ',
                    qualitys: element.qualities,
                    translation: transl_id
                })
            }
        }

        return filtred
    }

    /**
     * Добавить видео
     * @param {Array} items 
     */
    function append(items){
        component.reset()

        let viewed = Lampa.Storage.cache('online_view', 5000, [])

        items.forEach(element => {
            if(element.season) element.title = 'S'+element.season + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + element.episode

            element.info = element.season ? ' / ' + Lampa.Utils.shortText(filter_items.voice[choice.voice], 50) : ''

            let hash = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online',element)

            let hash_file = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title,filter_items.voice[choice.voice]].join('') : object.movie.original_title + element.title)

            item.addClass('video--stream')

            element.timeline = view

            item.append(Lampa.Timeline.render(view))

            if(Lampa.Timeline.details){
                item.find('.online__quality').append(Lampa.Timeline.details(view,' / '))
            }

            if(viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')

            item.on('hover:enter',()=>{
                if(object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                let extra = getFile(element, element.quality)

                if(extra.file){
                    let playlist = []
                    let first = {
                        url: extra.file,
                        quality: extra.quality,
                        timeline: view,
                        title: element.season ? element.title : object.movie.title + ' / ' + element.title
                    }

                    if(element.season){
                        items.forEach(elem=>{
                            let ex = getFile(elem, elem.quality)

                            playlist.push({
                                title: elem.title,
                                url: ex.file,
                                quality: ex.quality,
                                timeline: elem.timeline
                            })
                        })
                    }
                    else{
                        playlist.push(first)
                    }

                    if(playlist.length > 1) first.playlist = playlist

                    Lampa.Player.play(first)

                    Lampa.Player.playlist(playlist)

                    if(viewed.indexOf(hash_file) == -1){
                        viewed.push(hash_file)

                        item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')

                        Lampa.Storage.set('online_view', viewed)
                    }
                }
                else Lampa.Noty.show(Lampa.Lang.translate('online_nolink'))
            })

            component.append(item)

            component.contextmenu({
                item,
                view,
                viewed,
                hash_file,
                file: (call)=>{call(getFile(element, element.quality))}
            })
        })

        component.start(true)
    }
}

export default filmix