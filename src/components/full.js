import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Start from '../components/full/start'
import Descr from '../components/full/descr'
import Persons from './full/persons'
import Line from '../interaction/items/line'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Reviews from './full/reviews'
import Episodes from './full/episodes'
import Timetable from '../utils/timetable'
import Lang from '../utils/lang'
import Storage from '../utils/storage'
import Utils from '../utils/math'
import Layer from '../utils/layer'
import Platform from '../utils/platform'

let components = {
    start: Start,
    descr: Descr,
    persons: Persons,
    recomend: Line,
    simular: Line,
    comments: Reviews,
    episodes: Episodes
}

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step:400,scroll_by_item:false})
    let items   = []
    let create  = []
    let active  = 0
    let tv      = Platform.screen('tv')
    let html    = $('<div class="layer--wheight"><img class="full-start__background"></div>')
    let background_image
    let loaded_data

    this.create = function(){
        this.activity.loader(true)

        if(object.source == 'tmdb' && Storage.field('source') == 'cub'){
            object.source = 'cub'
        }

        scroll.minus()

        scroll.onWheel = (step)=>{
            if(step > 0) this.down()
            else if(active > 0) this.up()
        }

        scroll.onScroll = this.visible.bind(this)

        html.append(scroll.render())

        Api.full(object,(data)=>{
            if(data.movie && data.movie.blocked){
                this.empty()
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

                if(data.comments && data.comments.length) this.build('comments', data)

                if(data.collection && data.collection.results.length){
                    data.collection.title   = Lang.translate('title_collection')
                    data.collection.noimage = true

                    this.build('recomend', data.collection)
                }

                if(data.recomend && data.recomend.results.length){
                    data.recomend.title   = Lang.translate('title_recomendations')
                    data.recomend.noimage = true

                    this.build('recomend', data.recomend)
                }

                if(data.simular && data.simular.results.length){
                    data.simular.title   = Lang.translate('title_similar')
                    data.simular.noimage = true

                    this.build('simular', data.simular)
                }

                Timetable.update(data.movie)

                this.visible()

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

    this.empty = function(){
        let button

        if(object.source == 'tmdb'){
            button = $('<div class="empty__footer"><div class="simple-button selector">'+Lang.translate('change_source_on_cub')+'</div></div>')

            button.find('.selector').on('hover:enter',()=>{
                Storage.set('source','cub')

                Activity.replace({source: 'cub'})
            })
        }

        let empty = new Empty()

        scroll.append(empty.render(button))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.build = function(name, data, params){
        create.push({
            created: false,
            create: ()=>{
                let item = new components[name](data, {object: object, nomore: true, ...params})

                item.onDown = this.down.bind(this)
                item.onUp   = this.up.bind(this)
                item.onBack = this.back.bind(this)
                item.onToggle = ()=>{
                    active = items.indexOf(item)
                }
                item.onScroll = (e)=>{
                    scroll.update(e, true)
                }

                item.create()

                items.push(item)

                Lampa.Listener.send('full',{type:'build',name: name, body: item.render()})

                scroll.append(item.render())

                return item.render()
            }
        })
    }

    this.visible = function(position){
        create.slice(0, tv ? active + 2 : create.length).filter(e=>!e.created).forEach(e=>{
            e.created = true

            e.create()
        })

        Layer.visible(scroll.render(true))

        this.toggleBackgroundOpacity(position)
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        if(items[active]){
            items[active].toggle()

            scroll.update(items[active].render())
        }
    }

    this.up = function(){
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

    this.toggleBackgroundOpacity = function(position){
        if(background_image){
            html.find('.full-start__background').toggleClass('dim', position > 0)
        }
    }

    this.back = function(){
        Activity.backward()
    }

    this.loadBackground = function(data){
        let background = data.movie.backdrop_path ? Api.img(data.movie.backdrop_path,'w1280') : data.movie.background_image ? data.movie.background_image : ''

        if(window.innerWidth > 790 && background && !Storage.field('light_version') && Storage.field('background_type') !== 'poster'){
            background_image = html.find('.full-start__background')[0] || {}

            background_image.onload = function(e){
                html.find('.full-start__background').addClass('loaded')
            }

            background_image.src = background
        }
        else html.find('.full-start__background').remove()
    }

    this.start = function(){
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

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
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

export default component