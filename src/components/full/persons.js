import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Activity from '../../interaction/activity'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Lang from '../../utils/lang'
import Layer from '../../utils/layer'
import Platform from '../../utils/platform'

function create(persons, params){
    let html,scroll,last

    let active  = 0
    let view    = 6
    let tv      = Platform.screen('tv')

    this.create = function(){
        if(persons.length > 50) persons = persons.slice(0,50)

        html   = Template.get('items_line',{title: params.title || Lang.translate('title_actors')})
        scroll = new Scroll({horizontal: true,scroll_by_item:true})

        scroll.body().addClass('full-persons')

        persons.slice(0,view).forEach(this.append.bind(this))

        html.find('.items-line__body').append(scroll.render())

        scroll.onWheel = (step)=>{
            this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        scroll.onScroll = (step)=>{
            persons.slice(active, tv ? active + view : persons.length).filter(e=>!e.ready).forEach((line_data)=>{
                Controller.collectionAppend(this.append(line_data))
            })

            Layer.visible(scroll.render(true))
        }
    }

    this.append = function(element){
        element.ready = true

        let person = Template.get('full_person',{
            name: element.name,
            role: element.character || element.job || Lang.translate('title_actor')
        })

        person.on('visible',()=>{
            let img = person.find('img')[0]

            img.onerror = function(e){
                img.src = './img/actor.svg'
            }

            img.onload = function(){
                person.addClass('full-person--loaded')
            }

            img.src = element.profile_path ? Api.img(element.profile_path,'w276_and_h350_face') : element.img || './img/actor.svg'
        })

        person.on('hover:focus', (e)=>{
            last = e.target

            active = persons.indexOf(element)

            scroll.update($(e.target),true)
        }).on('hover:enter',()=>{
            Activity.push({
                url: element.url,
                title: Lang.translate('title_persons'),
                component: 'actor',
                id: element.id,
                source: params.object.source
            })
        })

        scroll.append(person)

        return person
    }

    this.toggle = function(){
        Controller.add('full_descr',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())

                if(this.onToggle) this.onToggle(this)
            },
            update: ()=>{},
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

    this.destroy = function(){
        scroll.destroy()
        
        html.remove()

        html = null
    }
}

export default create