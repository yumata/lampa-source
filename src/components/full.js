import Start from '../components/full/start'
import Description from '../components/full/descr'
import Persons from './full/persons'
import Api from '../core/api/api'
import Arrays from '../utils/arrays'
import Discuss from './full/discuss'
import Episodes from './full/episodes'
import Timetable from '../core/timetable'
import Lang from '../core/lang'
import Storage from '../core/storage/storage'
import Utils from '../utils/utils'
import Layer from '../core/layer'
import Platform from '../core/platform'
import Main from '../interaction/items/main/main'
import MainModule from '../interaction/items/main/module/module'
import Cards from './full/cards'
import Background from '../interaction/background'
import Template from '../interaction/template'
import Permit from '../core/account/permit'
import TMDB from '../core/api/sources/tmdb'
import VPN from '../core/vpn'
import Keys from '../core/tmdb/keys'

let components = {
    start: Start,
    description: Description,
    persons: Persons,
    cards: Cards,
    discuss: Discuss,
    episodes: Episodes
}

/**
 * Компонент "Карточка фильма/сериала"
 * @param {*} object 
 */

function component(object){
    let comp = Utils.createInstance(Main, object, {
        module: MainModule.only('Items', 'Empty', 'Callback'),
        empty: {
            cub_button: true
        }
    })

    comp.use({
        onCreate: function(){
            this.tv   = Platform.screen('tv')
            this.view = 3
            this.rows = ['start', 'description']

            this.html.addClass('layer--wheight')

            Api.full(object, (data)=>{
                if(!data.movie) return this.emit('error', {empty: true})

                // Добавляем в пропсы данные
                this.props.set(data)

                // Проверяем по ключевым словам, есть ли в фильме ЛГБТ тематика
                let key_tags   = data.movie.keywords ? (data.movie.keywords.results || data.movie.keywords.keywords) : []
                let lgbt_block = Storage.field('lgbt_content_block') || VPN.is(['ru','by'])

                if(lgbt_block && key_tags && key_tags.find && key_tags.length && window.lampa_settings.lgbt) {
                    Keys.lgbt.forEach(keyword=>{
                        if(key_tags.find(k=>k.name.toLowerCase() == keyword)) data.movie.lgbt = 'keyword (' + keyword + ')'
                    })
                }

                // Если фильм не помечен как ЛГБТ, но есть в списке блокировки ЛГБТ, то помечаем его
                if(lgbt_block && window.lampa_settings.lgbt && !data.movie.lgbt) {
                    if(window.lampa_settings.lgbt[data.movie.id + '_' + (data.movie.first_air_date ? 'tv' : 'movie')]) data.movie.lgbt = 'list'
                }
                
                if(data.movie.blocked || data.movie.lgbt) return this.emit('error', {blocked: true, lgbt: data.movie.lgbt})

                // Для плагинов которые используют Activity.active().card
                object.card = data.movie

                // Проверяем можно ли показывать полную карточку детям
                let watch = Utils.canWatchChildren(TMDB.parsePG(data.movie), Permit.profile.age)

                // Ищем по ключевым словам, есть ли в фильме тематика для взрослых
                let adult_block = key_tags && key_tags.find && key_tags.length ? key_tags.find(key=>Keys.adult.find(word=>key.name.toLowerCase().indexOf(word) >= 0)) : false

                if(Storage.field('adult_content_view')) adult_block = false

                // Если фильм помечен как для взрослых, то добавляем это в данные фильма
                if(adult_block) data.movie.adult = true

                // Отправляем событие, что началась загрузка полной карточки
                if(watch) Lampa.Listener.send('full', {
                    link: this,
                    type:'start',
                    props: this.props,
                    body: $(this.html),
                    object,
                    data
                })

                // Создаем эпизоды
                if(!adult_block && data.episodes && data.episodes.episodes) {
                    let episodes = data.episodes.episodes

                    // Если сериал многосезонный, то выбираем нужный сезон
                    if(data.episodes.seasons_count && data.episodes.seasons_count > 1 && data.episodes.episodes_original) {
                        // Парсим эпизоды по сезонам
                        let seasons = Utils.splitEpisodesIntoSeasons(data.episodes.episodes_original)

                        // Выбираем нужный сезон
                        episodes  = seasons[data.episodes.seasons_count] || seasons[1]

                        // Сохраняем номер сезона
                        data.episodes.name = Lang.translate('torrent_serial_season') + ' ' + data.episodes.seasons_count
                    }

                    let today    = new Date()
                    let date     = [today.getFullYear(),(today.getMonth()+1),today.getDate()].join('-')
                    let time     = Utils.parseToDate(date).getTime()
                    let cameout  = episodes.filter(a=>a.air_date).filter(e=> Utils.parseToDate(e.air_date).getTime() <= time)
                    let comeing  = episodes.filter(a=>a.air_date).filter(e=> Utils.parseToDate(e.air_date).getTime() > time)
                    
                    comeing.forEach(e=>e.comeing = true)

                    if(comeing.length) cameout = cameout.concat(comeing.slice(0, 1))

                    cameout.forEach(episode=>episode.original_name = data.movie.original_name || data.movie.name)

                    this.rows.push(['episodes', {
                        movie: data.movie,
                        title: data.episodes.name || Lang.translate('full_series_release'),
                        results: cameout
                    }])
                }

                // Создаем режиссеров
                if(!adult_block && data.persons && data.persons.crew && data.persons.crew.length) {
                    let directors = data.persons.crew.filter(member => member.job === 'Director')

                    directors.length && this.rows.push(['persons', {
                        results: directors,
                        title: Lang.translate('title_producer')
                    }])
                }

                // Создаем актеров
                if(!adult_block && data.persons && data.persons.cast && data.persons.cast.length) this.rows.push(['persons', {
                    results: data.persons.cast,
                    title: Lang.translate('title_actors')
                }])

                // Создаем отзывы
                if(!adult_block && data.discuss) this.rows.push(['discuss', {
                    ...data.discuss,
                    movie: data.movie,
                    title: Lang.translate('title_comments'),
                    results: data.discuss.result || []
                }])

                // Создаем коллекцию
                if(!adult_block && data.collection && data.collection.results && data.collection.results.length){
                    data.collection.title  = Lang.translate('title_collection')

                    this.rows.push(['cards', data.collection])
                }

                // Создаем рекомендации
                if(!adult_block && data.recomend && data.recomend.results && data.recomend.results.length){
                    data.recomend.title   = Lang.translate('title_recomendations')

                    this.rows.push(['cards', data.recomend])
                }

                // Создаем похожие
                if(!adult_block && data.simular && data.simular.results && data.simular.results.length){
                    data.simular.title   = Lang.translate('title_similar')

                    this.rows.push(['cards', data.simular])
                }

                // Добавляем картинку для фона
                this.html.prepend(Template.elem('img', {class: 'full-start__background'}))

                // Добавляем фоновую картинку
                let background = data.movie.backdrop_path ? Api.img(data.movie.backdrop_path,'w1280') : data.movie.background_image ? data.movie.background_image : ''

                if(window.innerWidth > 790 && background && !Storage.field('light_version')){
                    Utils.imgLoad(this.html.find('.full-start__background'), background, (img)=>img.addClass('loaded'))
                }
                else this.html.find('.full-start__background').remove()

                // Создаем все компоненты
                this.build(this.rows.slice(0, this.view))

                // Обновляем расписание
                Timetable.update(data.movie)

                // Отправляем событие, что полная карточка загружена
                if(watch) Lampa.Listener.send('full', {
                    link: this,
                    type: 'complite',
                    props: this.props,
                    body: $(this.html),
                    object,
                    data
                })

                this.activity.loader(false)

                // Группируем кнопки после полной загрузки
                if(this.items.length) this.items[0].emit('groupButtons')

                this.activity.toggle()

            }, this.emit.bind(this, 'error'))
        },
        onBuild: function(){
            this.scroll.onScroll = this.emit.bind(this, 'scroll')

            // Для планшетов в вертикальном режиме принудительно вызываем скролл
            if(!this.tv) this.emit('scroll', 0)
        },
        onStart: function(){
            this.props.get('movie') && Background.immediately(Utils.cardImgBackgroundBlur(this.props.get('movie')))
        },
        onScroll: function(position){
            let size = this.tv ? (Math.round(this.active / this.view) + 1) * this.view + 1 : this.rows.length
            let add  = this.rows.slice(this.items.length, size)

            if(add.length) {
                this.fragment = document.createDocumentFragment()
                
                add.forEach(this.emit.bind(this, 'createAndAppend'))

                this.scroll.append(this.fragment)
            }

            this.html.find('.full-start__background')?.toggleClass('dim', position > 0)
    
            Layer.visible(this.scroll.render())
        },
        onCreateAndAppend: function(component){
            let name = Arrays.isArray(component) ? component[0] : component
            let data = Arrays.isArray(component) ? component[1] : this.props.all()
            let item = new components[name](data)

            this.emit('instance', item)

            item.create()

            this.emit('append', item)

            // Отправляем событие, что компонент создан
            Lampa.Listener.send('full', {
                link: this,
                type:'build',
                props: this.props,
                body: $(this.html),
                name,
                item,
                data
            })
        },
        onError: function(status){
            let params  = this.params.empty
            let dmca    = Utils.dcma(this.object.method, this.object.id)
            let lgbt    = this.props.get('movie') && this.props.get('movie').lgbt

            if(dmca || status.blocked){
                params.title  = Lang.translate('dmca_title')
                params.descr  = Lang.translate('dmca_descr')
                params.noicon = true
            }

            params.info_button = [
                ['Movie id', this.object.id],
                ['DMCA', dmca ? 'Yes' : 'No'],
                ['LGBT', lgbt ? 'Yes, ' + lgbt : 'No'],
            ]

            if(lgbt){
                params.title = Lang.translate('dmca_title_lgbt')
                params.descr = Lang.translate('dmca_descr_lgbt')

                params.info_button.push(['Title', this.props.get('movie').title || this.props.get('movie').name || '---'])
            }

            // Вызываем пустой экран
            this.empty(status)
        }
    })

    // Переопределяем билд
    comp.build = function(data){
        this.emit('build', data)
    }

    return comp
}

export default component
