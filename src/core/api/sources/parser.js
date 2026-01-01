import Storage from '../../storage/storage'
import Utils from '../../../utils/utils'
import Reguest from '../../../utils/reguest'
import Lang from '../../lang'
import Search from '../../../interaction/search/global'
import Activity from '../../../interaction/activity/activity'
import Torrent from '../../../interaction/torrent'
import Torserver from '../../../interaction/torserver'
import Platform from '../../platform'
import CardParser from '../../../interaction/card_parser/card_parser'

let url
let network = new Reguest()

function init(){
    Storage.set('parser_torrent_type', Storage.get('parser_torrent_type') || 'jackett')

    let source = {
        title: Lang.translate('title_parser'),
        search: (params, oncomplite)=>{
            get({
                search: decodeURIComponent(params.query),
                other: true,
                from_search: true
            },(json)=>{
                json.Results.sort((a,b)=>{
                    return (b.Seeders || 0) - (a.Seeders || 0)
                })
                
                json.title   = Lang.translate('title_parser')
                json.results = json.Results.slice(0,20)
                json.total   = json.Results.length
                json.total_pages = Math.ceil(json.total / 20)

                json.Results = null

                json.results.forEach((element)=>{
                    element.Title = Utils.shortText(element.Title,110)

                    element.params = {
                        createInstance: (item)=>new CardParser(item)
                    }
                })

                oncomplite(json.results.length ? [json] : [])
            },()=>{
                oncomplite([])
            })
        },
        onRecall: (data, last_query)=>{
            data[0].results.forEach((element) => {
                element.params = {
                    createInstance: (item)=>new CardParser(item)
                }
            })
        },
        onCancel: network.clear.bind(network),
        params: {
            lazy: true
        },
        onMore: (params, close)=>{
            close()

            Activity.push({
                url: '',
                title: Lang.translate('title_torrents'),
                component: 'torrents',
                search: params.query,
                from_search: true,
                page: 1
            })
        },
        onSelect: (params, close)=>{
            Torrent.start(params.element, {
                title: params.element.Title
            })

            Torrent.back(params.line.toggle.bind(params.line))
        }
    }

    function addSource(){
        let reg = Platform.is('android') ? true : Torserver.url()

        if(Storage.field('parse_in_search') && reg) Search.addSource(source)
    }

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'parse_in_search' || e.name == 'torrserver_url' || e.name == 'torrserver_url_two' || e.name == 'torrserver_use_link'){
            Search.removeSource(source)

            addSource()
        }
    })

    addSource()
}

