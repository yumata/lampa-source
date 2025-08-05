import Template from '../template'
import Emit from '../../utils/emit'

class Register extends Emit {
    constructor(data) {
        super()

        this.data = data

        this.emit('init')
    }

    create() {
        this.html = Template.js('register')

        this.html.addClass('selector')

        this.html.find('.register__name').text(this.data.title)
        this.html.find('.register__counter').text(this.data.count)

        this.html.on('hover:focus', this.emit.bind(this, 'focus', this.html, this.data))

        this.html.on('hover:touch', this.emit.bind(this, 'touch', this.html, this.data))
        
        this.html.on('hover:hover', this.emit.bind(this, 'hover', this.html, this.data))

        this.html.on('hover:enter', this.emit.bind(this, 'enter', this.html, this.data))
        
        this.html.on('hover:long', this.emit.bind(this, 'long', this.html, this.data))

        this.emit('create')
    }

    render(js = false) {
        return js ? this.html : $(this.html)
    }

    destroy() {
        this.html.remove()

        this.emit('destroy')
    }
}

export default Register