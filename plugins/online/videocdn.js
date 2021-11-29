let network  = new Lampa.Reguest()
let token    = '3i40G5TSECmLF77oAqnEgbx61ZWaOYaE'
let object   = {}
let extract  = {}

function search(_object,success,empty,error){
    object = _object

    let url   = 'https://videocdn.tv/api/'
    let query = object.movie.imdb_id || object.search
    
    if(object.movie.original_language == 'ja' && isAnime(object.movie.genres)){
        url += object.movie.number_of_seasons ? 'anime-tv-series' : 'animes'
    }
    else{
        url += object.movie.number_of_seasons ? 'tv-series' : 'movies'
    }

    url = Lampa.Utils.addUrlComponent(url,'api_token='+token)
    url = Lampa.Utils.addUrlComponent(url,'query='+encodeURIComponent(query))
    url = Lampa.Utils.addUrlComponent(url,'field=global')

    if(object.movie.release_date && object.movie.release_date !== '0000') url = Lampa.Utils.addUrlComponent(url,'year='+((object.movie.release_date+'').slice(0,4)))
    
    network.silent(url,(json)=>{
        if(json.data && json.data.length){
            
            if(json.data.length == 1 || object.clarification){
                success(json.data)

                extractData(json.data)
            }
            else{
                empty(json.data.map(e=>e.ru_title))
            }
        }
        else empty()
    },(a, c)=>{
        error(network.errorDecode(a,c))
    })
}

function isAnime(genres){
    return genres.filter(gen=>{
        return gen.id == 16
    }).length
}

function extractFile(str, max_quality){
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

        url = items[0].file
        url = 'http:' + url.slice(0, url.lastIndexOf('/')) + '/' + (max_quality || items[0].quality) + '.mp4'
    }
    catch(e){}

    return url
}

function extractData(results){
    network.timeout(5000)

    let movie = results.slice(0,1)[0]

    extract = {}

    if(movie){
        let src = movie.iframe_src;

        network.native('http:'+src,(raw)=>{
            let math = raw.replace(/\n/g,'').match(/id="files" value="(.*?)"/)

            if(math){
                let json = Lampa.Arrays.decodeJson(math[1].replace(/&quot;/g,'"'),{})
                var text = document.createElement("textarea")

                for(let i in json){
                    if (0 === (i - 0)) {
                        continue;
                    }
                    
                    text.innerHTML = json[i]

                    Lampa.Arrays.decodeJson(text.value,{})
                    
                    let max_quality = movie.media?.filter(obj => obj.translation_id === (i - 0))[0]?.max_quality;

                    if (!max_quality) {
                        max_quality = movie.translations?.filter(obj => obj.id === (i - 0))[0]?.max_quality;
                    }

                    extract[i] = {
                        json: Lampa.Arrays.decodeJson(text.value,{}),
                        file: extractFile(json[i], max_quality)
                    }

                    for(let a in extract[i].json){
                        let elem = extract[i].json[a]

                        if(elem.folder){
                            for(let f in elem.folder){
                                let folder = elem.folder[f]
                                
                                folder.file = extractFile(folder.file, max_quality)
                            }
                        }
                        else elem.file = extractFile(elem.file, max_quality)
                    }
                }
            }

        },false,false,{dataType: 'text'})
    }
}

function getFile(element, max_quality, show_error){
    let translat = extract[element.translation]
    let id       = element.season+'_'+element.episode
    let file     = ''

    if(translat){
        if(element.season){
            for(let i in translat.json){
                let elem = translat.json[i]

                if(elem.folder){
                    for(let f in elem.folder){
                        let folder = elem.folder[f]

                        if(folder.id == id){
                            file = folder.file

                            break
                        } 
                    }
                }
                else if(elem.id == id){
                    file = elem.file

                    break
                }
            }
        }
        else{
            file = translat.file
        } 
    }

    max_quality = parseInt(max_quality)

    if(file){
        if(file.split('/').pop().replace('.mp4','') !== max_quality){
            file = file.slice(0, file.lastIndexOf('/')) + '/' + max_quality + '.mp4'
        }
    }
    else if(show_error) Lampa.Noty.show('Не удалось извлечь ссылку')

    return file
}

function filter(params){
    let filter_items  = params.filter_items
    let select_season = params.select_season
    
    params.results.slice(0,1).forEach(movie => {
        if(movie.season_count){
            let s = movie.season_count

            while(s--){
                filter_items.season.push('Сезон ' + (movie.season_count - s))
            }

            filter_items.choice.season = typeof select_season == 'undefined' ? filter_items.season.length - movie.season_count : select_season
        }

        if(filter_items.season.length){
            movie.episodes.forEach(episode=>{
                if(episode.season_num == filter_items.choice.season + 1){
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
}

function filtred(results, filter_items){
    let filtred = []

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
                if(filter_items.voice_info[filter_data.voice].id == element.translation_id){
                    filtred.push({
                        title: element.translation.title,
                        quality: element.max_quality + 'p',
                        translation: element.translation_id
                    })
                }
            })
        })
    }

    return filtred
}

function append(params){
    params.items.forEach(element => {
        let hash = Lampa.Utils.hash(element.season ? [element.season,element.episode,object.movie.original_title].join('') : object.movie.original_title)
        let view = Lampa.Timeline.view(hash)
        let item = Lampa.Template.get('online',element)

        element.timeline = view

        item.append(Lampa.Timeline.render(view))

        item.on('hover:enter',()=>{
            if(object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

            let file = getFile(element, element.quality ,true)

            if(file){
                params.open()

                let playlist = []
                let first = {
                    url: file,
                    timeline: view,
                    title: element.season ? element.title : object.movie.title + ' / ' + element.title
                }

                Lampa.Player.play(first)

                if(element.season){
                    params.items.forEach(elem=>{
                        playlist.push({
                            title: elem.title,
                            url: getFile(elem, elem.quality),
                            timeline: elem.timeline
                        })
                    })
                }
                else{
                    playlist.push(first)
                }

                Lampa.Player.playlist(playlist)
            }
        })

        params.item(item)

        params.scroll.append(item)
    })
}

export default {
    search,
    filter,
    filtred,
    append
}