import Register from './base'

class RegisterLine extends Register {
    create() {
        super.create()

        this.html.addClass('register--line')

        this.html.on('hover:enter', (e) => {
            if (this.onEnter) this.onEnter(this.html, this.data)
        })
    }
}

export default RegisterLine