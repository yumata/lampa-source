function component(object){
    let network = new Lampa.Reguest()
    let scroll  = new Lampa.Scroll({mask:true,over: true})
    let files   = new Lampa.Files(object)
    let filter  = new Lampa.Filter(object)
    let results = []
    let filtred = []
    let extract = {}
    let token   = '3i40G5TSECmLF77oAqnEgbx61ZWaOYaE'

    let total_pages = 1
    let count       = 0
    let last
    let last_filter

    let filter_items = {
        season: [],
        voice: [],
        voice_info: []
    }

    let filter_translate = {
        season: 'Сезон',
        voice: 'Перевод',
    }

    scroll.minus()

    scroll.body().addClass('torrent-list')

    this.create = function(){
        this.activity.loader(true)

        Lampa.Background.immediately(Lampa.Utils.cardImgBackground(object.movie))
        
        let url = 'https://videocdn.tv/api/'+(object.movie.number_of_seasons ? 'tv-series' : 'movies')

        url = Lampa.Utils.addUrlComponent(url,'api_token='+token)
        url = Lampa.Utils.addUrlComponent(url,'query='+encodeURIComponent(object.search))

        if(object.movie.release_date && object.movie.release_date !== '0000') url = Lampa.Utils.addUrlComponent(url,'year='+((object.movie.release_date+'').slice(0,4)))
        
        network.silent(url,(json)=>{
            if(json.data && json.data.length){
                results = json.data

                this.build()

                this.activity.loader(false)

                this.activity.toggle()
            }
            else this.empty('Ой, мы не нашли ('+object.search+')')
        },(a, c)=>{
            this.empty('Ответ: ' + network.errorDecode(a,c))
        })

        filter.onSearch = (value)=>{
            Lampa.Activity.replace({
                search: value,
                clarification: true
            })
        }

        filter.onBack = ()=>{
            this.start()
        }

        filter.render().find('.selector').on('hover:focus',(e)=>{
            last_filter = e.target
        })

        filter.render().find('.filter--sort').remove()

        return this.render()
    }

    this.empty = function(descr){
        let empty = new Lampa.Empty({
            descr: descr
        })

        files.append(empty.render(filter.empty()))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    

    this.buildFilterd = function(select_season){
        let select = []

        let add = (type, title)=>{
            let need     = Lampa.Storage.get('online_filter','{}')
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

        filter_items.voice  = []
        filter_items.season = []
        filter_items.voice_info = []

        let choice = {
            season: 0,
            voice: 0
        }

        results.slice(0,1).forEach(movie => {
            if(movie.season_count){
                let s = movie.season_count

                while(s--){
                    filter_items.season.push('Сезон ' + (movie.season_count - s))
                }

                choice.season = typeof select_season == 'undefined' ? filter_items.season.length - 1 : select_season
            }

            if(filter_items.season.length){
                movie.episodes.forEach(episode=>{
                    if(episode.season_num == choice.season + 1){
                        episode.media.forEach(media=>{
                            if(filter_items.voice.indexOf(media.translation.smart_title) == -1){
                                filter_items.voice.push(media.translation.smart_title)
                                filter_items.voice_info.push({
                                    id: media.translation.id
                                })
                            }
                        })
                    }
                })
            }
            else{
                movie.translations.forEach(element=>{
                    filter_items.voice.push(element.smart_title)
                    filter_items.voice_info.push({
                        id: element.id
                    })
                })
            }
        })

        Lampa.Storage.set('online_filter', object.movie.number_of_seasons ? choice : {})

        select.push({
            title: 'Сбросить фильтр',
            reset: true
        })

        if(object.movie.number_of_seasons){
            add('voice','Перевод')
            add('season', 'Сезон')
        }

        filter.set('filter', select)

        this.selectedFilter()
    }

    this.selectedFilter = function(){
        let need   = Lampa.Storage.get('online_filter','{}'),
            select = []

        for(let i in need){
            select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
        }

        filter.chosen('filter', select)
    }

    this.extractFile = function(str){
        let url = ''

        try{
            let items = str.split(',').map(item=>{
                return {
                    quality: parseInt(item.match(/\[(\d+)p\]/)[1]),
                    file: item.replace(/\[\d+p\]/,'').split(' or ')[0]
                }
            })

            items.sort((a,b)=>{
                return b.quality - a.quality
            })

            console.log(items)

            url = items[0].file
            url = 'http:' + url.slice(0, url.lastIndexOf('/')) + '/' + items[0].quality + '.mp4'
        }
        catch(e){}

        return url
    }

    this.extractData = function(){
        network.timeout(5000)

        let movie = results.slice(0,1)[0]

        extract = {}

        if(movie){
            let src = movie.iframe_src.replace('58.svetacdn.in/0HlZgU1l1mw5','4432.svetacdn.in/Z9w3z4ZBIQxF')

            network.native('http:'+src,(raw)=>{
                let math = raw.replace(/\n/g,'').match(/id="files" value="(.*?)"/)

                if(math){
                    let json = Lampa.Arrays.decodeJson(math[1].replace(/&quot;/g,'"'),{})
                    var text = document.createElement("textarea")

                    for(let i in json){
                        text.innerHTML = json[i]

                        Lampa.Arrays.decodeJson(text.value,{})

                        extract[i] = {
                            json: Lampa.Arrays.decodeJson(text.value,{}),
                            file: this.extractFile(json[i])
                        }

                        for(let a in extract[i].json){
                            let elem = extract[i].json[a]

                            if(elem.folder){
                                for(let f in elem.folder){
                                    let folder = elem.folder[f]
                                    
                                    folder.file = this.extractFile(folder.file)
                                }
                            }
                            else elem.file = this.extractFile(elem.file)
                        }
                    }
                }

            },false,false,{dataType: 'text'})
        }
    }

    this.build = function(){
        this.buildFilterd()

        this.filtred()

        this.extractData()

        filter.onSelect = (type, a, b)=>{
            if(type == 'filter'){
                if(a.reset){
                    this.buildFilterd()
                }
                else{
                    if(a.stype == 'season'){
                        this.buildFilterd(b.index)
                    }
                    else{
                        let filter_data = Lampa.Storage.get('online_filter','{}')

                        filter_data[a.stype] = b.index

                        a.subtitle = b.title

                        Lampa.Storage.set('online_filter',filter_data)
                    }
                }
            }

            this.applyFilter()

            this.start()
        }

        this.showResults()
    }

    this.filtred = function(){
        filtred = []

        let filter_data = Lampa.Storage.get('online_filter','{}')
        
        if(object.movie.number_of_seasons){
            results.slice(0,1).forEach(movie=>{
                movie.episodes.forEach(episode=>{
                    if(episode.season_num == filter_data.season + 1){
                        episode.media.forEach(media=>{
                            if(media.translation.id == filter_items.voice_info[filter_data.voice].id){
                                filtred.push({
                                    episode: parseInt(episode.num),
                                    season: episode.season_num,
                                    title: episode.num + ' - ' + episode.ru_title,
                                    quality: media.max_quality + 'p',
                                    translation: media.translation_id
                                })
                            }
                        })
                    }
                })
            })

        }
        else{
            results.slice(0,1).forEach(movie=>{
                movie.media.forEach(element=>{
                    filtred.push({
                        title: element.translation.title,
                        quality: element.max_quality + 'p',
                        translation: element.translation_id
                    })
                })
            })
        }
    }

    this.applyFilter = function(){
        this.filtred()

        this.selectedFilter()

        this.reset()

        this.showResults()

        last = scroll.render().find('.torrent-item:eq(0)')[0]
    }

    this.showResults = function(data){
        filter.render().addClass('torrent-filter')

        scroll.append(filter.render())

        this.append(filtred)

        files.append(scroll.render())
    }

    this.reset = function(){
        last = false

        filter.render().detach()

        scroll.clear()
    }

    this.getFile = function(element, show_error){
        let translat = extract[element.translation]
        let id = element.season+'_'+element.episode

        if(translat){
            if(element.season){
                for(let i in translat.json){
                    let elem = translat.json[i]

                    if(elem.folder){
                        for(let f in elem.folder){
                            let folder = elem.folder[f]

                            if(folder.id == id) return folder.file
                        }
                    }
                    else if(elem.id == id){
                        return elem.file
                    }
                }
            }
            else return translat.file
        }
        
        if(show_error) Lampa.Noty.show('Не удалось извлечь ссылку')
    }

    this.append = function(items){
        items.forEach(element => {
            let hash = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title].join('') : object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online',element)

            item.append(Lampa.Timeline.render(view))

            item.on('hover:focus',(e)=>{
                last = e.target

                scroll.update($(e.target),true)
            }).on('hover:enter',()=>{
                let file = this.getFile(element, true)

                if(file){
                    this.start()

                    let playlist = []
                    let first = {
                        url: file,
                        timeline: view,
                        title: element.season ? element.title : object.movie.title + ' / ' + element.title
                    }

                    Lampa.Player.play(first)

                    if(element.season){
                        items.forEach(elem=>{
                            playlist.push({
                                title: elem.title,
                                url: this.getFile(elem)
                            })
                        })
                    }
                    else{
                        playlist.push(first)
                    }

                    Lampa.Player.playlist(playlist)
                }
                else{
                    Lampa.Noty.show('Не удалось извлечь ссылку')
                }
            })

            scroll.append(item)
        })
    }

    this.back = function(){
        Lampa.Activity.backward()
    }

    this.start = function(){
        Lampa.Controller.add('content',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(scroll.render(),files.render())
                Lampa.Controller.collectionFocus(last || false,scroll.render())
            },
            up: ()=>{
                if(Navigator.canmove('up')){
                    if(scroll.render().find('.selector').slice(2).index(last) == 0 && last_filter){
                        Lampa.Controller.collectionFocus(last_filter,scroll.render())
                    }
                    else Navigator.move('up')
                }
                else Lampa.Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Lampa.Controller.toggle('menu')
            },
            back: this.back
        })

        Lampa.Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return files.render()
    }

    this.destroy = function(){
        network.clear()

        files.destroy()

        scroll.destroy()

        results = null
        network = null
    }
}

export default component