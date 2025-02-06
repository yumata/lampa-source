import Template from './template'
import Activity from './activity'
import Api from './api'
import Utils from '../utils/math'
import Scroll from '../interaction/scroll'
import Controller from './controller'
import Arrays from '../utils/arrays'

function Explorer(params = {}){
    let html = Template.get('explorer',{})
    let scroll = new Scroll({mask:true,over: true})

    let card = html.find('.explorer__card').clone()

    html.find('.explorer__left').empty().append(scroll.render())

    scroll.append(card)
    scroll.minus()

    Arrays.extend(params, {
        movie: {
            title: '',
            original_title: '',
            img: './img/img_broken.svg',
            genres: []
        }
    })

    if(params.movie.id){
        html.find('.selector').on('hover:enter',()=>{
            if(Activity.all().length > 1){
                Activity.back()
            }
            else{
                Activity.push({
                    url: params.movie.url,
                    component: 'full',
                    id: params.movie.id,
                    method: params.movie.name ? 'tv' : 'movie',
                    card: params.movie,
                    source: params.movie.source
                })
            }
            
        })
    }
    else{
        html.find('.selector').removeClass('selector')
    }

    let year = ((params.movie.release_date || params.movie.first_air_date || '0000') + '').slice(0,4)
    let pg   = Api.sources.tmdb.parsePG(params.movie)
    let countries = Api.sources.tmdb.parseCountries(params.movie)
    let img = html.find('.explorer-card__head-img > img')[0]
    let rate = parseFloat((params.movie.vote_average || 0) +'')
    let title = params.movie.title || params.movie.name || ''

    let genres = (params.movie.genres || [{name: ''}]).slice(0,3).map((a)=>{
        return Utils.capitalizeFirstLetter(a.name)
    })


    html.find('.explorer-card__head-create').text(year + (countries.length ? ' - ' + countries[0] : '')).toggleClass('hide',Boolean(year == '0000'))
    html.find('.explorer-card__head-rate').toggleClass('hide',!Boolean(rate > 0)).find('span').text(rate.toFixed(1))
    html.find('.explorer-card__title').text(title).toggleClass('small',Boolean(title.length > 50))
    html.find('.explorer-card__descr').text(params.movie.overview || '')
    html.find('.explorer-card__genres').text(genres.join(', '))

    if(pg) html.find('.explorer-card__head-body').append('<div class="explorer-card__head-age">'+pg+'</div>')

    if(params.noinfo) html.addClass('explorer--fullsize')


    img.onerror = function(e){
        img.src = './img/img_broken.svg'
    }

    img.src = params.movie.poster_path ? Api.img(params.movie.poster_path, 'w300') : params.movie.img


    this.appendFiles = function(element){
        html.find('.explorer__files-body').append(element)
    }

    this.appendHead = function(element){
        html.find('.explorer__files-head').append(element)
    }

    this.render = function(){
        return html
    }

    this.clearFiles = function(){
        html.find('.explorer__files-body').empty()
    }

    this.clearHead = function(){
        html.find('.explorer__files-head').empty()
    }

    this.toggle = function(){
        Controller.add('explorer',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render(true))
                Controller.collectionFocus(false,scroll.render(true))
            },
            left: ()=>{
                Controller.toggle('menu')
            },
            up: ()=>{
                if(scroll.position() == 0) Controller.toggle('head')
                else if(scroll.position() > -170){
                    scroll.wheel(scroll.position())

                    Controller.toggle('explorer')
                }
                else scroll.wheel(-150)
            },
            right: ()=>{
                Controller.toggle('content')
            },
            down: ()=>{
                Controller.clear()

                scroll.wheel(150)
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('explorer')
    }

    this.destroy = function(){
        html.remove()

        img.onerror = () => {}

        img.src = ''
    }
}

export default Explorer