function get(params = {}, oncomplite, onerror){
    function complite(data){
        oncomplite(data)
    }

    function error(e){
        onerror(e)
    }

    if(Storage.field('parser_torrent_type') == 'jackett'){
        if(Storage.field('jackett_url')){
            url = Utils.checkEmptyUrl(Storage.field('jackett_url'))

            let ignore = false//params.from_search && !url.match(/\d+\.\d+\.\d+/g)

            if(ignore) error('')
            else{
                jackett(params, complite, error)
            }
        }
        else{
            error(Lang.translate('torrent_parser_set_link') + ': Jackett')
        }
    } 
    else if(Storage.field('parser_torrent_type') == 'prowlarr'){
        if(Storage.field('prowlarr_url')){
            url = Utils.checkEmptyUrl(Storage.field('prowlarr_url'))
            prowlarr(params, complite, error)
        } else {
            error(Lang.translate('torrent_parser_set_link') + ': Prowlarr')
        }
    } 
    else if(Storage.field('parser_torrent_type') == 'torrserver'){
        if(Storage.field(Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url')){
            url = Utils.checkEmptyUrl(Storage.field(Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url'))
            torrserver(params, complite, error)
        } else {
            error(Lang.translate('torrent_parser_set_link') + ': TorrServer')
        }
    }
}

function viewed(hash){
    let view  = Storage.cache('torrents_view', 5000, [])

    return view.indexOf(hash) > -1
}

function jackett(params = {}, oncomplite, onerror){
    network.timeout(1000 * Storage.field('parse_timeout'))

    let u = url + '/api/v2.0/indexers/'+(Storage.field('jackett_interview') == 'healthy' ? 'status:healthy' : 'all')+'/results?apikey='+Storage.field('jackett_key')+'&Query='+encodeURIComponent(params.search)

    if(!params.from_search){
        let genres = params.movie.genres.map((a)=>{
            return a.name
        })

        if(!params.clarification){
            u = Utils.addUrlComponent(u,'title='+encodeURIComponent(params.movie.title))
            u = Utils.addUrlComponent(u,'title_original='+encodeURIComponent(params.movie.original_title))
        }

        u = Utils.addUrlComponent(u,'year='+encodeURIComponent(((params.movie.first_air_date || params.movie.release_date || '0000') + '').slice(0,4)))
        u = Utils.addUrlComponent(u,'is_serial='+(params.movie.original_name ? '2' : params.other ? '0' : '1'))
        u = Utils.addUrlComponent(u,'genres='+encodeURIComponent(genres.join(',')))
        u = Utils.addUrlComponent(u, 'Category[]=' + (params.movie.number_of_seasons > 0 ? 5000 : 2000) + (params.movie.original_language == 'ja' ? ',5070' : ''))
    }

    network.native(u,(json)=>{
        if(json.Results){
            json.Results.forEach(element => {
                element.PublisTime  = Utils.strToTime(element.PublishDate)
                element.hash        = Utils.hash(element.Title)
                element.viewed      = viewed(element.hash)
                element.size        = Utils.bytesToSize(element.Size)
            })

            oncomplite(json)
        }
        else onerror(Lang.translate('torrent_parser_no_responce') + ' (' + url + ')')
    },(a,c)=>{
        onerror(Lang.translate('torrent_parser_no_responce') + ' (' + url + ')')
    })
}

// доки https://wiki.servarr.com/en/prowlarr/search#search-feed
function prowlarr(params = {}, oncomplite, onerror){
    
    let q = []

    q.push({name: 'apikey', value: Storage.field('prowlarr_key')})
    q.push({name: 'query', value: params.search})

    if(!params.from_search){
        const isSerial = !!(params.movie.original_name);

        if (params.movie.number_of_seasons > 0) {
            q.push({name: 'categories', value: '5000'})
        }
        if (params.movie.original_language == 'ja') {
            q.push({name: 'categories', value: '5070'})
        }
        q.push({name: 'type', value: isSerial ? 'tvsearch' : 'search'})
    }

    let u = Utils.buildUrl(url, '/api/v1/search', q)

    network.timeout(1000 * Storage.field('parse_timeout'));
    network.native(u,(json)=> {
        if(Array.isArray(json)) {
            oncomplite({
                Results: json
                    .filter((e) => e.protocol === 'torrent')
                    .map((e) => {
                        const hash = Utils.hash(e.title);
						const timeValue = Utils.strToTime(e.publishDate);

                        return {
                            Title: e.title,
                            Tracker: e.indexer,
                            Size: e.size,
                            PublishDate: Utils.strToTime(e.publishDate),
							PublisTime: timeValue,
                            Seeders: parseInt(e.seeders),
                            Peers: parseInt(e.leechers),
                            MagnetUri: e.downloadUrl,
                            viewed: viewed(hash),
                            hash
                        }
                    })
            })
        } else {
            onerror(Lang.translate('torrent_parser_request_error') + ' (' + JSON.stringify(json) + ')')
        }
    },
        ()=>{
        onerror(Lang.translate('torrent_parser_no_responce') + ' (' + url + ')')
    })
}

function torrserver(params = {}, oncomplite, onerror){
    network.timeout(1000 * Storage.field('parse_timeout'));

    let u = Utils.buildUrl(url, '/search/', [
        {name: 'query', value: params.search}
    ])
    
    network.native(u,(json)=>{
        if(Array.isArray(json)){
            oncomplite({
                Results:json.map((e) => {
                    const hash = Utils.hash(e.Title);
                    return {
                        Title: e.Title,
                        Tracker: e.Tracker,
                        size: e.Size,
                        PublishDate: Utils.strToTime(e.CreateDate),
                        Seeders: parseInt(e.Seed),
                        Peers: parseInt(e.Peer),
                        MagnetUri: e.Magnet,
                        viewed: viewed(hash),
                        CategoryDesc: e.Categories,
                        bitrate: '-',
                        hash
                    }
                })
            })
        }
        else onerror(Lang.translate('torrent_parser_request_error') + ' (' + JSON.stringify(json) + ')')
    },(a,c)=>{
        onerror(Lang.translate('torrent_parser_no_responce') + ' (' + url + ')')
    })
}

function clear(){
    network.clear()
}

export default {
    init,
    get,
    jackett,
    clear
}
