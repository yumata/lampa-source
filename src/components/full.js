import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Start from '../components/full/start'
import Description from '../components/full/descr'
import Persons from './full/persons'
import Line from '../interaction/items/line'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty/base'
import Reviews from './full/reviews'
import Discuss from './full/discuss'
import Episodes from './full/episodes'
import Timetable from '../utils/timetable'
import Lang from '../utils/lang'
import Storage from '../utils/storage'
import Utils from '../utils/math'
import Layer from '../utils/layer'
import Platform from '../utils/platform'
import Emit from '../utils/emit'
import Main from '../interaction/items/main/full'
import MainModule from '../interaction/items/main/module/module'
import PropsProvider from '../utils/props_provider'
import Cards from './full/cards'
import Background from '../interaction/background'
import Template from '../interaction/template'

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
class Full extends Emit{
    constructor(object){
        super()

        this.object = object

        this.scroll  = new Scroll({mask:true, over:true, step:400})
        this.items   = []
        this.lazy    = []
        this.active  = 0
        this.tv      = Platform.screen('tv')
        this.html    = $('<div class="layer--wheight"><img class="full-start__background"></div>')

        this.emit('init')
    }

    create(){
        this.activity.loader(true)

        this.scroll.minus()

        this.scroll.onWheel = (step)=>{
            if(step > 0) this.down()
            else if(active > 0) this.up()
        }

        this.scroll.onScroll = this.visible.bind(this)

        this.html.append(this.scroll.render())

        this.load()
    }

    load(){

        Api.full(object,(data)=>{
            if(data.movie && data.movie.blocked){
                this.empty({blocked: true})
            }
            else if(data.movie){
                loaded_data = data

                if(Activity.active().activity == this.activity) Activity.active().card = data.movie //для плагинов которые используют Activity.active().card

                Lampa.Listener.send('full',{type:'start',object,data})

                this.build('start', data)

                this.build('descr', data)

                if(data.episodes && data.episodes.episodes) {
                    let today = new Date()
                    let date  = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()
                    let time  = Utils.parseToDate(date).getTime()
                    let plus  = false

                    let cameout = data.episodes.episodes.filter(a=>a.air_date).filter(e=>{
                        let air = Utils.parseToDate(e.air_date).getTime()

                        if(air <= time) return true
                        else if(!plus){
                            plus = true

                            e.plus = true

                            return true
                        }

                        return false
                    })

                    this.build('episodes', cameout, {title: data.movie.original_title || data.movie.original_name, season: data.episodes, movie: data.movie});
                }

                if(data.persons && data.persons.crew && data.persons.crew.length) {
                    const directors = data.persons.crew.filter(member => member.job === 'Director');
                    if(directors.length) {
                        this.build('persons', directors, {title: Lang.translate('title_producer')});
                    }
                }
                if(data.persons && data.persons.cast && data.persons.cast.length) this.build('persons', data.persons.cast)

                if(data.discuss) this.build('discuss', data)
                else if(data.comments && data.comments.length) this.build('comments', data)

                if(data.collection && data.collection.results && data.collection.results.length){
                    data.collection.title   = Lang.translate('title_collection')
                    data.collection.noimage = true
                    data.collection.results.sort(function (a, b) {
                      return new Date(a.release_date) - new Date(b.release_date);
                    });

                    this.build('recomend', data.collection)
                }

                if(data.recomend && data.recomend.results && data.recomend.results.length){
                    data.recomend.title   = Lang.translate('title_recomendations')
                    data.recomend.noimage = true

                    this.build('recomend', data.recomend)
                }

                if(data.simular && data.simular.results && data.simular.results.length){
                    data.simular.title   = Lang.translate('title_similar')
                    data.simular.noimage = true

                    this.build('simular', data.simular)
                }

                Timetable.update(data.movie)

                this.visible(0)

                Lampa.Listener.send('full',{type:'complite',object,data})

                this.loadBackground(data)

                this.activity.toggle()

                this.activity.loader(false)

                Layer.update(html)
            }
            else{
                this.empty()
            }
        },this.empty.bind(this))

        return this.render()
    }

