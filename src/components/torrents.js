import Controller from '../core/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Activity from '../interaction/activity/activity'
import Arrays from '../utils/arrays'
import Template from '../interaction/template'
import Utils from '../utils/utils'
import Filter from '../interaction/filter'
import Storage from '../core/storage/storage'
import Empty from '../interaction/empty/empty'
import Torrent from '../interaction/torrent'
import Modal from '../interaction/modal'
import Background from '../interaction/background'
import Select from '../interaction/select'
import Torserver from '../interaction/torserver'
import Noty from '../interaction/noty'
import Parser from '../core/api/sources/parser'
import Lang from '../core/lang'
import TMDB from '../core/tmdb/tmdb'
import Explorer from '../interaction/explorer'
import Layer from '../core/layer'
import WatchedHistory from '../interaction/watched_history'
import Listener from './torrents/listener'

import voices from './torrents/voices'
import filter_langs from './torrents/lang'

/**
 * Компонент "Torrents"
 * @param {*} object 
 */
function component(object){
    Arrays.extend(object, {
        movie: {
            title: object.search,
            original_title: object.search
        },
        params: {
            noinfo: object.from_search ? true : false
        }
    })

    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over: true})
    let files   = new Explorer(object)
    let history = new WatchedHistory(object.movie)
    let filter
    let results = []
    let filtred = []
    let listener

    let total_pages = 1
    let count       = 0
    let last
    let last_filter
    let initialized

    let filter_items = {
        quality: [Lang.translate('torrent_parser_any_one'),'4k','1080p','720p'],
        hdr: [Lang.translate('torrent_parser_no_choice'),Lang.translate('torrent_parser_yes'),Lang.translate('torrent_parser_no')],
        dv: [Lang.translate('torrent_parser_no_choice'), 'Dolby Vision', 'Dolby Vision TV', Lang.translate('torrent_parser_no')],
        sub: [Lang.translate('torrent_parser_no_choice'),Lang.translate('torrent_parser_yes'),Lang.translate('torrent_parser_no')],
        voice: [],
        tracker: [Lang.translate('torrent_parser_any_two')],
        year: [Lang.translate('torrent_parser_any_two')],
        lang: [Lang.translate('torrent_parser_any_two')],
        _3d: [Lang.translate('torrent_parser_no_choice'),Lang.translate('torrent_parser_yes'),Lang.translate('torrent_parser_no')]
    }

    let filter_translate = {
        quality: Lang.translate('torrent_parser_quality'),
        hdr: 'HDR',
        dv: 'Dolby Vision',
        sub: Lang.translate('torrent_parser_subs'),
        voice: Lang.translate('torrent_parser_voice'),
        tracker: Lang.translate('torrent_parser_tracker'),
        year: Lang.translate('torrent_parser_year'),
        season: Lang.translate('torrent_parser_season'),
        lang:  Lang.translate('title_language_short'),
        _3d: '3D'
    }

    let filter_multiple = ['quality','voice','tracker','season','lang']

    let sort_translate = {
        Seeders: Lang.translate('torrent_parser_sort_by_seeders'),
        Size: Lang.translate('torrent_parser_sort_by_size'),
        Title: Lang.translate('torrent_parser_sort_by_name'),
        Tracker:Lang.translate('torrent_parser_sort_by_tracker'),
        PublisTime: Lang.translate('torrent_parser_sort_by_date'),
        viewed: Lang.translate('torrent_parser_sort_by_viewed')
    }

    let i = 20,
        y = (new Date()).getFullYear()

    while (i--) {
        filter_items.year.push((y - (19 - i)) + '')
    }

    let viewed = Storage.cache('torrents_view', 5000, [])

    let finded_seasons      = []
    let finded_seasons_full = []

    filter_items.lang = filter_items.lang.concat(filter_langs.map(a=>Lang.translate(a.title)))
    
    scroll.minus(files.render().find('.explorer__files-head'))

    scroll.body().addClass('torrent-list')

    if(object.from_search) object.movie.original_title = ''

    this.create = function(){
        return this.render()
    }

    this.initialize = function(){
        this.activity.loader(true)

        if((object.movie.original_language == 'ja' || object.movie.original_language == 'zh') && object.movie.genres.find(g=>g.id == 16) && Storage.field('language') !== 'en'){
            network.silent(TMDB.api((object.movie.name ? 'tv' : 'movie') + '/' + object.movie.id + '?api_key=' + TMDB.key() + '&language=en' ),(result)=>{
                object.search_two = result.name || result.title

                this.parse()
            },this.parse.bind(this))
        }
        else{
            this.parse()
        }

        scroll.onEnd = this.next.bind(this)

        return this.render()
    }

    this.parse = function(){
        filter = new Filter(object)

        Parser.get(object,(data)=>{
            results = data

            this.build()

            Layer.update(scroll.render(true))

            this.activity.loader(false)

            this.activity.toggle()
        },(text)=>{
            this.empty(Lang.translate('torrent_error_connect') + ': ' + text)
        })

        filter.onSearch = (value)=>{
            Activity.replace({
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

        filter.addButtonBack()

        files.appendHead(filter.render())
    }

    this.empty = function(descr, add_button){
        let em_params = {
            descr: descr,
        }

        if(add_button){
            em_params.buttons = [
                {
                    title: Lang.translate('filter_clarify'),
                    onEnter: ()=>{
                        filter.render().find('.filter--search').trigger('hover:enter')
                    }
                }
            ]
        }

        let empty = new Empty(em_params)

        files.render().find('.explorer__files-head').addClass('hide')

        files.appendFiles(empty.render(filter.empty()))

        scroll.body().removeClass('torrent-list')

        this.start = empty.start.bind(empty)

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.listEmpty = function(){
        let em = Template.get('empty_filter')
        let bn = $('<div class="simple-button selector"><span>'+Lang.translate('filter_clarify')+'</span></div>')

        bn.on('hover:enter',()=>{
            filter.render().find('.filter--filter').trigger('hover:enter')
        })

        em.find('.empty-filter__subtitle').text(Lang.translate('empty_text'))
        em.find('.empty-filter__title').remove()
        em.find('.empty-filter__buttons').removeClass('hide').append(bn)

        scroll.body().removeClass('torrent-list')

        scroll.append(em)
    }

    this.buildSorted = function(){
        let need   = Storage.get('torrents_sort','Seeders')
        let select = [
            {
                title: Lang.translate('torrent_parser_sort_by_seeders'),
                sort: 'Seeders'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_size'),
                sort: 'Size'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_name'),
                sort: 'Title'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_tracker'),
                sort: 'Tracker'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_date'),
                sort: 'PublisTime'
            },
            {
                title: Lang.translate('torrent_parser_sort_by_viewed'),
                sort: 'viewed'
            }
        ]

        select.forEach(element => {
            if(element.sort == need) element.selected = true
        });

        filter.sort(results.Results, need)

        this.sortWithPopular()

        filter.set('sort', select)

        this.selectedSort()
    }

    this.sortWithPopular = function(){
        let popular = []
        let other   = []

        results.Results.forEach((a)=>{
            if(a.viewing_request) popular.push(a)
            else other.push(a)
        })

        popular.sort((a,b)=>b.viewing_average - a.viewing_average)

        results.Results = popular.concat(other)
    }

    this.cardID = function(){
        return object.movie.id + ':' + (object.movie.number_of_seasons ? 'tv' : 'movie')
    }

    this.getFilterData = function(){
        let all = Storage.cache('torrents_filter_data',500,{})
        let cid = this.cardID()

        return all[cid] || Storage.get('torrents_filter','{}') 
    }

    this.setFilterData = function(filter){
        let all = Storage.cache('torrents_filter_data',500,{})
        let cid = this.cardID()

        all[cid] = filter

        Storage.set('torrents_filter_data',all)
        Storage.set('torrents_filter',filter)
    }

    this.buildFilterd = function(){
        let need     = this.getFilterData()
        let select   = []

        let add = (type, title)=>{
            let items    = filter_items[type]
            let subitems = []
            let multiple = filter_multiple.indexOf(type) >= 0
            let value    = need[type]

            if(multiple) value = Arrays.toArray(value)

            items.forEach((name, i) => {
                subitems.push({
                    title: name,
                    //selected: multiple ? i == 0 : value == i,
                    checked: multiple && value.indexOf(name) >= 0,
                    checkbox: multiple && i > 0,
                    noselect: true,
                    index: i
                })
            })

            select.push({
                title: title,
                subtitle: multiple ? (value.length ? value.join(', ') : items[0]) : (typeof value == 'undefined' ? items[0] : items[value]),
                items: subitems,
                noselect: true,
                stype: type
            })
        }

        filter_items.voice   = [Lang.translate('torrent_parser_any_two'),Lang.translate('torrent_parser_voice_dubbing'),Lang.translate('torrent_parser_voice_polyphonic'),Lang.translate('torrent_parser_voice_two'),Lang.translate('torrent_parser_voice_amateur')]
        filter_items.tracker = [Lang.translate('torrent_parser_any_two')]
        filter_items.season  = [Lang.translate('torrent_parser_any_two')]

        

        results.Results.forEach(element => {
            let title = element.Title.toLowerCase(),
                tracker = element.Tracker;
            
            for(let i = 0; i < voices.length; i++){
                let voice = voices[i].toLowerCase()

                if(title.indexOf(voice) >= 0){
                    if(filter_items.voice.indexOf(voices[i]) == -1) filter_items.voice.push(voices[i])
                }
                
                if(element.info && element.info.voices){
                    if(element.info.voices.map(v=>v.toLowerCase()).indexOf(voice) >= 0){
                        if(filter_items.voice.indexOf(voices[i]) == -1) filter_items.voice.push(voices[i])
                    }
                }
            }

            tracker.split(',').forEach(t=>{
                if(filter_items.tracker.indexOf(t.trim()) === -1) filter_items.tracker.push(t.trim())
            })

            let season = title.match(/.?s\[(\d+)-\].?|.?s(\d+).?|.?\((\d+) сезон.?|.?season (\d+),.?/)

            if(season){
                season = season.filter(c=>c)

                if(season.length > 1){
                    let orig   = season[1]
                    let number = parseInt(orig) + ''

                    if(number && finded_seasons.indexOf(number) == -1){
                        finded_seasons.push(number)
                        finded_seasons_full.push(orig)
                    }
                }
            }
        })

        finded_seasons_full.sort((a,b)=>{
            let ac = parseInt(a)
            let bc = parseInt(b)

            if(ac > bc) return 1
            else if(ac < bc) return -1
            else return 0
        })

        finded_seasons.sort((a,b)=>{
            let ac = parseInt(a)
            let bc = parseInt(b)

            if(ac > bc) return 1
            else if(ac < bc) return -1
            else return 0
        })

        if(finded_seasons.length) filter_items.season = filter_items.season.concat(finded_seasons)

        
        //надо очистить от отсутствующих ключей
        need.voice   = Arrays.removeNoIncludes(Arrays.toArray(need.voice), filter_items.voice)
        need.tracker = Arrays.removeNoIncludes(Arrays.toArray(need.tracker), filter_items.tracker)
        need.season  = Arrays.removeNoIncludes(Arrays.toArray(need.season), filter_items.season)

        this.setFilterData(need)

        select.push({
            title: Lang.translate('torrent_parser_reset'),
            reset: true
        })

        add('quality',Lang.translate('torrent_parser_quality'))
        add('hdr','HDR')
        add('dv','Dolby Vision')
        add('sub',Lang.translate('torrent_parser_subs'))
        add('voice',Lang.translate('torrent_parser_voice'))
        add('lang',Lang.translate('title_language_short'))
        add('season', Lang.translate('torrent_parser_season'))
        add('tracker', Lang.translate('torrent_parser_tracker'))
        add('year', Lang.translate('torrent_parser_year'))
        add('_3d', '3D')


        filter.set('filter', select)

        this.selectedFilter()
    }

    this.selectedFilter = function(){
        let need   = this.getFilterData(),
            select = []

        for(let i in need){
            if(need[i]){
                if(Arrays.isArray(need[i])){
                    if(need[i].length) select.push(filter_translate[i] + ':' + need[i].join(', '))
                }
                else{
                    select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
                }
            }
        }

        filter.chosen('filter', select)
    }

    this.selectedSort = function(){
        let select = Storage.get('torrents_sort','Seeders')

        filter.chosen('sort', [sort_translate[select]])
    }

    this.build = function(){
        this.buildSorted()
        this.buildFilterd()

        this.filtred()

        filter.onSelect = (type, a, b)=>{
            if(type == 'sort'){
                Storage.set('torrents_sort',a.sort)

                filter.sort(results.Results, a.sort)

                this.sortWithPopular()
            }
            else{
                if(a.reset){
                    this.setFilterData({})

                    this.buildFilterd()
                }
                else{
                    a.items.forEach(n=>n.checked = false)

                    let filter_data = this.getFilterData()

                    filter_data[a.stype] = filter_multiple.indexOf(a.stype) >= 0 ? [] : b.index

                    a.subtitle = b.title

                    this.setFilterData(filter_data)
                }
            }

            this.applyFilter()

            this.start()
        }

        filter.onCheck = (type, a, b)=>{
            let data = this.getFilterData(),
                need = Arrays.toArray(data[a.stype])

            if(b.checked && need.indexOf(b.title)) need.push(b.title)
            else if(!b.checked) Arrays.remove(need, b.title)

            data[a.stype] = need

            this.setFilterData(data)

            a.subtitle = need.length ? need.join(', ') : a.items[0].title

            this.applyFilter()
        }

        this.showResults()
    }

    this.applyFilter = function(){
        this.filtred()

        this.selectedFilter()

        this.selectedSort()

        this.reset()

        this.showResults()

        last = scroll.render().find('.torrent-item:eq(0)')[0]

        if(last) scroll.update(last)
        else scroll.reset()
    }

    this.filtred = function(){
        let filter_data = this.getFilterData()
        let filter_any  = false

        for(let i in filter_data){
            let filr = filter_data[i]

            if(filr){
                if(Arrays.isArray(filr)){
                    if(filr.length) filter_any = true
                } 
                else filter_any = true
            }
        }

        filtred  = results.Results.filter((element)=>{
            if(filter_any){
                let passed  = false,
                    nopass  = false,
                    title   = element.Title.toLowerCase(),
                    tracker = element.Tracker;

                let qua = Arrays.toArray(filter_data.quality),
                    hdr = filter_data.hdr,
                    dv  = filter_data.dv,
                    sub = filter_data.sub,
                    voi = Arrays.toArray(filter_data.voice),
                    tra = Arrays.toArray(filter_data.tracker),
                    ses = Arrays.toArray(filter_data.season),
                    lng = Arrays.toArray(filter_data.lang),
                    yer = filter_data.year,
                    _3d = filter_data._3d

                let test = function(search, test_index){
                    let regex = new RegExp(search)
                    
                    return test_index ? title.indexOf(search) >= 0 : regex.test(title)
                }

                let check = function(search, invert){
                    if(test(search)){
                        if(invert) nopass = true
                        else passed = true
                    } 
                    else{
                        if(invert) passed = true
                        else nopass = true
                    } 
                }

                let includes = function(type, arr){
                    if(!arr.length) return

                    let any = false

                    arr.forEach(a=>{
                        if(type == 'quality'){
                            if(a == '4k' && test('(4k|uhd)[ |\\]|,|$]|2160[pр]|ultrahd')) any = true
                            if(a == '1080p' && test('fullhd|1080[pр]')) any = true
                            if(a == '720p' && test('720[pр]')) any = true
                        }
                        if(type == 'voice'){
                            let p = filter_items.voice.indexOf(a)
                            let n = element.info && element.info.voices ? element.info.voices.map(v=>v.toLowerCase()) : []

                            if(p == 1){
                                if(test('дублирован|дубляж|  apple| dub| d[,| |$]|[,|\\s]дб[,|\\s|$]')) any = true
                            }
                            else if(p == 2){
                                if(test('многоголос| p[,| |$]|[,|\\s](лм|пм)[,|\\s|$]')) any = true
                            }
                            else if(p == 3){
                                if(test('двухголос|двуголос| l2[,| |$]|[,|\\s](лд|пд)[,|\\s|$]')) any = true
                            }
                            else if(p == 4){
                                if(test('любитель|авторский| l1[,| |$]|[,|\\s](ло|ап)[,|\\s|$]')) any = true
                            }
                            else if(test(a.toLowerCase(),true)) any = true
                            else if(n.length && n.indexOf(a.toLowerCase()) >= 0) any = true
                        }
                        if(type == 'lang'){
                            let p = filter_items.lang.indexOf(a)
                            let c = filter_langs[p - 1]

                            if(c){
                                if(element.languages){                            
                                    if(element.languages.find(l=>l.toLowerCase().slice(0,2) == c.code)) any = true
                                }
                                else if(title.indexOf(c.code) >= 0) any = true
                            }
                            else any = true
                        }
                        if(type == 'tracker'){
                            if(tracker.split(',').find(t=>t.trim().toLowerCase() == a.toLowerCase())) any = true
                        }

                        if (type == 'season') {
                            let i = finded_seasons.indexOf(a)
                            let f = parseInt(finded_seasons_full[i])

                            var SES1 = title.match(/\[s(\d+)-(\d+)\]/)
                            var SES2 = title.match(/season (\d+)-(\d+)/)
                            var SES3 = title.match(/season (\d+) - (\d+).?/)
                            var SES4 = title.match(/сезон: (\d+)-(\d+) \/.?/)

                            function pad(n) {
                                return (n < 10 && n != '01') ? '0' + n : n
                            }

                            if(Array.isArray(SES1) && (f >= SES1[1] && f <= SES1[2] || pad(f) >= SES1[1] && pad(f) <= SES1[2] || f >= pad(SES1[1]) && f <= pad(SES1[2]))) any = true
                            if(Array.isArray(SES2) && (f >= SES2[1] && f <= SES2[2] || pad(f) >= SES2[1] && pad(f) <= SES2[2] || f >= pad(SES2[1]) && f <= pad(SES2[2]))) any = true
                            if(Array.isArray(SES3) && (f >= SES3[1] && f <= SES3[2] || pad(f) >= SES3[1] && pad(f) <= SES3[2] || f >= pad(SES3[1]) && f <= pad(SES3[2]))) any = true
                            if(Array.isArray(SES4) && (f >= SES4[1] && f <= SES4[2] || pad(f) >= SES4[1] && pad(f) <= SES4[2] || f >= pad(SES4[1]) && f <= pad(SES4[2]))) any = true

                            if (test('.?\\[0' + f + 'x0.?|.?\\[0' + f + 'х0.?|.?\\[s' + f + '-.?|.?-' + f + '\\].?|.?\\[s0' + f + '\\].?|.?\\[s' + f + '\\].?|.?s' + f + 'e.?|.?s' + f + '-.?|.?сезон: ' + f + ' .?|.?сезон:' + f + '.?|сезон ' +f+ ',.?|\\[' +f+ ' сезон.?|.?\\(' +f+ ' сезон.?|.?season ' +f+'.?')) any = true
                        }
                    })

                    if(any) passed = true
                    else nopass = true
                }

                includes('quality', qua)
                includes('voice', voi)
                includes('tracker', tra)
                includes('season', ses)
                includes('lang', lng)

                if(hdr) check('[\\[| ]hdr[10| |\\]|,|$]',hdr !== 1)

                if(dv == 0){
                    check(filter_items.dv[dv], dv !== 1)
                }
                else if(dv == 1){
                    check('dolby vision')
                }
                else if(dv == 2){
                    check('dolby vision tv')
                }
                else if(dv == 3){
                    check('dolby vision', dv !== 0 )
                }                

                if(sub) check(' sub|[,|\\s]ст[,|\\s|$]', sub !== 1)

                if(yer){
                    check(filter_items.year[yer])
                }

                if(_3d) check(' стереопара|interlace|anaglyph|анаглиф|bd3d|over\\-?under|side\\-?by\\-?side|[\\-\\[\\(| ]((half|h)?ou|(half|h)?sbs|lrq?|abq?|ba|rl|3d[\\- ]video)([ |\\]\\),]|$)', _3d !== 1)

                return nopass ? false : passed
            }
            else return true
        })
    }

    this.showResults = function(){
        total_pages = Math.ceil(filtred.length / 20)

        if(filtred.length){
            scroll.body().addClass('torrent-list')
            
            scroll.append(history.render(true))

            this.append(filtred.slice(0,20))
        }
        else{
            if(results.Results.length) this.listEmpty()
            else this.empty(Lang.translate('search_nofound'), true)
        }

        files.appendFiles(scroll.render())
    }

    this.reset = function(){
        last = false

        scroll.clear()
    }

    this.next = function(){
        if(object.page < 15 && object.page < total_pages){
            object.page++

            let offset = (object.page - 1) * 20

            this.append(filtred.slice(offset,offset + 20), true)
        }
    }

    this.mark = function(element, item, add){
        if(add){
            if(viewed.indexOf(element.hash) == -1){
                viewed.push(element.hash)

                item.append('<div class="torrent-item__viewed">'+Template.get('icon_viewed',{},true)+'</div>')
            }
        }
        else{
            element.viewed = true

            Arrays.remove(viewed, element.hash)

            item.find('.torrent-item__viewed').remove()
        }

        element.viewed = add

        Storage.set('torrents_view', viewed)

        if(!add) Storage.remove('torrents_view',element.hash)
    }

    this.addToBase = function(element){
        Torserver.add({
            poster: object.movie.img,
            title: object.movie.title + ' / ' + object.movie.original_title,
            link: element.MagnetUri || element.Link,
            data:{
                lampa: true,
                movie: object.movie
            }
        },()=>{
            Noty.show(object.movie.title + ' - ' + Lang.translate('torrent_parser_added_to_mytorrents'))
        })
    }

    this.append = function(items, append){
        items.forEach(element => {
            count++

            let date = Utils.parseTime(element.PublishDate)
            let bitrate = object.movie.runtime ? Utils.calcBitrate(element.Size, object.movie.runtime) : 0

            Arrays.extend(element,{
                title: element.Title,
                date: date.full,
                tracker: element.Tracker,
                bitrate: bitrate,
                size: !isNaN(parseInt(element.Size)) ? Utils.bytesToSize(element.Size) : element.size,
                seeds: element.Seeders,
                grabs: element.Peers
            })

            let item = Template.get('torrent',element)

            if(element.ffprobe){
                let ffprobe_elem = item.find('.torrent-item__ffprobe')
                let ffprobe_tags = []
    
                let video = element.ffprobe.find(a=>a.codec_type == 'video')
                let audio = element.ffprobe.filter(a=>a.codec_type == 'audio' && a.tags)
                let subs  = element.ffprobe.filter(a=>a.codec_type == 'subtitle' && a.tags)
                let voice = element.info && element.info.voices ? element.info.voices : []
    
                if(video) ffprobe_tags.push({media: 'video',value: video.width + 'x' + video.height})

                let is_71 = element.ffprobe.find(a=>a.codec_type == 'audio' && a.channels == 8)
                let is_51 = element.ffprobe.find(a=>a.codec_type == 'audio' && a.channels == 6)

                if(is_71) ffprobe_tags.push({media: 'channels',value: '7.1'})
                if(is_51) ffprobe_tags.push({media: 'channels',value: '5.1'})

                audio.forEach(a=>{
                    let line = []
                    let lang = (a.tags.language || '').toUpperCase()
                    let name = a.tags.title || a.tags.handler_name

                    if(lang) line.push(lang)
                    if(name && lang !== 'ENG'){
                        let translate = voice.find(v=>name.toLowerCase().indexOf(v.toLowerCase()) >= 0)
                        
                        name = translate ? translate : name

                        if(name.toLowerCase().indexOf('dub') >= 0 || name.toLowerCase() == 'd') name = Lang.translate('torrent_parser_voice_dubbing')
                        
                        line.push(Utils.shortText(Utils.capitalizeFirstLetter(name),20))
                    }

                    if(line.length) ffprobe_tags.push({media: 'audio',value: line.join(' - ')})
                })

                let find_subtitles = []

                subs.forEach(a=>{
                    let lang = (a.tags.language || '').toUpperCase()

                    if(lang) find_subtitles.push(lang)
                })

                find_subtitles = find_subtitles.filter((el, pos)=>find_subtitles.indexOf(el) == pos)

                find_subtitles.slice(0,4).forEach(a=>{
                    ffprobe_tags.push({media: 'subtitle',value: a})
                })

                if(find_subtitles.length > 4) ffprobe_tags.push({media: 'subtitle',value: '+' + (find_subtitles.length - 4)})

                ffprobe_tags = ffprobe_tags.filter((el, pos)=>ffprobe_tags.map(a=>a.value + a.media).indexOf(el.value + el.media) == pos)
    
                ffprobe_tags.forEach(tag=>{
                    ffprobe_elem.append('<div class="m-'+tag.media+'">'+tag.value+'</div>')
                })
    
                if(ffprobe_tags.length) ffprobe_elem.removeClass('hide')
            }

            if (!bitrate) item.find('.bitrate').remove()

            if(element.viewed) item.append('<div class="torrent-item__viewed">'+Template.get('icon_viewed',{},true)+'</div>')

            if(!element.size || parseInt(element.size) == 0) item.find('.torrent-item__size').remove()

            item.on('hover:focus',(e)=>{
                last = e.target

                scroll.update($(e.target),true)
            }).on('hover:hover hover:touch',(e)=>{
                last = e.target

                Navigator.focused(last)
            }).on('hover:enter',(e)=>{
                last = e.target
                
                Torrent.opened(()=>{
                    this.mark(element, item, true)
                })

                element.poster = object.movie.img

                this.start()

                Torrent.start(element, object.movie)

                Lampa.Listener.send('torrent',{type:'onenter',element,item})
            }).on('hover:long',()=>{
                let enabled = Controller.enabled().name
                let menu = [
                    {
                        title: Lang.translate('torrent_parser_add_to_mytorrents'),
                        tomy: true
                    },
                    {
                        title: Lang.translate('torrent_parser_label_title'),
                        subtitle: Lang.translate('torrent_parser_label_descr'),
                        mark: true
                    },
                    {
                        title: Lang.translate('torrent_parser_label_cancel_title'),
                        subtitle: Lang.translate('torrent_parser_label_cancel_descr'),
                        unmark: true
                    }
                ]

                Lampa.Listener.send('torrent',{type:'onlong',element,item,menu})

                Select.show({
                    title: Lang.translate('title_action'),
                    items: menu,
                    onBack: ()=>{
                        Controller.toggle(enabled)
                    },
                    onSelect: (a)=>{
                        if(a.tomy){
                            this.addToBase(element)
                        }
                        else if(a.mark){
                            this.mark(element, item, true)
                        }
                        else if(a.unmark){
                            this.mark(element, item, false)
                        }
    
                        Controller.toggle(enabled)
                    }
                })
            })

            Lampa.Listener.send('torrent',{type:'render',element,item})

            scroll.append(item)

            if(append) Controller.collectionAppend(item)
        })
    }


    this.back = function(){
        Activity.backward()
    }

    this.start = function(){
        if(!initialized){
            initialized = true

            this.initialize()
        }
        
        Background.immediately(Utils.cardImgBackgroundBlur(object.movie))

        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render(),files.render(true))
                Controller.collectionFocus(last || false,scroll.render(true))

                Navigator.remove(files.render().find('.explorer-card__head-img')[0])
            },
            update: ()=>{},
            up: ()=>{
                if(Navigator.canmove('up')){
                    Navigator.move('up')
                }
                else Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
                else filter.render().find('.filter--filter').trigger('hover:enter')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else files.toggle()
            },
            back: this.back
        })

        Controller.toggle('content')

        listener = new Listener(object.movie)
        
        listener.listener.follow('open',(e)=>{
            if(object.movie.original_name){
                history.set({
                    balanser_name: 'Torrent',
                    season: e.element.season,
                    episode: e.element.episode
                })
            }
        })
    }

    this.pause = function(){
        listener.destroy()
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return files.render()
    }

    this.destroy = function(){
        network.clear()
        Parser.clear()

        files.destroy()

        scroll.destroy()

        listener.destroy()

        results = null
        network = null
    }
}

export default component
