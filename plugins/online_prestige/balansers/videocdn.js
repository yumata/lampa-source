function videocdn(component, _object){
    let network  = new Lampa.Reguest()
    let extract  = {}
    let results  = []
    let object   = _object
    let get_links_wait = false

    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0,
        voice_name: ''
    }

    this.search = function(_object, data){
        object = _object

        get_links_wait = true

        let url  = component.proxy('videocdn') + 'https://videocdn.tv/api/'
        let itm  = data[0]

        if(!itm.iframe_src) return component.doesNotAnswer()

        let type = itm.iframe_src.split('/').slice(-2)[0]

        if(type == 'movie') type = 'movies'

        url += type

        url = Lampa.Utils.addUrlComponent(url,'api_token=3i40G5TSECmLF77oAqnEgbx61ZWaOYaE')
        url = Lampa.Utils.addUrlComponent(url,'query='+encodeURIComponent(itm.imdb_id ? itm.imdb_id : itm.title))
        url = Lampa.Utils.addUrlComponent(url,'field='+encodeURIComponent(itm.imdb_id ? 'imdb_id' : 'title'))

        network.silent(url, (found) => {
            results = found.data.filter(elem=>elem.id == itm.id)

            if(!results.length) component.doesNotAnswer()
            else{
                try{
                    success(results)
                }
                catch(e){
                    component.doesNotAnswer()
                }
            }

            component.loading(false)
        },(a,c)=>{
            component.doesNotAnswer()
        })
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

        filter()

        append(filtred())
    }

    this.filter = function(type, a, b){
        choice[a.stype] = b.index

        if(a.stype == 'voice'){
            choice.voice_name = filter_items.voice[b.index]
        } 

        component.reset()

        filter()

        append(filtred())
    }

    this.destroy = function(){
        network.clear()

        results = null
    }

    function success(json){
        results = json

        extractData(json)

        filter()

        append(filtred())
    }

    function extractItems(str, max_quality){
        try{
            let items = str.split(',').map(item=>{
                return {
                    quality: parseInt(item.match(/\[(\d+)p\]/)[1]),
                    file: 'http:' + item.replace(/\[\d+p\]/,'').split(' or ')[0]
                }
            }).filter(item=>{
                return item.quality <= max_quality
            })

            items.sort((a,b)=>{
                return b.quality - a.quality
            })

            return items
        }
        catch(e){}

        return []
    }

    function extractData(results){
        network.timeout(20000)

        let movie = results.slice(0,1)[0]

        extract = {}

        if(movie){
            let src = movie.iframe_src;

            network.native('https:'+src,(raw)=>{
                get_links_wait = false

                component.render().find('.online-prestige__scan-file').remove()

                let math = raw.replace(/\n/g,'').match(/id="files" value="(.*?)"/)

                if(!math) math = raw.replace(/\n/g,'').match(/id="files" value='(.*?)'/)

                if(math){
                    let json = Lampa.Arrays.decodeJson(math[1].replace(/&quot;/g,'"'),{})
                    var text = document.createElement("textarea")

                    for(let i in json){
                        if (0 === (i - 0)) {
                            continue;
                        }
                        
                        text.innerHTML = json[i]
                        
                        let max_quality = movie.media?.filter(obj => obj.translation_id === (i - 0))[0]?.max_quality;

                        if (!max_quality) {
                            max_quality = movie.translations?.filter(obj => obj.id === (i - 0))[0]?.max_quality;
                        }

                        extract[i] = {
                            json: Lampa.Arrays.decodeJson(text.value,{}),
                            items: extractItems(json[i], max_quality)
                        }

                        for(let a in extract[i].json){
                            let elem = extract[i].json[a]

                            if(elem.folder){
                                for(let f in elem.folder){
                                    let folder = elem.folder[f]
                                    
                                    folder.items = extractItems(folder.file, max_quality)
                                }
                            }
                            else elem.items = extractItems(elem.file, max_quality)
                        }
                    }
                }

            },()=>{
                get_links_wait = false

                component.render().find('.online-prestige__scan-file').remove()
            },false,{dataType: 'text'})
        }
    }

    function getFile(element){
        let translat = extract[element.translation]
        let id       = element.season+'_'+element.episode
        let file     = ''
        let items    = []
        let quality  = false

        if(translat){
            if(element.season){
                for(let i in translat.json){
                    let elem = translat.json[i]

                    if(elem.folder){
                        for(let f in elem.folder){
                            let folder = elem.folder[f]

                            if(folder.id == id){
                                items = folder.items

                                break
                            } 
                        }
                    }
                    else if(elem.id == id){
                        items = elem.items

                        break
                    }
                }
            }
            else{
                items = translat.items
            } 
        }

        if(items && items.length){
            quality = {}

            let mass = [720,480,360]

            if(Lampa.Account.hasPremium()) Lampa.Arrays.insert(mass,0,1080)

                mass.forEach((n)=>{
                    let exes = items.find(a=>a.quality == n)

                    if(exes){
                        if(!file) file = exes.file

                        quality[n + 'p'] = exes.file
                    }
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
        filter_items  = {
            season: [],
            voice: [],
            voice_info: []
        }
        
        results.slice(0,1).forEach(movie => {
            if(movie.season_count){
                let s = movie.season_count

                while(s--){
                    filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (movie.season_count - s))
                }
            }

            if(filter_items.season.length){
                movie.episodes.forEach(episode=>{
                    if(episode.season_num == choice.season + 1){
                        episode.media.forEach(media=>{
                            if(!filter_items.voice_info.find(v=>v.id == media.translation.id)){
                                filter_items.voice.push(media.translation.shorter_title)
                                filter_items.voice_info.push({
                                    id: media.translation.id
                                })
                            }
                        })
                    }
                })
            }
        })

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

        if(object.movie.name){
            results.slice(0,1).forEach(movie=>{
                movie.episodes.forEach(episode=>{
                    if(episode.season_num == choice.season + 1){
                        let temp   = episode.media.map(m=>m)
                        let unique = []

                        temp.sort((a,b)=>{
                            return b.max_quality - a.max_quality
                        })

                        temp.forEach(m=>{
                            if(!unique.find(a=>a.translation.id == m.translation.id)){
                                unique.push(m)
                            }
                        })

                        episode.media.forEach(media=>{
                            if(media.translation.id == filter_items.voice_info[choice.voice].id && unique.indexOf(media) !== -1){
                                filtred.push({
                                    episode: parseInt(episode.num),
                                    season: episode.season_num,
                                    title: episode.ru_title,
                                    quality: (media.source_quality  && window.innerWidth > 480 ? media.source_quality.toUpperCase() + ' - ' : '') + media.max_quality + 'p',
                                    translation: media.translation_id,
                                    info: filter_items.voice[choice.voice],
                                    voice_name: filter_items.voice[choice.voice]
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
                        title: element.translation.shorter_title,
                        quality: (element.source_quality && window.innerWidth > 480 ? element.source_quality.toUpperCase() + ' - ' : '') + element.max_quality + 'p',
                        translation: element.translation_id,
                        voice_name: element.translation.shorter_title
                    })
                })
            })
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
            onRender: (item, html)=>{
                if(get_links_wait) html.find('.online-prestige__body').append($('<div class="online-prestige__scan-file"><div class="broadcast__scan"><div></div></div></div>'))
            },
            onEnter: (item, html)=>{
                let extra = getFile(item, item.quality)

                if(extra.file){
                    let playlist = []
                    let first    = toPlayElement(item)

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
                else Lampa.Noty.show(Lampa.Lang.translate(get_links_wait ? 'online_waitlink' : 'online_nolink'))
            },
            onContextMenu: (item, html, data, call)=>{
                call(getFile(item, item.quality))
            }
        })
    }
}

export default videocdn