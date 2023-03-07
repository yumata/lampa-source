function filmix(component, _object){
    let network  = new Lampa.Reguest()
    let extract  = {}
    let results  = []
    let object   = _object
    let embed    = 'http://filmixapp.cyou/api/v2/';
    let wait_similars

    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0,
        voice_name: ''
    }

    let token = Lampa.Storage.get('filmix_token','')

    if (!window.filmix){
        window.filmix = {
            max_qualitie: 480,
            is_max_qualitie: false
        }
    }
    else{
        if(window.filmix.max_qualitie == 720) window.filmix.max_qualitie = 480
    }

    let dev_token = 'user_dev_apk=2.0.1&user_dev_id=&user_dev_name=Xiaomi&user_dev_os=11&user_dev_token='+token+'&user_dev_vendor=Xiaomi'

    this.search = function(_object, sim){
        if(wait_similars) this.find(sim[0].id)
    }

    this.searchByTitle = function(_object, query){
        object  = _object

        let year = parseInt((object.movie.release_date || object.movie.first_air_date || '0000').slice(0,4))
        let orig = object.movie.original_title || object.movie.original_name

        let url = embed + 'search'
            url = Lampa.Utils.addUrlComponent(url, 'story=' + encodeURIComponent(query))
            url = Lampa.Utils.addUrlComponent(url, dev_token)

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
                wait_similars = true

                component.similars(json)
                component.loading(false)
            }
            else component.doesNotAnswer()
        }, (a, c)=> {
            component.doesNotAnswer()
        })
    }

    this.find = function (filmix_id) {
        let url = embed

        if (!window.filmix.is_max_qualitie && token) {
            window.filmix.is_max_qualitie = true

            network.clear()
            network.timeout(10000)
            network.silent(url + 'user_profile?' + dev_token, function (found) {
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
            network.silent((window.filmix.is_max_qualitie ? url + 'post/' + filmix_id : url + 'post/' + filmix_id) + '?' + dev_token, function (found) {
                if (found && Object.keys(found).length) {
                    success(found)

                    component.loading(false)
                }
                else component.doesNotAnswer()
            }, function (a, c) {
                component.doesNotAnswer()
            })
        }
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }

    this.reset = function(){
        component.reset()

        choice = {
            season: 0,
            voice: 0,
            voice_name: ''
        }

        extractData(results)

        filter()

        append(filtred())
    }

    this.filter = function(type, a, b){
        choice[a.stype] = b.index

        if(a.stype == 'voice') choice.voice_name = filter_items.voice[b.index]

        component.reset()

        extractData(results)

        filter()

        append(filtred()) 
    }

    this.destroy = function(){
        network.clear()

        results = null
    }

    function success(json) {
        results = json

        extractData(json)

        filter()

        append(filtred())
    }

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

        if(choice.voice_name){
            let inx = filter_items.voice.map(v=>v.toLowerCase()).indexOf(choice.voice_name.toLowerCase())
            
            if(inx == -1) choice.voice = 0
            else if(inx !== choice.voice){
                choice.voice = inx
            }
        }

        component.filter(filter_items, choice)
    }

    function filtred(){
        let filtred = []
        
        if (Object.keys(results.player_links.playlist).length) {
            for (let transl in extract) {
                let element = extract[transl];
                for (let season_id in element.json) {
                    let episode = element.json[season_id];
                    if (episode.id == choice.season + 1) {
                        episode.folder.forEach(function (media) {
                            if (media.translation == filter_items.voice_info[choice.voice].id) {
                                filtred.push({
                                    episode: parseInt(media.episode),
                                    season: media.season,
                                    title: Lampa.Lang.translate('torrent_serial_episode') + ' ' +  media.episode + (media.title ? ' - ' + media.title : ''),
                                    quality: media.quality + 'p ',
                                    translation: media.translation,
                                    voice_name: filter_items.voice[choice.voice],
                                    info: filter_items.voice[choice.voice]
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
                    translation: transl_id,
                    voice_name: element.translation
                })
            }
        }

        return filtred
    }

    function toPlayElement(element){
        let extra = getFile(element, element.quality)
        let play  = {
            title: element.title,
            url: extra.file,
            quality: extra.quality,
            timeline: element.timeline,
            callback: element.mark
        }

        return play
    }

    function append(items){
        component.reset()

        component.draw(items,{
            similars: wait_similars,
            onEnter: (item, html)=>{
                let extra = getFile(item, item.quality)

                if(extra.file){
                    let playlist = []
                    let first = toPlayElement(item)

                    if(item.season){
                        items.forEach(elem=>{
                            playlist.push(toPlayElement(elem))
                        })
                    }
                    else{
                        playlist.push(first)
                    }

                    if(playlist.length > 1) first.playlist = playlist

                    Lampa.Player.play(first)

                    Lampa.Player.playlist(playlist)

                    item.mark()
                }
                else Lampa.Noty.show(Lampa.Lang.translate('online_nolink'))
            },
            onContextMenu: (item, html, data, call)=>{
                call(getFile(item, item.quality))
            }
        })
    }
}

export default filmix