    empty(er = {}){
        let text  = {}

        if(Utils.dcma(object.method, object.id) || er.blocked){
            text.title  = Lang.translate('dmca_title')
            text.descr  = Lang.translate('dmca_descr')
            text.noicon = true
        }

        let empty = new Empty(text)

        empty.addInfoButton([
            ['Movie id', object.id],
            ['DMCA', Utils.dcma(object.method, object.id) ? 'Yes' : 'No']
        ])

        scroll.append(empty.render(true))

        this.start = empty.start.bind(empty)

        this.activity.loader(false)

        this.activity.toggle()
    }

    build(name, data, params){
        create.push({
            created: false,
            create: ()=>{
                let item = new components[name](data, {object: object, nomore: true, ...params})

                item.mscroll = scroll
                item.onDown = this.down.bind(this)
                item.onUp   = this.up.bind(this)
                item.onBack = this.back.bind(this)
                item.onToggle = ()=>{
                    active = items.indexOf(item)
                }
                item.onScroll = (e, center)=>{
                    scroll.update(e, center)
                }

                item.create()

                items.push(item)

                Lampa.Listener.send('full',{type:'build',name: name, body: item.render()})

                scroll.append(item.render())

                return item.render()
            }
        })
    }

    visible(position){
        create.slice(0, tv ? active + 3 : create.length).filter(e=>!e.created).forEach(e=>{
            e.created = true

            e.create()
        })

        //из-за анимации карточки нужно немного подождать и повторно обновить скролл
        setTimeout(()=>{
            Layer.visible(scroll.render(true))
        },100)

        this.toggleBackgroundOpacity(position)
    }

    down(){
        active++

        active = Math.min(active, items.length - 1)

        if(items[active]){
            items[active].toggle()

            scroll.update(items[active].render())
        }
    }

    up(){
        active--

        if(active < 0){
            active = 0

            Controller.toggle('head')
        }
        else{
            items[active].toggle()

            scroll.update(items[active].render())
        }
    }

    toggleBackgroundOpacity(position){
        if(background_image){
            html.find('.full-start__background').toggleClass('dim', position > 0)
        }
    }

    back(){
        Activity.backward()
    }

    loadBackground(data){
        let background = data.movie.backdrop_path ? Api.img(data.movie.backdrop_path,'w1280') : data.movie.background_image ? data.movie.background_image : ''

        if(window.innerWidth > 790 && background && !Storage.field('light_version')){
            background_image = html.find('.full-start__background')[0] || {}

            background_image.onload = function(e){
                html.find('.full-start__background').addClass('loaded')
            }

            background_image.src = background
        }
        else html.find('.full-start__background').remove()
    }

