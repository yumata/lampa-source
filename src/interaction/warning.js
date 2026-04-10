import Template from './template'

function Warning(params){
    this.params = params

    this.html = Template.get('warning', params)

    if(params.button){
        let button = $('<div class="simple-button">'+(params.button.title || '')+'</div>')

        this.html.find('.warning-box__right').toggleClass('hide', false).append(button)
    }

    if(params.onSelect){
        this.html.addClass('selector').on('hover:enter', params.onSelect)
    }

    this.render = function(js){
        return js ? this.html[0] : this.html
    }

    this.destroy = function(){
        this.html.remove()
        this.html = null
    }
}

export default Warning