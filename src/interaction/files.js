import Template from './template'

function create(params = {}){
    let html = Template.get('files',params.movie)

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