let network    = new Lampa.Reguest()
let token      = '2d55adfd-019d-4567-bbf7-67d503f61b5a'
let object     = {}
let translates = []

function search(_object,success,empty,error){
    object = _object

    let url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(object.search) + '&page=1'
    
    network.silent(url,(json)=>{
        if(json.films && json.films.length){
            let film_id = json.films[0].filmId

            network.timeout(10000)

            network.native('https://voidboost.net/embed/'+film_id,(str)=>{
                
                extractTranslates(str,(list)=>{
                    translates = list

                    if(translates.length){
                        let elements = []

                        translates.forEach(voice=>{
                            elements.push({
                                title: object.movie.title,
                                file: voice.file,
                                quality: '720p / 1080p',
                                voice_id: voice.id
                            })
                        })

                        success(elements)
                    }
                    else empty()
                })

            },empty,false,{
                dataType: 'text'
            })
        }
        else empty()
    },(a, c)=>{
        error(network.errorDecode(a,c))
    },false,{
        headers: {
            'X-API-KEY': token
        }
    })
}

function getFile(id, success, error){
    network.timeout(3000)

    network.native('https://voidboost.net/movie/'+id+'/iframe?h=gidonline.io',(str)=>{
        
        var videos = str.match("file': '(.*?)'")

        if(videos){
            let link = videos[0].match("1080p](.*?)mp4")

            if(link){
                success(link[1]+'mp4')
            }
            else error()
        }
        else error()

    },error,false,{
        dataType: 'text'
    })
}

function extractTranslates(str, call){
    let trsl = str.match('<select name="translator"[^>]+>(.*?)</select>')

    if(trsl){
        let select = $('<select>'+trsl[1]+'</select>')
        let list   = []

        $('option',select).each(function(){
            let id = $(this).attr('data-token')

            if(id){
                list.push({
                    id: id,
                    name: $(this).text(),
                    file: ''
                })
            }
        })

        let point = 0
        let scan  = ()=>{
            if(point >= list.length) return call(list)

            let voice = list[point]

            getFile(voice.id,(file)=>{
                voice.file = file

                scan()
            },scan)

            point++
        }

        scan()
    }
    else call([])
}


function filter(params){
    let filter_items  = params.filter_items

    translates.forEach(tranlate=>{
        filter_items.voice.push(tranlate.name)
        filter_items.voice_info.push({
            id: tranlate.id
        })
    })
}

function filtred(results, filter_items){
    let filter_data = Lampa.Storage.get('online_filter','{}')

    let filtred = results.filter(elem=>{
        return elem.voice_id == filter_items.voice_info[filter_data.voice].id
    })
    
    return filtred
}

function append(params){
    params.items.forEach(element => {
        let hash = Lampa.Utils.hash(object.movie.original_title)
        let view = Lampa.Timeline.view(hash)
        let item = Lampa.Template.get('online',element)

        item.append(Lampa.Timeline.render(view))

        item.on('hover:enter',()=>{
            if(object.movie.id) Lampa.Favorite.add('history', object.movie, 100)
            
            params.open()

            let first = {
                url: element.file,
                timeline: view,
                title: element.title
            }

            Lampa.Player.play(first)
            
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