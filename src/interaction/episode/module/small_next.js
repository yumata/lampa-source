import Template from '../../template'

export default {
    onCreate: function(){
        this.html = Template.js('full_episode', this.data)

        this.html.addClass('full-episode--small full-episode--next')
    }
}