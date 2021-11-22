import Storage from '../storage'
import Utils from '../math'
import Reguest from '../reguest'

let url
let network = new Reguest()

function get(params = {}, oncomplite, onerror){
    if(Storage.field('parser_torrent_type') == 'jackett'){
        if(Storage.field('jackett_url')){
            url = Utils.checkHttp(Storage.field('jackett_url'))

            jackett(params, oncomplite, onerror)
        }
        else{
            onerror('Укажите ссылку для парсинга Jackett')
        }
    }
    else{
        if(Storage.get('native')){
            torlook(params, oncomplite, onerror)
        }
        else if(Storage.field('torlook_parse_type') == 'site' && Storage.field('parser_website_url')){
            url = Utils.checkHttp(Storage.field('parser_website_url'))

            torlook(params, oncomplite, onerror)
        }
        else if(Storage.field('torlook_parse_type') == 'native'){
            torlook(params, oncomplite, onerror)
        }
        else onerror('Укажите ссылку для парсинга TorLook')
    }
}

function viewed(hash){
    let view  = Storage.cache('torrents_view', 5000, [])

    return view.indexOf(hash) > -1
}

function torlook(params = {}, oncomplite, onerror){
    network.timeout(1000 * 60)

    let s = Utils.checkHttp(Storage.field('torlook_site')) + '/'
    let u = Storage.get('native') || Storage.field('torlook_parse_type') == 'native' ? s + encodeURIComponent(params.search) : url.replace('{q}',encodeURIComponent(s + encodeURIComponent(params.search)))

    network.native(u + '?forced=1',(str)=>{
        let math = str.replace(/\n|\r/g,'').match(new RegExp('<div class="webResult item">(.*?)<\/div>','g'))

        let data = {
            Results: []
        }

        $.each(math, function(i,a){
            a = a.replace(/<img[^>]+>/g,'')
            
            let element = $(a+'</div>'),
                item = {}

            item.Title       = $('>p>a',element).text()
            item.Tracker     = $('.h2 > a',element).text()
            item.size        = $('.size',element).text()
            item.Size        = Utils.sizeToBytes(item.size)
            item.PublishDate = $('.date',element).text() + 'T22:00:00'
            item.Seeders     = parseInt($('.seeders',element).text())
            item.Peers       = parseInt($('.leechers',element).text())
            item.reguest     = $('.magneto',element).attr('data-src')
            item.PublisTime  = Utils.strToTime(item.PublishDate)
            item.hash        = Utils.hash(item.Title)
            item.viewed      = viewed(item.hash)

            element.remove()

            if(item.Title && item.reguest) data.Results.push(item)
        })

        oncomplite(data)
    },(a,c)=>{
        onerror(network.errorDecode(a,c))
    },false,{dataType: 'text'})
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
    u = Utils.addUrlComponent(u,'is_serial='+(params.movie.first_air_date ? '2' : params.other ? '0' : '1'))
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