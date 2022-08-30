import Storage from '../storage'
import Utils from '../math'
import Reguest from '../reguest'
import Account from '../account'
import Lang from '../lang'
import Search from '../../components/search'
import Activity from '../../interaction/activity'
import Torrent from '../../interaction/torrent'
import Modal from '../../interaction/modal'

let url
let network = new Reguest()

function init(){
    let source = {
        title: Lang.translate('title_parser'),
        search: (params, oncomplite)=>{
            get({
                search: decodeURIComponent(params.query),
                other: true,
                from_search: true,
                movie: {
                    genres: [],
                    title: decodeURIComponent(params.query),
                    original_title: decodeURIComponent(params.query),
                    number_of_seasons: 0
                }
            },(json)=>{
                json.title   = Lang.translate('title_parser')
                json.results = json.Results.slice(0,20)
                json.Results = null
    
                json.results.forEach((element)=>{
                    element.Title = Utils.shortText(element.Title,110)
                })
    
                oncomplite([json])
            },()=>{
                oncomplite([])
            })
        },
        onCancel: ()=>{
            network.clear()
        },
        params: {
            align_left: true,
            isparser: true,
            card_events: {
                onMenu: ()=>{}
            }
        },
        onMore: (params, close)=>{
            close()

            Activity.push({
                url: '',
                title: Lang.translate('title_torrents'),
                component: 'torrents',
                search: params.query,
                movie: {
                    title: params.query,
                    original_title: '',
                    img: './img/img_broken.svg',
                    genres: []
                },
                page: 1
            })
        },
        onSelect: (params, close)=>{
            if(params.element.reguest && !params.element.MagnetUri){
                marnet(params.element, ()=>{
                    Modal.close()

                    Torrent.start(params.element, {
                        title: params.element.Title
                    })

                    Torrent.back(params.line.toggle.bind(params.line))
                },(text)=>{
                    Modal.update(Template.get('error',{title: Lang.translate('title_error'), text: text}))
                })

                Modal.open({
                    title: '',
                    html: Template.get('modal_pending',{text: Lang.translate('torrent_get_magnet')}),
                    onBack: ()=>{
                        Modal.close()
        
                        params.line.toggle()
                    }
                })
            }
            else{
                Torrent.start(params.element, {
                    title: params.element.Title
                })

                Torrent.back(params.line.toggle.bind(params.line))
            }
        }
    }

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'parse_in_search'){
            Search.removeSource(source)

            if(Storage.field('parse_in_search')) Search.addSource(source)
        }
    })

    if(Storage.field('parse_in_search')){
        Search.addSource(source)
    }
}

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

            let ignore = params.from_search && !url.match(/\d+\.\d+\.\d+/g)

            if(ignore) error('')
            else{
                jackett(params, complite, ()=>{
                    Lampa.Noty.show(Lang.translate('torrent_parser_torlook_fallback_search_notification'))
                    torlook(params, complite, error)
                })
            }
        }
        else{
            error(Lang.translate('torrent_parser_set_link') + ': Jackett')
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
        else error(Lang.translate('torrent_parser_set_link') + ': TorLook')
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
    network.timeout(1000 * Storage.field('parse_timeout'))

    let s = 'https://api.torlook.info/api.php?key=4JuCSML44FoEsmqK&s='
    let q = (params.search + '').replace(/( )/g, "+").toLowerCase()
    let u = Storage.get('native') || Storage.field('torlook_parse_type') == 'native' ? s + encodeURIComponent(q) : url.replace('{q}',encodeURIComponent(s + encodeURIComponent(q)))

    network.native(u,(json)=>{
        if(json.error) onerror(Lang.translate('torrent_parser_request_error'))
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
        onerror(Lang.translate('torrent_parser_no_responce'))
    })
}

function jackett(params = {}, oncomplite, onerror){
    network.timeout(1000 * Storage.field('parse_timeout'))

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
    u = Utils.addUrlComponent(u, 'Category[]=' + (params.movie.number_of_seasons > 0 ? 5000 : 2000) + (params.movie.original_language == 'ja' ? ',5070' : ''))

    network.native(u,(json)=>{
        json.Results.forEach(element => {
            element.PublisTime  = Utils.strToTime(element.PublishDate)
            element.hash        = Utils.hash(element.Title)
            element.viewed      = viewed(element.hash)
            element.size        = Utils.bytesToSize(element.Size)
        });


        oncomplite(json)
    },(a,c)=>{
        onerror(Lang.translate('torrent_parser_no_responce'))
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
            onerror(Lang.translate('torrent_parser_magnet_error'))
        }
    },(a,c)=>{
        onerror(network.errorDecode(a,c))
    },false,{dataType: 'text'})
}

function clear(){
    network.clear()
}

export default {
    init,
    get,
    torlook,
    jackett,
    marnet,
    clear
}
