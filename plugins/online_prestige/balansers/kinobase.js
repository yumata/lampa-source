function kinobase(component, _object) {
    let network = new Lampa.Reguest()
    let extract = {}
    let embed   = component.proxy('kinobase') +  'https://kinobase.org/'
    let object  = _object

    let select_title = ''
    let select_id    = ''
    let is_playlist  = false
    let translation  = ''
    let quality_type = ''

    let filter_items = {}
    let wait_similars

    let choice = {
        season: 0,
        voice: -1,
    }

    this.search = function (_object, sim) {
        if(wait_similars && sim) return getPage(sim[0].link)
    }

    this.searchByTitle = function (_object, query) {
        object = _object

        select_title = query

        let url = embed + "search?query=" + encodeURIComponent(cleanTitle(select_title))

        network.native(url, (str) => {
            str = str.replace(/\n/,'')

            let links     = object.movie.number_of_seasons ? str.match(/<a href="\/serial\/(.*?)">(.*?)<\/a>/g) : str.match(/<a href="\/film\/(.*?)" class="link"[^>]+>(.*?)<\/a>/g)
            let relise    = object.search_date || (object.movie.number_of_seasons ? object.movie.first_air_date : object.movie.release_date) || '0000'
            let need_year = parseInt((relise + '').slice(0,4))
            let found_url = ''

            if(links){
                let cards = []
                
                links.filter(l=>{
                    let link = $(l),
                        titl = link.attr('title') || link.text() || ''

                    let year = parseInt(titl.split('(').pop().slice(0,-1))
    
                    if(year > need_year - 2 && year < need_year + 2) cards.push({
                        year,
                        title: titl.split(/\(\d{4}\)/)[0].trim(),
                        link: link.attr('href')
                    })
                })

                let card = cards.find(c=>c.year == need_year)

                if(!card) card = cards.find(c=>c.title == select_title)

                if(!card && cards.length == 1) card = cards[0]

                if(card) found_url = cards[0].link

                if(found_url) getPage(found_url)
                else if(links.length) {
                    wait_similars = true

                    let similars = []

                    links.forEach(l=>{
                        let link = $(l),
                            titl = link.attr('title') || link.text()

                        similars.push({
                            title: titl,
                            link: link.attr('href'),
                            filmId: 'similars'
                        })
                    })

                    component.similars(similars)
                    component.loading(false)
                }
                else component.doesNotAnswer()
            }
            else component.doesNotAnswer()
        }, (a,c)=>{
            component.doesNotAnswer()
        }, false,{
            dataType: 'text'
        })
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }

    this.reset = function () {
        component.reset()

        choice = {
            season: 0,
            voice: -1
        }

        filter()

        append(filtred())
    }

    this.filter = function (type, a, b) {
        choice[a.stype] = b.index

        component.reset()

        filter()

        append(filtred())
    }

    this.destroy = function () {
        network.clear()

        extract = null
    }

    function cleanTitle(str){
        return str.replace('.', '').replace(':', '')
    }

    function parsePlaylist(str) {
        let pl = []

        try {
            if (str.charAt(0) === '[') {
                str.substring(1).split(',[').forEach(function(item) {
                    let label_end = item.indexOf(']')

                    if (label_end >= 0) {
                        let label = item.substring(0, label_end)

                        if (item.charAt(label_end + 1) === '{') {
                            item.substring(label_end + 2).split(';{').forEach(function(voice_item) {
                                let voice_end = voice_item.indexOf('}')

                                if (voice_end >= 0) {
                                    let voice = voice_item.substring(0, voice_end)

                                    pl.push({
                                        label: label,
                                        voice: voice,
                                        links: voice_item.substring(voice_end + 1).split(' or ')
                                    });
                                }
                            })
                        }
                        else {
                            pl.push({
                                label: label,
                                links: item.substring(label_end + 1).split(' or ')
                            })
                        }
                    }

                    return null
                })
            }
        } 
        catch (e) {}

        return pl
    }
    
    function filter() {
        filter_items = {
            season: [],
            voice: []
        }

        if (is_playlist) {
            extract.forEach(function(item, i) {
                if (item.playlist) {
                    filter_items.season.push(item.comment)

                    if (i == choice.season) {
                        item.playlist.forEach(function(eps) {
                            if (eps.file) {
                                parsePlaylist(eps.file).forEach(function(el) {
                                    if (el.voice && filter_items.voice.indexOf(el.voice) == -1) {
                                        filter_items.voice.push(el.voice)
                                    }
                                })
                            }
                        })
                    }
                } 
                else if (item.file) {
                    parsePlaylist(item.file).forEach(function(el) {
                        if (el.voice && filter_items.voice.indexOf(el.voice) == -1) {
                            filter_items.voice.push(el.voice)
                        }
                    })
                }
            })
        }

        if (!filter_items.season[choice.season]) choice.season = 0
        if (!filter_items.voice[choice.voice])   choice.voice  = 0

        component.filter(filter_items, choice)
    }

    function filtred() {
        let filtred = []

        if (is_playlist) {
            let playlist = extract
            let season = object.movie.number_of_seasons && 1

            if (extract[choice.season] && extract[choice.season].playlist) {
                playlist = extract[choice.season].playlist
                season = parseInt(extract[choice.season].comment)

                if (isNaN(season)) season = 1
            }

            playlist.forEach(function(eps, episode) {
                let items = extractItems(eps.file, filter_items.voice[choice.voice])

                if (items.length) {
                    let alt_voice = eps.comment.match(/\d+ серия (.*)$/i)
                    let info = items[0].voice || (alt_voice && alt_voice[1].trim()) || translation

                    if (info == eps.comment) info = ''

                    filtred.push({
                        file: eps.file,
                        title: eps.comment,
                        quality: (quality_type && window.innerWidth > 480 ? quality_type + ' - ' : '') + items[0].quality + 'p',
                        season: season,
                        episode: episode + 1,
                        info: info,
                        voice: items[0].voice,
                        voice_name: info,
                        subtitles: parseSubs(eps.subtitle || '')
                    })
                }
            })
        } 
        else {
            filtred = extract
        }

        return filtred
    }

    function extractItems(str, voice) {
        try {
            let list = parsePlaylist(str)

            if (voice) {
                let tmp = list.filter(function(el) {
                    return el.voice == voice
                });
                if (tmp.length) {
                    list = tmp
                } else {
                    list = list.filter(function(el) {
                        return typeof el.voice == 'undefined'
                    })
                }
            }

            let items = list.map(function(item) {
                let quality = item.label.match(/(\d\d\d+)p/)

                return {
                    label: item.label,
                    voice: item.voice,
                    quality: quality ? parseInt(quality[1]) : NaN,
                    file: item.links[0]
                }
            })

            items.sort(function(a, b) {
                if (b.quality > a.quality) return 1
                if (b.quality < a.quality) return -1
                if (b.label > a.label) return 1
                if (b.label < a.label) return -1
                return 0
            })

            return items
        } 
        catch (e) {}

        return []
    }

    function parseSubs(vod){
        let subtitles = []

        vod.split(',').forEach((s)=>{
            let nam = s.match("\\[(.*?)]")

            if(nam){
                let url = s.replace(/\[.*?\]/,'').split(' or ')[0]

                if(url){
                    subtitles.push({
                        label: nam[1],
                        url: url
                    })
                }
            }
        })

        return subtitles.length ? subtitles : false
    }

    function extractData(str, page) {
        let quality_match = page.match(/<li><b>Качество:<\/b>([^<,]+)<\/li>/i)
        let translation_match = page.match(/<li><b>Перевод:<\/b>([^<,]+)<\/li>/i)

        quality_type = quality_match ? quality_match[1].trim() : ''
        translation = translation_match ? translation_match[1].trim() : ''

        let vod = str.split('|')

        if (vod[0] == 'file') {
            let file  = vod[1]
            let found = []
            let subtiles = parseSubs(vod[2])

            if (file) {
                let voices = {}

                parsePlaylist(file).forEach(function(item) {
                    let prev = voices[item.voice || '']
                    let quality_str = item.label.match(/(\d\d\d+)p/)
                    let quality = quality_str ? parseInt(quality_str[1]) : NaN

                    if (!prev || quality > prev.quality) {
                        voices[item.voice || ''] = {
                            quality: quality
                        }
                    }
                })

                for (let voice in voices) {
                    let el = voices[voice]

                    found.push({
                        file: file,
                        title: voice || translation || object.movie.title,
                        quality: (quality_type && window.innerWidth > 480 ? quality_type + ' - ' : '') + el.quality + 'p',
                        info: '',
                        voice: voice,
                        subtitles: subtiles,
                        voice_name: voice || translation || ''
                    })
                }
            }

            extract = found

            is_playlist = false
        }
        else if (vod[0] == 'pl') {
            extract = Lampa.Arrays.decodeJson(vod[1], [])

            is_playlist = true;
        }
        else component.emptyForQuery(select_title)
    }

    
    function getPage(url){
        network.clear()

        network.timeout(1000 * 10)
        
        network.native(embed+url, (str)=>{
            str = str.replace(/\n/g, '')

            let MOVIE_ID = str.match('var MOVIE_ID = ([^;]+);')
            let IDENTIFIER = str.match('var IDENTIFIER = "([^"]+)"')
            let PLAYER_CUID = str.match('var PLAYER_CUID = "([^"]+)"')

            if (MOVIE_ID && IDENTIFIER && PLAYER_CUID) {
                select_id = MOVIE_ID[1]

                let identifier  = IDENTIFIER[1]
                let player_cuid = PLAYER_CUID[1]


                let data_url = "user_data"
                    data_url = Lampa.Utils.addUrlComponent(data_url, "page=movie")
                    data_url = Lampa.Utils.addUrlComponent(data_url, "movie_id=" + select_id)
                    data_url = Lampa.Utils.addUrlComponent(data_url, "cuid=" + player_cuid)
                    data_url = Lampa.Utils.addUrlComponent(data_url, "device=DESKTOP")
                    data_url = Lampa.Utils.addUrlComponent(data_url, "_="+Date.now())

                network.clear()

                network.timeout(1000 * 10)

                network.native(embed + data_url, (user_data) => {
                    if (typeof user_data.vod_hash == "string") {
                        let file_url = "vod/" + select_id
                            file_url = Lampa.Utils.addUrlComponent(file_url, "identifier=" + identifier)
                            file_url = Lampa.Utils.addUrlComponent(file_url, "player_type=new")
                            file_url = Lampa.Utils.addUrlComponent(file_url, "file_type=mp4")
                            file_url = Lampa.Utils.addUrlComponent(file_url, "st=" + user_data.vod_hash)
                            file_url = Lampa.Utils.addUrlComponent(file_url, "e=" + user_data.vod_time)
                            file_url = Lampa.Utils.addUrlComponent(file_url, "_="+Date.now())

                        network.clear()

                        network.timeout(1000 * 10)

                        network.native(embed + file_url, (files) => {
                            component.loading(false)

                            extractData(files, str)

                            filter()

                            append(filtred())
                        }, (a, c) => {
                            component.doesNotAnswer()
                        }, false, {
                            dataType: 'text'
                        })
                    }
                    else component.doesNotAnswer(L)

                }, (a,c) => {
                    component.doesNotAnswer()
                })

            }
            else component.doesNotAnswer()
        },(a,c)=>{
            component.doesNotAnswer()
        }, false, {
            dataType: 'text'
        })
    }
    
    function getFile(element){
        let quality = {},
            first   = ''

        let preferably = Lampa.Storage.get('video_quality_default','1080')

        element.file.split(',').reverse().forEach(file=>{
            let q = file.match("\\[(\\d+)p")

            if(q){
                quality[q[1]+'p'] = file.replace(/\[\d+p\]/,'').replace(/{([^}]+)}/,'').split(' or ')[0]

                if(!first || q[1] == preferably) first = quality[q[1]+'p']
            }
        })

        element.stream    = first
        element.qualitys  = quality

        return {
            file: first,
            quality: quality
        }
    }
    
    function toPlayElement(element){
        getFile(element)

        let play  = {
            url: element.stream,
            timeline: element.timeline,
            title: element.title,
            subtitles: element.subtitles,
            quality: element.qualitys,
            callback: element.mark
        }

        return play
    }

    function append(items) {
        component.reset()

        component.draw(items,{
            similars: wait_similars,
            onEnter: (item, html)=>{
                getFile(item)

                if(item.stream){
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
                call(getFile(item))
            }
        })
    }
}

export default kinobase