import Storage from '../storage'
import Utils from '../math'
import Reguest from '../reguest'
import Account from '../account'

let url
let network = new Reguest()

function get(params = {}, oncomplite, onerror){
    function complite(data){
        popular(params.movie, data, {}, oncomplite)
    }

    function error(e){
        let data = {Results: []}

        popular(params.movie, data, {nolimit: true}, ()=>{
            if(data.Results.length) oncomplite(data)
            else onerror(e)
        })
    }

    if(Storage.field('parser_torrent_type') == 'jackett'){
        if(Storage.field('jackett_url')){
            url = Utils.checkHttp(Storage.field('jackett_url'))

            jackett(params, complite, ()=>{
                torlook(params, complite, error)
            })
        }
        else{
            error('Укажите ссылку для парсинга Jackett')
        }
    }
    else{
        if(Storage.get('native')){
            torlook(params, complite, error)
        }
        else if(Storage.field('torlook_parse_type') == 'site' && Storage.field('parser_website_url')){
            url = Utils.checkHttp(Storage.field('parser_website_url'))

            torlook(params, complite, error)
        }
        else if(Storage.field('torlook_parse_type') == 'native'){
            torlook(params, complite, error)
        }
        else error('Укажите ссылку для парсинга TorLook')
    }
}

function popular(card, data, params, call){
    Account.torrentPopular({card}, (result)=>{
        let torrents = result.result.torrents.filter(t=>t.viewing_request > (params.nolimit ? 0 : 3))

        torrents.sort((a,b)=>b.viewing_average - a.viewing_average)

        torrents.forEach(t=>{
            delete t.viewed
        })

        data.Results = data.Results.concat(params.nolimit ? torrents : torrents.slice(0,3))

        call(data)
    },()=>{
        call(data)
    })
}

function viewed(hash){
    let view  = Storage.cache('torrents_view', 5000, [])

    return view.indexOf(hash) > -1
}

function torlook(params = {}, oncomplite, onerror){
    torlookApi(params, oncomplite, onerror)
}

function torlookApi(params = {}, oncomplite, onerror){
    network.timeout(1000 * 30)

    let s = 'http://api.torlook.info/api.php?key=4JuCSML44FoEsmqK&s='
    let q = (params.search + '').replace(/( )/g, "+").toLowerCase()
    let u = Storage.get('native') || Storage.field('torlook_parse_type') == 'native' ? s + encodeURIComponent(q) : url.replace('{q}',encodeURIComponent(s + encodeURIComponent(q)))

    network.native(u,(json)=>{
        if(json.error) onerror('Ошибка в запросе')
        else{
            let data = {
                Results: []
            }

            if(json.data){
                json.data.forEach(elem=>{
                    let item = {}

                    item.Title       = elem.title
                    item.Tracker     = elem.tracker
                    item.Size        = parseInt(elem.size)
                    item.size        = Utils.bytesToSize(item.Size)
                    item.PublishDate = parseInt(elem.date)*1000
                    item.Seeders     = parseInt(elem.seeders)
                    item.Peers       = parseInt(elem.leechers)
                    item.PublisTime  = parseInt(elem.date)*1000
                    item.hash        = Utils.hash(elem.title)
                    item.MagnetUri   = elem.magnet
                    item.viewed      = viewed(item.hash)

                    if(elem.magnet) data.Results.push(item)
                })
            }

            oncomplite(data)
        }
    },(a,c)=>{
        onerror(network.errorDecode(a,c))
    })
}

function jackett(params = {}, oncomplite, onerror){
    network.timeout(1000 * 15)

    let u      = url + '/api/v2.0/indexers/all/results?apikey='+Storage.field('jackett_key')+'&Query='+encodeURIComponent(params.search)
    let genres = params.movie.genres.map((a)=>{
        return a.name
    })
    
    if(!params.clarification){
        u = Utils.addUrlComponent(u,'title='+encodeURIComponent(params.movie.title))
        u = Utils.addUrlComponent(u,'title_original='+encodeURIComponent(params.movie.original_title))
    }

    u = Utils.addUrlComponent(u,'year='+encodeURIComponent(((params.movie.release_date || params.movie.first_air_date || '0000') + '').slice(0,4)))
    u = Utils.addUrlComponent(u,'is_serial='+(params.movie.first_air_date || params.movie.last_air_date ? '2' : params.other ? '0' : '1'))
    u = Utils.addUrlComponent(u,'genres='+encodeURIComponent(genres.join(',')))
    u = Utils.addUrlComponent(u, 'Category[]=' + (params.movie.number_of_seasons > 0 ? 5000 : 2000))

    network.native(u,(json)=>{
        json.Results.forEach(element => {
            element.PublisTime  = Utils.strToTime(element.PublishDate)
            element.hash        = Utils.hash(element.Title)
            element.viewed      = viewed(element.hash)
            element.size        = Utils.bytesToSize(element.Size)
        });


        oncomplite(json)
    },(a,c)=>{
        onerror(network.errorDecode(a,c))
    })
}

function marnet(element, oncomplite, onerror){
    network.timeout(1000 * 15)
    
    let s = Utils.checkHttp(Storage.field('torlook_site')) + '/'
    let u = Storage.get('native') || Storage.field('torlook_parse_type') == 'native' ? s + element.reguest : url.replace('{q}',encodeURIComponent(s + element.reguest))

    network.native(u,(html)=>{
        let math = html.match(/magnet:(.*?)'/)

        if(math && math[1]){
            element.MagnetUri = 'magnet:' + math[1]

            oncomplite()
        }
        else{
            onerror('Неудалось получить magnet ссылку')
        }
    },(a,c)=>{
        onerror(network.errorDecode(a,c))
    },false,{dataType: 'text'})
}

function clear(){
    network.clear()
}

export default {
    get,
    torlook,
    jackett,
    marnet,
    clear
}