    start(){
        if(items.length && Activity.active().activity == this.activity){
            if(loaded_data) Activity.active().card = loaded_data.movie //на всякий пожарный :D

            items[0].toggleBackground()
        } 

        Controller.add('content',{
            update: ()=>{},
            toggle: ()=>{
                if(items.length){
                    items[active].toggle()
                }
                else{
                    Controller.collectionSet(scroll.render())
                    Controller.collectionFocus(false,scroll.render())
                }
            },
            left: ()=>{
                Controller.toggle('menu')
            },
            up: ()=>{
                Controller.toggle('head')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }


    render(){
        return html
    }

    destroy(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        html.remove()

        items = null
        network = null

        if(background_image){
            background_image.onload = ()=>{}
            background_image.src = ''
        }
    }
}


function component(object){
    let comp = Utils.createInstance(Main, object, {
        module: MainModule.only('Items', 'Callback')
    })

    comp.use({
        onCreate: function(){
            this.tv   = Platform.screen('tv')
            this.view = 3
            this.data = ['start', 'description']

            this.html.addClass('layer--wheight').prepend(Template.elem('img', {class: 'full-start__background'}))

            Api.full(object, (data)=>{
                if(data.movie && data.movie.blocked) return this.empty({blocked: true})

                Activity.props().set(data)

                // Поддержка старого .movie и нового .card
                Activity.props().set('card', data.movie) 

                // Для плагинов которые используют Activity.active().card
                if(Activity.own(this)) object.card = data.movie 

                // Отправляем событие, что началась загрузка полной карточки
                Lampa.Listener.send('full', {
                    link: this,
                    type:'start',
                    object,
                    data
                })

                // Создаем эпизоды
                if(data.episodes && data.episodes.episodes) {
                    let today = new Date()
                    let date  = [today.getFullYear(),(today.getMonth()+1),today.getDate()].join('-')
                    let time  = Utils.parseToDate(date).getTime()

                    Activity.props().set('cameout', data.episodes.episodes.filter(a=>a.air_date).filter(e=> Utils.parseToDate(e.air_date).getTime() <= time))

                    this.data.push('episodes')
                }

                // Создаем режиссеров
                if(data.persons && data.persons.crew && data.persons.crew.length) {
                    let directors = data.persons.crew.filter(member => member.job === 'Director')

                    directors.length && this.data.push(['persons', {
                        results: directors,
                        title: Lang.translate('title_producer')
                    }])
                }

                // Создаем актеров
                if(data.persons && data.persons.cast && data.persons.cast.length) this.data.push(['persons', {
                    results: data.persons.cast,
                    title: Lang.translate('title_actors')
                }])

                // Создаем отзывы
                if(data.discuss) this.data.push('discuss')

                // Создаем рекомендации
                if(data.recomend && data.recomend.results && data.recomend.results.length){
                    data.recomend.title   = Lang.translate('title_recomendations')

                    this.data.push(['cards', data.recomend])
                }

                // Создаем похожие
                if(data.simular && data.simular.results && data.simular.results.length){
                    data.simular.title   = Lang.translate('title_similar')

                    this.data.push(['cards', data.simular])
                }

                // Добавляем фоновую картинку
                let background = data.movie.backdrop_path ? Api.img(data.movie.backdrop_path,'w1280') : data.movie.background_image ? data.movie.background_image : ''

                if(window.innerWidth > 790 && background && !Storage.field('light_version')){
                    let img = this.html.find('.full-start__background') || {}

                    img.onload = function(e){
                        img.addClass('loaded')
                    }

                    img.src = background
                }
                else this.html.find('.full-start__background')?.remove()

                // Создаем все компоненты
                this.build(this.data.slice(0, this.view))

                // Обновляем расписание
                Timetable.update(data.movie)

                // Отправляем событие, что полная карточка загружена
                Lampa.Listener.send('full', {
                    link: this,
                    type:'complite',
                    object,
                    data
                })

            }, this.empty.bind(this))
        },
        onBuild: function(){
            this.scroll.onScroll = this.emit.bind(this, 'scroll')
        },
        onStart: function(){
            Activity.props().get('movie') && Background.immediately(Utils.cardImgBackgroundBlur(Activity.props().get('movie')))
        },
        onScroll: function(position){
            let size = this.tv ? (Math.round(this.active / this.view) + 1) * this.view + 1 : this.data.length
            
            this.data.slice(this.items.length, size).forEach(this.emit.bind(this, 'createAndAppend'))

            this.html.find('.full-start__background')?.toggleClass('dim', position > 0)
    
            Layer.visible(this.scroll.render())
        },
        onCreateAndAppend: function(component){
            let name = Arrays.isArray(component) ? component[0] : component
            let item = new components[name](Arrays.isArray(component) ? component[1] : null)

            this.emit('instance', item)

            item.create()

            this.emit('append', item)

            // Отправляем событие, что компонент создан
            Lampa.Listener.send('full', {
                link: this,
                type:'build',
                name,
                item, 
                body: item.render()
            })
        }
    })

    return comp
}

export default component
