import videocdn from './videocdn'
import rezka from './rezka'
import kinobase from './kinobase'
import collaps from './collaps'

function component(object){
    let network  = new Lampa.Reguest()
    let scroll   = new Lampa.Scroll({mask:true,over: true})
    let files    = new Lampa.Files(object)
    let filter   = new Lampa.Filter(object)
    let balanser = Lampa.Storage.get('online_balanser', 'videocdn')
    

    const sources = {
        videocdn: new videocdn(this, object),
        rezka: new rezka(this, object),
        kinobase: new kinobase(this, object),
        collaps: new collaps(this, object)
    }

    let last
    let last_filter
    let extended
    let selected_id

    let filter_translate = {
        season: 'Сезон',
        voice: 'Перевод',
        source: 'Источник'
    }

    let filter_sources = ['videocdn','rezka','kinobase','collaps']

    // шаловливые ручки
    if(filter_sources.indexOf(balanser) == -1){
        balanser = 'videocdn'

        Lampa.Storage.set('online_balanser', 'videocdn')
    }

    scroll.minus()

    scroll.body().addClass('torrent-list')

    /**
     * Подготовка
     */
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

        filter.render().find('.selector').on('hover:focus',(e)=>{
            last_filter = e.target
        })

        filter.onSelect = (type, a, b)=>{
            if(type == 'filter'){
                if(a.reset){
                    if(extended) sources[balanser].reset()
                    else this.start()
                }
                else{
                    if(a.stype == 'source'){
                        balanser = filter_sources[b.index]

                        Lampa.Storage.set('online_balanser', balanser)

                        this.search()

                        setTimeout(Lampa.Select.close,10)
                    }
                    else{
                        sources[balanser].filter(type, a, b)
                    }
                }
            }
        }

        filter.render().find('.filter--sort').remove()

        filter.render().addClass('torrent-filter')

        files.append(scroll.render())

        scroll.append(filter.render())

        this.search()

        return this.render()
    }

    /**
     * Начать поиск
     */
    this.search = function(){
        this.activity.loader(true)

        this.filter({
            source: filter_sources
        },{source: 0})

        this.reset()

        this.find()
    }

    this.find = function(){
        let url   = 'https://videocdn.tv/api/'
        let query = object.search
        
        url = Lampa.Utils.addUrlComponent(url,'api_token=3i40G5TSECmLF77oAqnEgbx61ZWaOYaE')
        url = Lampa.Utils.addUrlComponent(url,'title='+encodeURIComponent(query))
        
        network.clear()

        network.timeout(1000*15)

        const display = (json)=>{
            if(object.movie.imdb_id){
                let imdb = json.data.filter(elem=>elem.imdb_id == object.movie.imdb_id)

                if(imdb.length) json.data = imdb
            }

            if(json.data && json.data.length){
                if(json.data.length == 1 || object.clarification){
                    this.extendChoice()

                    if(balanser == 'videocdn') sources[balanser].search(object, json.data)
                    else sources[balanser].search(object, json.data[0].kp_id || json.data[0].filmId)
                }
                else{
                    this.similars(json.data)

                    this.loading(false)
                }
            }
            else this.empty('По запросу ('+query+') нет результатов')
        }

        network.silent(url,display.bind(this),(a, c)=>{
            network.timeout(1000*15)

            if(balanser !== 'videocdn'){
                network.silent('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword='+encodeURIComponent(query),(json)=>{
                    json.data = json.films

                    display(json)
                },(a, c)=>{
                    this.empty(network.errorDecode(a,c))
                },false,{
                    headers: {
                        'X-API-KEY': '2d55adfd-019d-4567-bbf7-67d503f61b5a'
                    }
                })
            }
            else{
                this.empty(network.errorDecode(a,c))
            }
        })
    }

    this.extendChoice = function(){
        let data = Lampa.Storage.cache('online_choice_'+balanser, 500, {})
        let save = data[selected_id || object.movie.id] || {}

        extended = true

        sources[balanser].extendChoice(save)
    }

    this.saveChoice = function(choice){
        let data = Lampa.Storage.cache('online_choice_'+balanser, 500, {})

            data[selected_id || object.movie.id] = choice

        Lampa.Storage.set('online_choice_'+balanser, data)
    }

    /**
     * Есть похожие карточки
     * @param {Object} json 
     */
     this.similars = function(json){
        json.forEach(elem=>{
            let year = elem.start_date || elem.year || ''

            elem.title   = elem.title || elem.ru_title || elem.nameRu
            elem.quality = year ? (year + '').slice(0,4) : '----'
            elem.info    = ''

            let item = Lampa.Template.get('online_folder',elem)

            item.on('hover:enter',()=>{
                this.activity.loader(true)

                this.reset()

                object.search_date = year

                selected_id = elem.id

                this.extendChoice()

                if(balanser == 'videocdn') sources[balanser].search(object, [elem])
                else sources[balanser].search(object, elem.kp_id || elem.filmId)
            })

            this.append(item)
        })
    }

    /**
     * Очистить список файлов
     */
    this.reset = function(){
        last = false

        scroll.render().find('.empty').remove()

        filter.render().detach()

        scroll.clear()

        scroll.append(filter.render())
    }

    /**
     * Загрузка
     */
    this.loading = function(status){
        if(status) this.activity.loader(true)
        else{
            this.activity.loader(false)

            this.activity.toggle()
        }
    }

    /**
     * Построить фильтр
     */
    this.filter = function(filter_items, choice){
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

        filter_items.source = filter_sources

        choice.source = filter_sources.indexOf(balanser)

        select.push({
            title: 'Сбросить фильтр',
            reset: true
        })

        Lampa.Storage.set('online_filter', choice)

        if(filter_items.voice && filter_items.voice.length) add('voice','Перевод')

        if(filter_items.season && filter_items.season.length) add('season','Сезон')

        add('source','Источник')

        filter.set('filter', select) 

        this.selected(filter_items)
    }

    /**
     * Закрыть фильтр
     */
    this.closeFilter = function(){
        if($('body').hasClass('selectbox--open')) Lampa.Select.close()
    }

    /**
     * Показать что выбрано в фильтре
     */
    this.selected = function(filter_items){
        let need   = Lampa.Storage.get('online_filter','{}'),
            select = []

        for(let i in need){
            if(filter_items[i] && filter_items[i].length){
                if(i == 'voice' || i == 'source'){
                    select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
                }
                else{
                    if(filter_items.season.length >= 1){
                        select.push(filter_translate.season + ': ' + filter_items[i][need[i]])
                    }
                }
            }
        }

        filter.chosen('filter', select)
    }

    /**
     * Добавить файл
     */
    this.append = function(item){
        item.on('hover:focus',(e)=>{
            last = e.target

            scroll.update($(e.target),true)
        })

        scroll.append(item)
    }

    /**
     * Показать пустой результат
     */
    this.empty = function(msg){
        let empty = Lampa.Template.get('list_empty')

        if(msg) empty.find('.empty__descr').text(msg)

        scroll.append(empty)

        this.loading(false)
    }

    /**
     * Начать навигацию по файлам
     */
    this.start = function(first_select){
        if(first_select){
            last = scroll.render().find('.selector').eq(2)[0]
        }

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
                if(Navigator.canmove('right')) Navigator.move('right')
                else filter.show('Фильтр','filter')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Lampa.Controller.toggle('menu')
            },
            back: this.back
        })

        Lampa.Controller.toggle('content')
    }

    this.render = function(){
        return files.render()
    }

    this.back = function(){
        Lampa.Activity.backward()
    }

    this.pause = function(){}

    this.stop = function(){}

    this.destroy = function(){
        network.clear()

        files.destroy()

        scroll.destroy()

        network = null

        sources.videocdn.destroy()
        sources.rezka.destroy()
        sources.kinobase.destroy()
        sources.collaps.destroy()
    }
}

export default component
