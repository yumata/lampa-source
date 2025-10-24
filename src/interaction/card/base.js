import Emit from '../../utils/emit'
import Arrays from '../../utils/arrays'

class Base extends Emit{
    constructor(data) {
        super()

        Arrays.extend(data, {
            title: data.name,
            original_title: data.original_name,
            release_date: data.first_air_date,
            params: {}
        })

        Arrays.extend(data.params, {
            style: {
                name: 'default',
            }
        })

        this.data   = data
        this.params = data.params
    }

    create() {
        this.html = document.createElement('div')

        this.emit('create')
    }

    visible(){
        this.emit('visible')
    }

    update(){
        this.emit('update')
    }

    render(js) {
        return js ? this.html : $(this.html)
    }

    disable(status = true){
        this.disabled = status

        this.html.toggleClass('card--disabled', status)

        this.emit('disable', status)
    }

    destroy() {
        this.html.remove()

        this.emit('destroy')
    }
}

export default Base