import Empty from '../interaction/empty/empty'
import Emit from '../utils/emit'

/**
 * Компонент "Нет контента"
 * @param {*} object 
 */
class Component extends Emit{
    constructor(object){
        super()

        this.object = object || {}

        this.emit('init')
    }

    create(){
        this.html = $('<div></div>')

        this.empty = new Empty({})

        this.html.append(this.empty.render())

        this.start = this.empty.start.bind(this.empty)

        this.emit('create')

        this.activity.loader(false)

        this.activity.toggle()
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()

        this.emit('destroy')
    }
}

export default Component