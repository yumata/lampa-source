import Controller from '../interaction/controller'
import Empty from '../interaction/empty'

function component(object){
    let html = $('<div></div>')
    let empty = new Empty()
    
    this.create = function(){

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