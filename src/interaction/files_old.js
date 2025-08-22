import Template from './template'
import Activity from './activity/activity'

function create(params = {}){
    let html = Template.get('files',params.movie)

    html.addClass('layer--width')

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

    this.render = function(){
        return html
    }

    this.append = function(add){
        html.find('.files__body').append(add)
    }

    this.destroy = function(){
        html.remove()

        html = null
    }

    this.clear = function(){
        html.find('.files__body').empty()
    }
}

export default create