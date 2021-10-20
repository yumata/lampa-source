import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Card from '../interaction/card'
import Scroll from '../interaction/scroll'
import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Utils from '../utils/math'
import Api from '../interaction/api'
import Info from '../interaction/info'
import Modal from '../interaction/modal'
import Template from '../interaction/template'
import Noty from '../interaction/noty'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let total_pages = 0
    let info
    let last
    let relises = []
    
    
    this.create = function(){
        this.activity.loader(true)

        Api.relise(this.build.bind(this),()=>{
            let empty = new Empty()

            html.append(empty.render())

            this.start = empty.start

            this.activity.loader(false)

            this.activity.toggle()
        })

        return this.render()
    }

    this.next = function(){
        if(object.page < 15 && object.page < total_pages){

            object.page++

            let offset = object.page - 1

            this.append(relises.slice(20 * offset,20 * offset + 20))

            Controller.enable('content')
        }
    }

    this.append = function(data){
        data.forEach(element => {

            let card = new Card(element, {card_category: true})
                card.create()
                card.onFocus = (target, card_data)=>{
                    last = target

                    scroll.update(card.render(), true)

                    info.update(card_data)

                    Background.change(Utils.cardImgBackground(card_data))

                    let maxrow = Math.ceil(items.length / 7) - 1

                    if(Math.ceil(items.indexOf(card) / 7) >= maxrow) this.next()
                }

                card.onEnter = (target, card_data)=>{
                    Modal.open({
                        title: '',
                        html: Template.get('modal_loading'),
                        size: 'small',
                        mask: true,
                        onBack: ()=>{
                            Modal.close()
                
                            Api.clear()

                            Controller.toggle('content')
                        }
                    })

                    Api.search({query: encodeURIComponent(card_data.original_title)},(find)=>{
                        Modal.close()

                        let finded = Api.searchFilter(find, card_data)

                        if(finded){
                            Activity.push({
                                url: '',
                                component: 'full',
                                id: finded.id,
                                method: finded.name ? 'tv' : 'movie',
                                card: finded
                            })
                        }
                        else{
                            Noty.show('Не удалось найти фильм.')

                            Controller.toggle('content')
                        }
                    },()=>{
                        Modal.close()
                        
                        Noty.show('Не удалось найти фильм.')

                        Controller.toggle('content')
                    })
                }

                card.onMenu = (target, card_data)=>{
                    
                }

                card.visible()

                body.append(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        relises = data

        total_pages = Math.ceil(relises.length / 20)

        info = new Info()

        info.create()

        scroll.render().addClass('layer--wheight').data('mheight', info.render())

        info.render().find('.info__right').remove()

        html.append(info.render())
        html.append(scroll.render())

        this.append(relises.slice(0,20))

        scroll.append(body)

        this.activity.loader(false)

        this.activity.toggle()
    }


    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last || false,scroll.render())
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
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
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        html.remove()
        body.remove()

        if(info) info.destroy()

        network = null
        items   = null
        html    = null
        body    = null
        info    = null
    }
}

export default component