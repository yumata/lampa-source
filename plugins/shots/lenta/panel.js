import Tags from '../components/tags.js'
import Author from '../components/author.js'
import Likes from '../utils/likes.js'
import Favorite from '../utils/favorite.js'
import Modals from '../utils/modals.js'
import Created from '../utils/created.js'

function Panel(){
    this.html    = Lampa.Template.js('shots_lenta_panel')
    this.network = new Lampa.Reguest()
    this.cache   = {}

    this.image   = this.html.find('.shots-lenta-panel__card-img')
    this.title   = this.html.find('.shots-lenta-panel__card-title')
    this.year    = this.html.find('.shots-lenta-panel__card-year')
    this.cardbox = this.html.find('.shots-lenta-panel__card')
    this.last    = this.html.find('.selector')

    this.poster  = this.image.find('img')

    this.create = function(){
        this.tags          = new Tags()
        this.author        = new Author()

        this.author.render().addClass('selector')

        this.html.find('.shots-lenta-panel__tags').append(this.tags.render())
        this.html.find('.shots-lenta-panel__author').append(this.author.render())

        this.poster.onload = ()=>{
            this.image.addClass('loaded')
        }

        this.poster.onerror = ()=>{
            this.poster.src = './img/img_broken.svg'
        }

        this.html.querySelectorAll('.selector').forEach((button)=>{
            button.on('hover:focus hover:hover hover:touch', ()=>{
                this.last = button
            })
        })

        this.html.find('.action-liked').on('hover:enter', ()=>{
            Likes.toggle(this.shot.id, (ready)=>{
                this.shot.liked += ready ? -1 : 1

                Lampa.Listener.send('shots_update', {...this.shot})

                this.update()
            })
        })

        this.html.find('.action-favorite').on('hover:enter', ()=>{
            Favorite.toggle(this.shot, (ready)=>{
                this.shot.saved += ready ? -1 : 1

                Lampa.Listener.send('shots_update', {...this.shot})

                this.update()
            })
        })

        this.html.find('.action-more').on('hover:enter', this.menu.bind(this))

        this.image.on('hover:enter', ()=>{
            Lampa.Controller.back()

            Lampa.Activity.push({
                url: '',
                component: 'full',
                source: 'tmdb',
                id: this.shot.card_id,
                method: this.shot.card_type,
                card: {
                    id: this.shot.card_id
                }
            })
        })
    }

    this.menu = function(){
        let menu = []

        menu.push({
            title: Lampa.Lang.translate('shots_button_report'),
            onSelect: ()=>{
                Modals.shotsReport(this.shot.id, ()=>{
                    Lampa.Controller.toggle('shots_lenta')
                })
            }
        })

        if(Lampa.Account.Permit.account.id == this.shot.cid || Lampa.Account.Permit.account.id == 1){
            menu.push({
                title: Lampa.Lang.translate('shots_button_delete_video'),
                onSelect: ()=>{
                    Modals.shotsDelete(this.shot.id, ()=>{
                        Lampa.Controller.toggle('shots_lenta')

                        Created.remove(this.shot)
                    })
                }
            })
        }

        Lampa.Select.show({
            title: Lampa.Lang.translate('more'),
            items: menu,
            onBack: ()=>{
                Lampa.Controller.toggle('shots_lenta')
            }
        })
    }

    this.update = function(){
        this.html.find('.action-liked').toggleClass('active', Likes.find(this.shot.id))
        this.html.find('.action-favorite').toggleClass('active', Favorite.find(this.shot.id))

        this.tags.update(this.shot)

        let elem_likes = $('<div>'+Lampa.Lang.translate('shots_title_likes') + ' ' + Lampa.Utils.bigNumberToShort(this.shot.liked || 0)+'</div>')
        let elem_saved = $('<div>'+Lampa.Lang.translate('shots_title_saved') + ' ' + Lampa.Utils.bigNumberToShort(this.shot.saved || 0)+'</div>')

        elem_likes.toggleClass('hide', (this.shot.liked || 0) == 0)
        elem_saved.toggleClass('hide', (this.shot.saved || 0) == 0)

        this.tags.render().append(elem_likes)
        this.tags.render().append(elem_saved)
    }

    this.change = function(shot){
        this.shot = shot
        
        this.author.update(shot)

        this.network.clear()

        this.load()

        this.update()
    }

    this.load = function(){
        this.image.removeClass('loaded')
        this.cardbox.addClass('loading')

        if(this.cache[ this.shot.id ]) return this.loadDone(this.cache[ this.shot.id ])

        let url = Lampa.TMDB.api(this.shot.card_type + '/' + this.shot.card_id + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang'))

        this.network.silent(url, this.loadDone.bind(this))
    }

    this.loadDone = function(card){
        this.shot.card_title  = card.title || card.name || card.original_title || card.original_name
        this.shot.card_poster = card.poster_path || card.backdrop_path
        this.shot.card_year   = (card.release_date || card.first_air_date || '----').slice(0,4)

        this.title.text(this.shot.card_title)
        this.year.text(this.shot.card_year)

        this.poster.src = Lampa.TMDB.image('t/p/w300/' + this.shot.card_poster)

        this.cardbox.removeClass('loading')

        this.cache[ this.shot.id ] = card
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        clearTimeout(this.show_timeout)

        this.html.remove()

        this.cache = {}

        this.network.clear()
    }
}

export default Panel