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
     * @param {Array} _item
     */
    this.search = function (_object, _item) {
        object     = _object

        select_title = object.movie.title

        let url = embed + "search?query=" + encodeURIComponent(cleanTitle(select_title))

        network.silent(url, (str) => {
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

                filtred.push({
                    file: serial.file,
                    title: serial.comment,
                    quality: quality,
                    season: isNaN(season) ? 1 : season,
                    info: ''
                })
            })
        }
        else{
            filtred = extract
        }

        return filtred
    }

    /**
     * Получить данные о фильме
     * @param {String} str
     */
    function extractData(str){
        let vod = str.split('|')

        if(vod[0] == 'file'){
            let file  = str.match("file\\|([^\\|]+)\\|")
            let found = []

            if(file){
                str = file[1].replace(/\n/g,'')

                str.split(',').forEach((el)=>{
                    let quality = el.match("\\[(\\d+)p")

                    el.split(';').forEach((el2)=>{
                        let voice = el2.match("{([^}]+)}")
                        let links = voice ? el2.match("}([^;]+)") : el2.match("\\]([^;]+)")

                        found.push({
                            title: object.movie.title,
                            quality: quality[1] + 'p',
                            voice: voice ? voice[1] : '',
                            stream: links[1].split(' or ')[0],
                            info: ''
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
        
        network.silent(embed+url, (str)=>{
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

                network.silent(embed + file_url, (str) => {
                    component.loading(false)

                    extractData(str)

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

        let link = element.file.match("2160p](.*?) or")

        if(!link) link = element.file.match("1440p](.*?) or")
        if(!link) link = element.file.match("1080p](.*?) or")
        if(!link) link = element.file.match("720p](.*?) or")
        if(!link) link = element.file.match("480p](.*?) or")
        if(!link) link = element.file.match("360p](.*?) or")
        if(!link) link = element.file.match("240p](.*?) or")
        
        if(link) return link[1]
    }

    /**
     * Показать файлы
     */
    function append(items) {
        component.reset()
        items.forEach(element => {
            if(element.season) element.title = 'S'+element.season + ' / ' + element.title
            if(element.voice)  element.title = element.voice

            let hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online', element)

            element.timeline = view

            item.append(Lampa.Timeline.render(view))

            item.on('hover:enter', () => {
                if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                let file = getFile(element)

                if(file){
                    let playlist = []
                    let first = {
                        url: file,
                        timeline: view,
                        title: element.season ? element.title : (element.voice ? object.movie.title + ' / ' + element.title : element.title) 
                    }

                    Lampa.Player.play(first)

                    if(element.season){
                        items.forEach(elem=>{
                            playlist.push({
                                title: elem.title,
                                url: getFile(elem),
                                timeline: elem.timeline
                            })
                        })
                    }
                    else{
                        playlist.push(first)
                    }

                    Lampa.Player.playlist(playlist)
                }
                else Lampa.Noty.show('Не удалось извлечь ссылку')
            })

            component.append(item)
        })

        component.start(true)
    }
}

export default kinobase