import Template from '../../template'

class Module{
    onCreate(){
        this.html = Template.js('full_episode', this.data)

        this.html.addClass('full-episode--small full-episode--next')
    }
}

export default Module