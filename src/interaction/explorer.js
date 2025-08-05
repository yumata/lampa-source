import Template from './template'
import Activity from './activity'
import Utils from '../utils/math'
import Scroll from '../interaction/scroll'
import Controller from './controller'
import Arrays from '../utils/arrays'
import Emit from '../utils/emit'
import TMDB from '../utils/api/tmdb'

class Explorer extends Emit {
    constructor(object){
        super()

        Arrays.extend(object, {params: {}})
        
        this.object = object
        this.params = object.params || {}

        this.html   = Template.get('explorer',{})
        this.scroll = new Scroll({mask:true,over: true})
        this.card   = this.html.find('.explorer__card').clone()

        this.html.find('.explorer__left').empty().append(this.scroll.render())
        this.html.find('.explorer__files-head').toggleClass('hide', true)

        this.scroll.append(this.card)
        this.scroll.minus()

        this.movie()

        this.emit('init')
    }

    movie(){
        let movie = this.object.movie || this.object.card || {}

        Arrays.extend(movie, {
            title: 'Фильм не найден',
            original_title: '',
            img: './img/img_broken.svg',
            genres: [{name: 'Комедия'}, {name: 'Боевик'}, {name: 'Драма'}],
            overview: 'Этот фильм мог бы быть интересным, но, к сожалению, нет данных о нём.',
            release_date: new Date().getFullYear() + '-01-01',
            vote_average: 8,
            production_countries: [{iso_3166_1: 'US'}],
        })

        if(movie.id){
            this.html.find('.selector').on('hover:enter',()=>{
                if(Activity.all().length > 1){
                    Activity.back()
                }
                else{
                    Activity.push({
                        url: movie.url,
                        component: 'full',
                        id: movie.id,
                        method: movie.name ? 'tv' : 'movie',
                        card: movie,
                        source: movie.source || this.object.source || 'tmdb'
                    })
                }
                
            })
        }

        let year      = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0,4)
        let pg        = TMDB.parsePG(movie)
        let countries = TMDB.parseCountries(movie)
        let rate      = parseFloat((movie.vote_average || 0) +'')
        let title     = movie.title || movie.name || ''
        let genres    = (movie.genres || [{name: ''}]).slice(0,3).map((a)=>{
            return Utils.capitalizeFirstLetter(a.name)
        })

        this.html.find('.explorer-card__head-create').text(year + (countries.length ? ' - ' + countries[0] : '')).toggleClass('hide',Boolean(year == '0000'))
        this.html.find('.explorer-card__head-rate').toggleClass('hide',!Boolean(rate > 0)).find('span').text(rate.toFixed(1))
        this.html.find('.explorer-card__title').text(title).toggleClass('small',Boolean(title.length > 50))
        this.html.find('.explorer-card__descr').text(movie.overview || '')
        this.html.find('.explorer-card__genres').text(genres.join(', '))

        if(pg) this.html.find('.explorer-card__head-body').append('<div class="explorer-card__head-age">'+pg+'</div>')

        if(this.params.noinfo) this.html.addClass('explorer--fullsize')

        this.img = this.html.find('.explorer-card__head-img > img')[0]
        this.img.style.opacity = 0

        this.img.onload = ()=>{
            this.img.style.opacity = 1
        }

        this.img.onerror = ()=>{
            this.img.src = './img/img_broken.svg'
        }

        this.img.src = movie.poster_path ? TMDB.img(movie.poster_path, 'w300') : movie.img || './img/img_broken.svg'

        this.emit('movie')
    }

    appendFiles(element){
        this.html.find('.explorer__files-body').append(element)
    }

    appendLeft(element){
        this.scroll.append(element)
    }

    appendHead(element){
        this.html.find('.explorer__files-head').append(element).toggleClass('hide', false)
    }

    render(js){
        return js ? this.html[0] : this.html
    }

    clearFiles(){
        this.html.find('.explorer__files-body').empty()
    }

    clearLeft(){
        this.scroll.clear()
    }

    clearHead(){
        this.html.find('.explorer__files-head').empty().toggleClass('hide', true)
    }

    toggle(){
        let controller = {
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.scroll.render(true))
                Controller.collectionFocus(false,this.scroll.render(true))
            },
            left: ()=>{
                Controller.toggle('menu')
            },
            up: ()=>{
                if(this.scroll.position() == 0) Controller.toggle('head')
                else if(this.scroll.position() > -170){
                    this.scroll.wheel(this.scroll.position())

                    Controller.toggle('explorer')
                }
                else this.scroll.wheel(-150)
            },
            right: ()=>{
                Controller.toggle('content')
            },
            down: ()=>{
                Controller.clear()

                this.scroll.wheel(150)
            },
            back: ()=>{
                Activity.backward()
            }
        }

        this.emit('controller', controller)

        Controller.add('explorer', controller)

        Controller.toggle('explorer')
    }

    destroy(){
        this.scroll.destroy()

        this.html.remove()

        this.img.onerror = () => {}

        this.img.src = ''

        this.emit('destroy')
    }
}

export default Explorer