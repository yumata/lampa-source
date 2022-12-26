import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Lang from '../../utils/lang'
import Platform from '../../utils/platform'
import Layer from '../../utils/layer'

function create(data, params = {}){
    let html,scroll,last

    let active  = 0
    let view    = 6
    let tv      = Platform.screen('tv')

    this.create = function(){
        html   = Template.get('items_line',{title: Lang.translate('title_comments')})
        scroll = new Scroll({horizontal: true})

        scroll.render().find('.scroll__body').addClass('full-reviews')

        html.find('.items-line__body').append(scroll.render())

        data.comments.slice(0,view).forEach(this.append.bind(this))

        scroll.onWheel = (step)=>{
            this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        scroll.onScroll = (step)=>{
            data.comments.slice(active, tv ? active + view : data.comments.length).filter(e=>!e.ready).forEach((line_data)=>{
                Controller.collectionAppend(this.append(line_data))
            })

            Layer.visible(scroll.render(true))
        }
    }

    this.append = function(element){
        element.ready = true

        element.text = (element.text + '')
        element.text = element.text.length > 200 ? element.text.slice(0,200) + '...' : element.text

        let review = Template.get('full_review',element)

        review.on('hover:focus', (e)=>{
            last = e.target

            active = data.comments.indexOf(element)

            scroll.update($(e.target),true)
        })

        scroll.append(review)

        return review
    }

    this.toggle = function(){
        Controller.add('full_reviews',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())

                if(this.onToggle) this.onToggle(this)
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

        Controller.toggle('full_reviews')
    }

    this.render = function(){
        return html
    }
}

export default create