function collaps(component, _object){
    let network    = new Lampa.Reguest()
    let extract    = {}
    let embed      = 'https://api.delivembd.ws/embed/'
    let object     = _object

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

        let url = embed + 'kp/' + kinopoisk_id

        network.silent(url, (str) => {
            if(str){
                parse(str)
            }
            else component.empty("Не нашли "+select_title)

            component.loading(false)
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
     this.reset = function(){
        component.reset()

        choice = {
            season: 0,
            voice: 0
        }

        component.loading(true)

        getFilm(select_id)

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

        filter()

        append(filtred())

        component.saveChoice(choice)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        network.clear()

        extract = null
    }

    

    function parse(str){
        str = str.replace(/\n/g,'')

        let find = str.match('makePlayer\\({(.*?)}\\);')

        if(find){
            let json

            try{
                json = eval('({'+find[1]+'})')
            }
            catch(e){}

            if(json){
                extract = json

                filter()

                append(filtred())
            }
            else component.empty("Не нашли "+select_title)
        }
    }

    /**
     * Построить фильтр
     */
     function filter(){
        filter_items = {
            season: [],
            voice: [],
            quality: []
        }

        if(extract.playlist){
            if(extract.playlist.seasons){
                extract.playlist.seasons.forEach((season)=>{
                    filter_items.season.push('Сезон ' + season.season)
                })
            }
        }
        else{

        }

        component.filter(filter_items, choice)
    }

    /**
     * Отфильтровать файлы
     * @returns array
     */
     function filtred(){
        let filtred = []

        let filter_data = Lampa.Storage.get('online_filter','{}')
        
        if(extract.playlist){
            extract.playlist.seasons.forEach((season, i)=>{
                if(i == filter_data.season){
                    season.episodes.forEach(episode=>{
                        filtred.push({
                            file: episode.hls,
                            episode: parseInt(episode.episode),
                            season: season.season,
                            title: episode.title,
                            quality: '',
                            info: episode.audio.names.slice(0,5).join(', '),
                            subtitles: episode.cc ? episode.cc.map(c=>{ return {label: c.name, url: c.url}}) : false
                        })
                    })
                }
            })

        }
        else if(extract.source){
            let resolution  = Lampa.Arrays.getKeys(extract.qualityByWidth).pop()
            let max_quality = extract.qualityByWidth[resolution] || 0
            
            filtred.push({
                file: extract.source.hls,
                title: extract.title,
                quality: max_quality ? max_quality + 'p / ' : '',
                info: extract.source.audio.names.slice(0,5).join(', '),
                subtitles: extract.source.cc ? extract.source.cc.map(c=>{ return {label: c.name, url: c.url}}) : false
            })
        }

        return filtred
    }

    /**
     * Показать файлы
     */
     function append(items) {
        component.reset()

        let viewed = Lampa.Storage.cache('online_view', 5000, [])

        items.forEach(element => {
            let hash = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online', element)

            let hash_file = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title,element.title].join('') : object.movie.original_title + 'collaps')

            element.timeline = view

            item.append(Lampa.Timeline.render(view))

            if(Lampa.Timeline.details){
                item.find('.online__quality').append(Lampa.Timeline.details(view,' / '))
            }

            if(viewed.indexOf(hash_file) !== -1) item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')

            item.on('hover:enter', () => {
                if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                if(element.file){
                    let playlist = []
                    let first = {
                        url: element.file,
                        timeline: view,
                        title: element.season ? element.title : (element.voice ? object.movie.title + ' / ' + element.title : element.title),
                        subtitles: element.subtitles
                    }

                    

                    if(element.season){
                        items.forEach(elem=>{
                            playlist.push({
                                title: elem.title,
                                url: elem.file,
                                timeline: elem.timeline,
                                subtitles: elem.subtitles
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

export default collaps