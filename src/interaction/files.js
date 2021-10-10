import Template from './template'
import Activity from './activity'

function create(params = {}){
    let html = Template.get('files',params.movie)

    html.find('.selector').on('hover:enter',()=>{
        Activity.push({
            url: '',
            component: 'full',
            id: params.movie.id,
            method: params.movie.name ? 'tv' : 'movie',
            card: params.movie
        })
    })

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