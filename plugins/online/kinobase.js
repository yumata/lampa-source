function kinobase(component, _object) {
    let network = new Lampa.Reguest()
    let extract = {}
    let embed   = 'https://kinobase.org/'
    let object  = _object

    let select_title = ''
    let select_id = ''

    let filter_items = {}

    let choice = {
        season: 0,
        voice: -1,
        quality: -1
    }

    /**
     * Поиск
     * @param {Object} _object
     * @param {String} kinopoisk_id
     */
    this.search = function (_object, kinopoisk_id) {
        object     = _object

        select_title = object.movie.title

        let url = embed + "search?query=" + encodeURIComponent(cleanTitle(select_title))

        network.native(url, (str) => {
            str = str.replace(/\n/,'')

            let links     = object.movie.number_of_seasons ? str.match(/<a href="\/serial\/(.*?)">(.*?)<\/a>/g) : str.match(/<a href="\/film\/(.*?)" class="link"[^>]+>(.*?)<\/a>/g)
            let relise    = object.search_date || (object.movie.number_of_seasons ? object.movie.first_air_date : object.movie.release_date)
            let need_year = (relise + '').slice(0,4)
            let found_url = ''

            if(links){
                links.forEach((l)=>{
                    let link = $(l),
                        titl = link.attr('title') || link.text()

                    if(titl.indexOf(need_year) !== -1) found_url = link.attr('href')
                })

                if(found_url) getPage(found_url)
                else component.empty("Не нашли подходящего для "+select_title)
            }
            else component.empty("Не нашли "+select_title)
        }, ()=>{
            component.empty()
        }, false,{
            dataType: 'text'
        })
    }

    this.extendChoice = function(saved){
        Lampa.Arrays.extend(choice, saved, true)
    }

    /**
     * Сброс фильтра
     */
    this.reset = function () {
        component.reset()

        choice = {
            season: 0,
            voice: -1
        }

        append(filtred())

        component.saveChoice(choice)
    }

    /**
     * Применить фильтр
     * @param {*} type
     * @param {*} a
     * @param {*} b
     */
    this.filter = function (type, a, b) {
        choice[a.stype] = b.index

        component.reset()

        filter()

        append(filtred())

        component.saveChoice(choice)
    }

    /**
     * Уничтожить
     */
    this.destroy = function () {
        network.clear()

        extract = null
    }

    function cleanTitle(str){
        return str.replace('.', '').replace(':', '')
    }

    function filter(){
        filter_items = {
            season: [],
            voice: [],
            quality: []
        }

        if(object.movie.number_of_seasons){
            if(extract[0].playlist){
                extract.forEach((item)=>{
                    filter_items.season.push(item.comment)
                })
            }
        }
        else{

        }

        component.filter(filter_items, choice)
    }

    function filtred(){
        let filtred = []

        if(object.movie.number_of_seasons){
            let playlist = extract[choice.season].playlist || extract

            let season = parseInt(extract[choice.season].comment)

            playlist.forEach((serial)=>{
                let quality = serial.file.match(/\[(\d+)p\]/g).pop().replace(/\[|\]/g,'')
                let voice   = serial.file.match("{([^}]+)}")

                filtred.push({
                    file: serial.file,
                    title: serial.comment,
                    quality: quality,
                    season: isNaN(season) ? 1 : season,
                    info: voice ? ' / ' + voice[1] : '',
                    subtitles: parseSubs(serial.subtitle || ''),
                })
            })
        }
        else{
            filtred = extract
        }

        return filtred
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

    /**
     * Получить данные о фильме
     * @param {String} str
     */
    function extractData(str, page){
        let vod = str.split('|')

        if(vod[0] == 'file'){
            let file  = str.match("file\\|([^\\|]+)\\|")
            let found = []
            let subtiles = parseSubs(vod[2])
            let quality_type = page.replace(/\n/g,'').replace(/ /g,'').match(/<li><b>Качество:<\/b>(\w+)<\/li>/i)

            if(file){
                str = file[1].replace(/\n/g,'')

                str.split(',').forEach((el)=>{
                    let quality = el.match("\\[(\\d+)p")

                    el.split(';').forEach((el2)=>{
                        let voice = el2.match("{([^}]+)}")
                        let links = voice ? el2.match("}([^;]+)") : el2.match("\\]([^;]+)")

                        found.push({
                            title: object.movie.title,
                            quality: quality[1] + 'p' + (quality_type ? ' - ' + quality_type[1] : ''),
                            voice: voice ? voice[1] : '',
                            stream: links[1].split(' or ')[0],
                            subtitles: subtiles,
                            info: ' '
                        })
                    })
                })
                found.reverse()
            }

            extract = found
        }
        else if(vod[0] == 'pl') extract = Lampa.Arrays.decodeJson(vod[1],[])
        else component.empty()
    }

    function getPage(url){
        network.clear()

        network.timeout(1000 * 10)
        
        network.native(embed+url, (str)=>{
            str = str.replace(/\n/g, '')

            let MOVIE_ID = str.match('var MOVIE_ID = ([^;]+);')
            let VOD_HASH = str.match('var VOD_HASH = "([^"]+)"')
            let VOD_TIME = str.match('var VOD_TIME = "([^"]+)"')

            if (MOVIE_ID && VOD_TIME && VOD_HASH) {
                select_id = MOVIE_ID[1]

                let vod_hash = VOD_HASH[1]
                let vod_time = VOD_TIME[1]

                let file_url = "vod/" + select_id
                    file_url = Lampa.Utils.addUrlComponent(file_url, "st=" + vod_hash)
                    file_url = Lampa.Utils.addUrlComponent(file_url, "e=" + vod_time)

                network.clear()

                network.timeout(1000 * 10)

                network.native(embed + file_url, (files) => {
                    component.loading(false)

                    extractData(files, str)

                    filter()

                    append(filtred())
                }, () => {
                    component.empty()
                }, false, {
                    dataType: 'text'
                })
            } else component.empty()
        },()=>{
            component.empty()
        }, false, {
            dataType: 'text'
        })
    }

    function getFile(element){
        if(element.stream) return element.stream

        let quality = {},
            first   = ''

        element.file.split(',').reverse().forEach(file=>{
            let q = file.match("\\[(\\d+)p")

            if(q){
                quality[q[1]+'p'] = file.replace(/\[\d+p\]/,'').replace(/{([^}]+)}/,'').split(' or ')[0]

                if(!first || q[1] == '1080') first = quality[q[1]+'p']
            }
        })

        element.stream    = first
        element.qualitys  = quality

        return element.stream
    }

    /**
     * Показать файлы
     */
    function append(items) {
        component.reset()

        let viewed = Lampa.Storage.cache('online_view', 5000, [])

        console.log(extract)

        items.forEach((element, index) => {
            if(element.season) element.title = 'S'+element.season + ' / ' + element.title
            if(element.voice)  element.title = element.voice

            if(typeof element.episode == 'undefined') element.episode = index + 1

            let hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online', element)

            let hash_file = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title,element.title,'kinobase'].join('') : object.movie.original_title + element.quality + 'kinobase')

            element.timeline = view

            item.append(Lampa.Timeline.render(view))

            if(Lampa.Timeline.details){
                item.find('.online__quality').append(Lampa.Timeline.details(view,' / '))
            }

            if(viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')

            item.on('hover:enter', () => {
                if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                getFile(element)

                if(element.stream){
                    let playlist = []
                    let first = {
                        url: element.stream,
                        timeline: view,
                        title: element.season ? element.title : (element.voice ? object.movie.title + ' / ' + element.title : element.title),
                        subtitles: element.subtitles,
                        quality: element.qualitys
                    }

                    if(element.season){
                        items.forEach(elem=>{
                            getFile(elem)

                            playlist.push({
                                title: elem.title,
                                url: elem.stream,
                                timeline: elem.timeline,
                                subtitles: elem.subtitles,
                                quality: elem.qualitys
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
                else Lampa.Noty.show('Не удалось извлечь ссылку')
            })

            component.append(item)

            component.contextmenu({
                item,
                view,
                viewed,
                hash_file
            })
        })

        component.start(true)
    }
}

export default kinobase