import Empty from '../interaction/empty/base'
import Activity from '../interaction/activity'
import Lang from '../utils/lang'
import Emit from '../utils/emit'
import Router from '../core/router'

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
        this.empty = new Empty()

        let card = this.object.movie || this.object.card
        let foot = $('<div class="empty__footer"></div>')

        let button_reset = $('<div class="simple-button selector">'+ Lang.translate('title_reset') +'</div>')
        let button_movie = $('<div class="simple-button selector">'+ Lang.translate('back_to_card') +'</div>')

        button_reset.on('hover:enter',()=>{
            Activity.replace()
        })

        foot.append(button_reset)

        if(card){
            button_movie.on('hover:enter', Router.call.bind(Router, 'full', card))

            foot.append(button_movie)
        }

        this.empty.append(foot)

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