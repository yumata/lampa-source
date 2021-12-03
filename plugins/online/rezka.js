function create(component){
    let network    = new Lampa.Reguest()
    let object     = {}
    let extract    = {}
    let embed      = 'https://voidboost.net/'

    let select_title = ''
    let select_id    = ''
    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0
    }

    /**
     * Поиск
     * @param {Object} _object 
     */
    this.search = function(_object, kinopoisk_id){
        object = _object
        
        select_id    = kinopoisk_id
        select_title = object.movie.title

        getFilm(kinopoisk_id)
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

        component.loading(true)

        getFilm(select_id)
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

        filter()

        component.loading(true)

        getFilm(select_id, extract.voice[choice.voice].token)

        setTimeout(component.closeFilter,10)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        network.clear()

        extract = null
    }

    function getSeasons(voice, call){
        let url = embed + 'serial/'+voice+'/iframe?h=gidonline.io'

        network.clear()
        network.timeout(10000)

        network.native(url,(str)=>{
            extractData(str)

            call()
        },()=>{
            component.empty()
        },false,{
            dataType: 'text'
        })
    }

    function getEmbed(url){
        network.clear()
        network.timeout(10000)

        network.native(url,(str)=>{
            component.loading(false)

            extractData(str)

            filter()

            append()
        },()=>{
            component.empty()
        },false,{
            dataType: 'text'
        })
    }

    /**
     * Запросить фильм
     * @param {Int} id 
     * @param {String} voice 
     */
    function getFilm(id, voice){
        network.clear()

        network.timeout(10000)

        let url = embed

        if(voice){
            if(extract.season.length){
                let ses = extract.season[choice.season].id

                url += 'serial/'+voice+'/iframe?s='+ses+'&h=gidonline.io'

                return getSeasons(voice, ()=>{
                    let check = extract.season.filter(s=>s.id == ses)

                    if(!check.length){
                        choice.season = extract.season.length - 1

                        url = embed + 'serial/'+voice+'/iframe?s='+extract.season[choice.season].id+'&h=gidonline.io'
                    } 
                    
                    getEmbed(url)
                })
            }
            else{
                url += 'movie/'+voice+'/iframe?h=gidonline.io'

                getEmbed(url)
            }
        }
        else{
            url += 'embed/'+id
            url += '?s=1'

            getEmbed(url)
        }
    }

    /**
     * Построить фильтр
     */
     function filter(){
        filter_items  = {
            season: extract.season.map(v=>v.name),
            voice: extract.season.length ? extract.voice.map(v=>v.name) : []
        }
        
        component.filter(filter_items, choice)
    }

    /**
     * Получить поток
     * @param {*} element 
     */
    function getStream(element, call, error){
        if(element.stream) return call(element.stream)

        let url = embed

        if(element.season){
            if(choice.voice){
                url += 'serial/'+extract.voice[choice.voice].token+'/iframe?s='+element.season+'&e='+element.episode+'&h=gidonline.io'
            }
            else{
                url += 'embed/' + select_id + '?s=1&e='+element.episode+'&h=gidonline.io'
            }
        }
        else{
            url += 'movie/'+element.voice.token+'/iframe?h=gidonline.io'
        }

        network.clear()

        network.timeout(3000)

        network.native(url,(str)=>{
            var videos = str.match("file': '(.*?)'")

            if(videos){
                let link = videos[0].match("2160p](.*?)mp4")

                if(!link) link = videos[0].match("1440p](.*?)mp4")
                if(!link) link = videos[0].match("1080p Ultra](.*?)mp4")
                if(!link) link = videos[0].match("1080p](.*?)mp4")
                if(!link) link = videos[0].match("720p](.*?)mp4")
                if(!link) link = videos[0].match("480p](.*?)mp4")
                if(!link) link = videos[0].match("360p](.*?)mp4")
                if(!link) link = videos[0].match("240p](.*?)mp4")

                if(link){
                    element.stream = link[1]+'mp4'

                    call(link[1]+'mp4')
                }
                else error()
            }
            else error()

        },error,false,{
            dataType: 'text'
        })
    }

    /**
     * Получить данные о фильме
     * @param {String} str 
     */
    function extractData(str){
        extract.voice   = []
        extract.season  = []
        extract.episode = []

        str = str.replace(/\n/g,'')

        let voices = str.match('<select name="translator"[^>]+>(.*?)</select>')
        let sesons = str.match('<select name="season"[^>]+>(.*?)</select>')
        let episod = str.match('<select name="episode"[^>]+>(.*?)</select>')

        if(sesons){
            let select = $('<select>'+sesons[1]+'</select>')

            $('option',select).each(function(){
                extract.season.push({
                    id: $(this).attr('value'),
                    name: $(this).text()
                })
            })
        }

        if(voices){
            let select = $('<select>'+voices[1]+'</select>')

            $('option',select).each(function(){
                let token = $(this).attr('data-token')

                if(token || extract.season.length){
                    extract.voice.push({
                        token: token,
                        name: $(this).text()
                    })
                }
            })
        }

        if(episod){
            let select = $('<select>'+episod[1]+'</select>')

            $('option',select).each(function(){
                extract.episode.push({
                    id: $(this).attr('value'),
                    name: $(this).text()
                })
            })
        }
    }

    /**
     * Показать файлы
     */
    function append(){
        component.reset()

        let items = []

        if(extract.season.length){
            extract.episode.forEach(episode=>{
                items.push({
                    title: 'S' + extract.season[choice.season].id + ' / ' + episode.name,
                    quality: '720p ~ 1080p',
                    season: extract.season[choice.season].id,
                    episode: parseInt(episode.id),
                    info: ' / ' + extract.voice[choice.voice].name
                })
            })
        }
        else{
            extract.voice.forEach(voice => {
                items.push({
                    title: voice.name.length > 3 ? voice.name : select_title,
                    quality: '720p ~ 1080p',
                    voice: voice,
                    info: ''
                })
            })
        }

        items.forEach(element => {
            let hash = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online',element)

            element.timeline = view

            item.append(Lampa.Timeline.render(view))

            item.on('hover:enter',()=>{
                if(object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                getStream(element,(stream)=>{
                    let first = {
                        url: stream,
                        timeline: view,
                        title: element.title
                    }

                    Lampa.Player.play(first)

                    Lampa.Player.playlist([first])
                },()=>{
                    Lampa.Noty.show('Не удалось извлечь ссылку')
                })
            })

            component.append(item)
        })

        component.start(true)
    }
}

export default create