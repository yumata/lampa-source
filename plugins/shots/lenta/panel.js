import Counter from '../components/counter.js'
import Tags from '../components/tags.js'
import Author from '../components/author.js'
import Likes from '../utils/likes.js'
import Favorite from '../utils/favorite.js'

function Panel(){
    this.html    = Lampa.Template.js('shots_lenta_panel')
    this.network = new Lampa.Reguest()

    this.image   = this.html.find('.shots-lenta-panel__card-img')
    this.title   = this.html.find('.shots-lenta-panel__card-title')
    this.year    = this.html.find('.shots-lenta-panel__card-year')
    this.cardbox = this.html.find('.shots-lenta-panel__card')

    this.poster  = this.image.find('img')

    this.create = function(){
        this.counter_liked = new Counter('Нравится')
        this.counter_saved = new Counter('Сохранено')
        this.tags          = new Tags()
        this.author        = new Author()

        this.author.render().addClass('selector')

        this.html.find('.shots-lenta-panel__counters').append(this.counter_liked.render())
        this.html.find('.shots-lenta-panel__counters').append(this.counter_saved.render())
        this.html.find('.shots-lenta-panel__tags').append(this.tags.render())
        this.html.find('.shots-lenta-panel__author').append(this.author.render())

        this.poster.onload = ()=>{
            this.image.addClass('loaded')
        }

        this.poster.onerror = ()=>{
            this.poster.src = './img/img_broken.svg'
        }

        this.html.find('.action-liked').on('hover:enter', ()=>{
            Likes.toggle(this.shot.id)

            this.updateButtons()
        })

        this.html.find('.action-favorite').on('hover:enter', ()=>{
            Favorite.toggle(this.shot)

            this.updateButtons()
        })
    }

    this.updateButtons = function(){
        this.html.find('.action-liked').toggleClass('active', Likes.find(this.shot.id))
        this.html.find('.action-favorite').toggleClass('active', Favorite.find(this.shot.id))
    }

    this.change = function(shot){
        this.shot = shot
        
        this.counter_liked.update(shot.liked || 0)
        this.counter_saved.update(shot.saved || 0)

        this.tags.update(shot)
        this.author.update(shot.author || {})

        this.network.clear()

        this.load()

        this.updateButtons()
    }

    this.load = function(){
        this.image.removeClass('loaded')
        this.cardbox.addClass('loading')

        let url = Lampa.TMDB.api(this.shot.card.type + '/' + this.shot.card.id + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang'))

        this.network.silent(url, (card)=>{
            this.title.text(card.title || card.name || card.original_title || card.original_name)
            this.year.text((card.release_date || card.first_air_date || '----').slice(0,4))

            this.poster.src = Lampa.TMDB.image('t/p/w300/' + (card.poster_path || card.backdrop_path))

            this.cardbox.removeClass('loading')
        })
    }

    this.toggle = function(){
        Lampa.Controller.collectionSet(this.html)
        Lampa.Controller.collectionFocus(this.html, this.html)
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()

        this.network.clear()
    }
}

export default Panel