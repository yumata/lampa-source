import videocdn from './videocdn'
import rezka from './rezka'

function component(object){
    const sources = {
        videocdn,
        rezka
    }

    let network = new Lampa.Reguest()
    let scroll  = new Lampa.Scroll({mask:true,over: true})
    let files   = new Lampa.Files(object)
    let filter  = new Lampa.Filter(object)
    let results = []
    let filtred = []

    let balanser = 'videocdn' //Lampa.Storage.get('online_balanser','videocdn')

    let last
    let last_filter

    let filter_items = {
        season: [],
        voice: [],
        voice_info: [],
        choice: {}
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

        filter.onSearch = (value)=>{
            Lampa.Activity.replace({
                search: value,
                clarification: true
            })
        }

        filter.onBack = ()=>{
            this.start()
        }

        this.balanser()

        filter.render().find('.selector').on('hover:focus',(e)=>{
            last_filter = e.target
        })

        filter.render().find('.filter--sort').remove()

        this.search()

        return this.render()
    }

    this.balanser = function(){
        let source = $('<div class="simple-button simple-button--filter selector"><span>Источник</span><div>'+balanser+'</div></div>')

        source.on('hover:enter',()=>{
            Lampa.Select.show({
                title: 'Источник',
                items: [
                    {
                        title: 'Videocdn',
                        source: 'videocdn',
                        selected: balanser == 'videocdn'
                    },
                    {
                        title: 'HDRezka',
                        source: 'rezka',
                        selected: balanser == 'rezka'
                    }
                ],
                onBack: this.start,
                onSelect: (a)=>{
                    scroll.render().find('.online,.empty').remove()

                    balanser = a.source

                    Lampa.Storage.set('online_balanser',a.source)

                    source.find('div').text(a.source)

                    this.search()

                    this.start()
                }
            })
        })

        filter.render().append(source)
    }

    this.search = function(){
        this.activity.loader(true)

        sources[balanser].search(object,(data)=>{
            results = data

            this.build()

            this.activity.loader(false)

            this.activity.toggle()
        },(similars)=>{
            if(similars){
                this.empty('Найдено несколько похожих вариантов, уточните нужный', similars)
            }
            else this.empty('Ой, мы не нашли ('+object.search+')', similars)
        },(e)=>{
            this.empty('Ответ: ' + e)
        })
    }

    this.empty = function(descr, similars){
        let empty = new Lampa.Empty({
            descr: descr
        })

        if(files.render().find('.scroll__content').length){
            this.listEmpty()

            this.start()
        }
        else{
            files.append(empty.render(similars ? filter.similar(similars) : filter.empty()))

            this.start = empty.start
        } 

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.buildFilter = function(select_season){
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
        filter_items.choice = {
            season: 0,
            voice: 0
        }

        sources[balanser].filter({
            results, 
            filter_items,
            select_season
        })

        Lampa.Storage.set('online_filter', object.movie ? filter_items.choice : {})

        select.push({
            title: 'Сбросить фильтр',
            reset: true
        })

        if(object.movie){
            add('voice','Перевод')

            if(object.movie.number_of_seasons) add('season', 'Сезон')
        }

        filter.set('filter', select)

        this.selectedFilter()
    }

    this.selectedFilter = function(){
        let need   = Lampa.Storage.get('online_filter','{}'),
            select = []

        for(let i in need){
            if(i == 'voice'){
                select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
            }
            else{
                if(filter_items.season.length >= 1){
                    select.push(filter_translate.season + ': ' + filter_items[i][need[i]])
                }
            }
        }

        filter.chosen('filter', select)
    }

    

    this.build = function(){
        this.buildFilter()

        this.filtred()

        filter.onSelect = (type, a, b)=>{
            if(type == 'filter'){
                if(a.reset){
                    this.buildFilter()
                }
                else{
                    if(a.stype == 'season'){
                        this.buildFilter(b.index)
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
        filtred = sources[balanser].filtred(results, filter_items)
    }

    this.applyFilter = function(){
        this.filtred()

        this.selectedFilter()

        this.reset()

        this.showResults()

        last = scroll.render().find('.torrent-item:eq(0)')[0]
    }

    this.showResults = function(){
        filter.render().addClass('torrent-filter')

        scroll.append(filter.render())

        if(filtred.length) this.append(filtred)
        else this.listEmpty()

        files.append(scroll.render())
    }

    this.reset = function(){
        last = false

        scroll.render().find('.empty').remove()

        filter.render().detach()

        scroll.clear()
    }

    this.listEmpty = function(){
        scroll.append(Lampa.Template.get('list_empty'))
    }

    this.append = function(items){
        sources[balanser].append({
            scroll,
            items,
            open: this.start.bind(this),
            item: (item)=>{
                item.on('hover:focus',(e)=>{
                    last = e.target
        
                    scroll.update($(e.target),true)
                })
            }
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
                    if(scroll.render().find('.selector').slice(3).index(last) == 0 && last_filter){
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
