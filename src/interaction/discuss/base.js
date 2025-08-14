import Emit from '../../utils/emit'
import Arrays from '../../utils/arrays'

class Base extends Emit{
    constructor(data) {
        super()

        Arrays.extend(data, {params: {}})

        this.data   = data
        this.params = data.params
    }

    create() {
        this.html = document.createElement('div')

        this.emit('create')
    }

    render() {
        return this.html
    }

    destroy() {
        this.html.remove()

        this.emit('destroy')
    }
}

export default Base