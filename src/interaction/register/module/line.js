import Template from '../../template'

class Module{
    onCreate(){
        this.html = Template.js('register')
        
        this.html.addClass('selector register--line')

        this.html.find('.register__name').text(this.data.title)
        this.html.find('.register__counter').text(this.data.count)

        if(this.data.limit){
            this.html.find('.register__counter').append(Template.elem('span', {class: 'register__limit', text: '/ ' + this.data.limit}))
        }
    }
}

export default Module