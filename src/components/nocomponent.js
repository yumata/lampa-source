import Controller from '../interaction/controller'
import Empty from '../interaction/empty'
import Activity from '../interaction/activity'
import Lang from '../utils/lang'

/**
 * Компонент "Нет контента"
 * @param {*} object 
 */
function component(object){
    let html = $('<div></div>')
    let empty = new Empty()
    
    this.create = function(){
        let card = object.movie || object.card
        let foot = $('<div class="empty__footer"></div>')

        let button_reset = $('<div class="simple-button selector">'+ Lang.translate('title_reset') +'</div>')
        let button_movie = $('<div class="simple-button selector">'+ Lang.translate('back_to_card') +'</div>')

        button_reset.on('hover:enter',()=>{
            Activity.replace()
        })

        foot.append(button_reset)

        if(card){
            button_movie.on('hover:enter',()=>{
                Activity.replace({
                    component: 'full',
                    card: card,
                    id: card.id,
                    method: card.number_of_seasons ? 'tv' : 'movie',
                    source: card.source || 'cub'
                })
            })

            foot.append(button_movie)
        }

        empty.append(foot)

        html.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(empty.render())
                Controller.collectionFocus(false,empty.render())
            },
            left: ()=>{
                Controller.toggle('menu')
            },
            up: ()=>{
                Controller.toggle('head')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        html.remove()
    }
}

export default component