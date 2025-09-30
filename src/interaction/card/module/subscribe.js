import Template from '../../template'

export default {
    onCreate: function(){
        if(this.data.subscribe){
            let data = this.data.subscribe
            let sube = Template.elem('div', {class: 'card__subscribe', children: [
                Template.elem('div', {class: 'card__subscribe-status ' + (data.status ? 'on' : 'off')}),
                Template.elem('div', {class: 'card__subscribe-position', text: 'S'+data.season+' E' + data.episode}),
                Template.elem('div', {class: 'card__subscribe-voice', text: data.voice})
            ]})

            this.html.find('.card__view').after(sube)
        }
    }
}