import Template from '../template'

class Register {
    constructor(data) {
        this.data = data
    }

    create() {
        this.html = Template.js('register')
        
        this.html.addClass('selector')

        this.html.find('.register__name').text(this.data.title)
        this.html.find('.register__counter').text(this.data.count)
    }

    render(js = false) {
        return js ? this.html : $(this.html)
    }

    destroy() {
        this.html.remove()
    }
}

export default Register