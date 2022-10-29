import Template from './template'
import Activity from './activity'
import Api from './api'
import Utils from '../utils/math'

function Explorer(params = {}){
    let html = Template.get('explorer',{})

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

    let genres = (params.movie.genres || ['---']).slice(0,3).map((a)=>{
        return Utils.capitalizeFirstLetter(a.name)
    })


    html.find('.explorer-card__head-create').text(year + (countries.length ? ' - ' + countries[0] : ''))
    html.find('.explorer-card__head-rate span').text(parseFloat((params.movie.vote_average || 0) +'').toFixed(1))
    html.find('.explorer-card__title').text(params.movie.title || params.movie.name)
    html.find('.explorer-card__descr').text(params.movie.overview || '')
    html.find('.explorer-card__genres').text(genres.join(', '))

    if(pg) html.find('.explorer-card__head-body').append('<div class="explorer-card__head-age">'+pg+'</div>')


    img.onerror = function(e){
        img.src = './img/img_broken.svg'
    }

    img.src = params.movie.img


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

    this.destroy = function(){
        html.remove()

        img.onerror = () => {}

        img.src = ''
    }
}

export default Explorer