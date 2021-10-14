import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Card from '../interaction/card'
import Scroll from '../interaction/scroll'
import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Torserver from '../interaction/torserver'
import Torrent from '../interaction/torrent'
import Select from '../interaction/select'
import Utils from '../utils/math'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let total_pages = 0
    let last
    let torrents = []
    
    
    this.create = function(){
        this.activity.loader(true)

        Torserver.my(this.build.bind(this),()=>{
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

            this.append(torrents.slice(20 * offset,20 * offset + 20))

            Controller.enable('content')
        }
    }

    this.append = function(data){
        data.forEach(element => {
            element.title = element.title.replace('[LAMPA] ','')

            let item_data = Arrays.decodeJson(element.data,{})

            let card = new Card(element, {card_category: true})
                card.create()
                card.onFocus = (target, card_data)=>{
                    last = target

                    scroll.update(card.render(), true)

                    Background.change(item_data.movie ? Utils.cardImgBackground(item_data.movie) : element.poster)

                    let maxrow = Math.ceil(items.length / 7) - 1

                    if(Math.ceil(items.indexOf(card) / 7) >= maxrow) this.next()
                }

                card.onEnter = (target, card_data)=>{
                    Torrent.open(card_data.hash, item_data.lampa && item_data.movie ? item_data.movie : false)
                }

                card.onMenu = (target, card_data)=>{
                    let enabled = Controller.enabled().name

                    Select.show({
                        title: 'Действие',
                        items: [
                            {
                                title: 'Удалить',
                                subtitle: 'Торрент будет удален из вашего списка'
                            }
                        ],
                        onBack: ()=>{
                            Controller.toggle(enabled)
                        },
                        onSelect: (a)=>{
                            Torserver.remove(card_data.hash)

                            Arrays.remove(items, card)

                            card.destroy()

                            last = false

                            Controller.toggle(enabled)
                        }
                    })
                }

                card.visible()

                body.append(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        torrents = data

        total_pages = Math.ceil(torrents.length / 20)

        scroll.minus()

        this.append(torrents.slice(0,20))

        scroll.append(body)

        html.append(scroll.render())

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

        network = null
        items   = null
        html    = null
        body    = null
    }
}

export default component