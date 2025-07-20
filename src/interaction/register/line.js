import Register from './base'
import LineEvents from '../items/line/events'

class RegisterLine extends Register {
    create() {
        super.create()

        this.html.addClass('register--line')

        this.html.on('hover:enter', (e) => {
            if (this.onEnter) this.onEnter(this.html, this.data)
        })

        LineEvents(this, this.data)
    }
}

export default RegisterLine