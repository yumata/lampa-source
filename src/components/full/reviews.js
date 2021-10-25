import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'

function create(data, params = {}){
    let html,scroll,last

    this.create = function(){
        html   = Template.get('items_line',{title: 'Коментарии'})
        scroll = new Scroll({horizontal: true})

        scroll.render().find('.scroll__body').addClass('full-reviews')

        html.find('.items-line__body').append(scroll.render())

        data.comments.forEach(element => {
            let review = Template.get('full_review',element)

            review.on('hover:focus', (e)=>{
                last = e.target

                scroll.update($(e.target),true)
            })

            scroll.append(review)
        });
    }

    this.toggle = function(){
        Controller.add('full_descr',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down:this.onDown,
            up: this.onUp,
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('full_descr')
    }

    this.render = function(){
        return html
    }
}

export default create