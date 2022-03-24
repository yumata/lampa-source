import Item from './item'

function create(data, params = {}){
    let content = Lampa.Template.get('items_line',{title: data.title})
    let body    = content.find('.items-line__body')
    let scroll  = new Lampa.Scroll({horizontal:true, step:300})
    let player  = window.radio_player
    let items   = []
    let active  = 0
    let last
   
    this.create = function(){
        scroll.render().find('.scroll__body').addClass('items-cards')

        content.find('.items-line__title').text(data.title)

        data.results.forEach(this.append.bind(this))

        body.append(scroll.render())
    }

    this.append = function(element){
        let item = new Item(element)

        item.render().on('hover:focus',()=>{
            last = item.render()[0]

            active = items.indexOf(item)

            scroll.update(items[active].render(), true)
        }).on('hover:enter',()=>{
            player.play(element)
        })

        scroll.append(item.render())

        items.push(item)
    }

    this.toggle = function(){
        Lampa.Controller.add('radio_line',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(scroll.render())
                Lampa.Controller.collectionFocus(last || false,scroll.render())
            },
            right: ()=>{
                Navigator.move('right')

                Lampa.Controller.enable('radio_line')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else if(this.onLeft) this.onLeft()
                else Lampa.Controller.toggle('menu')
            },
            down: this.onDown,
            up:   this.onUp,
            gone: ()=>{

            },
            back: this.onBack
        })

        Lampa.Controller.toggle('radio_line')
    }

    this.render = function(){
        return content
    }

    this.destroy = function(){
        Lampa.Arrays.destroy(items)

        scroll.destroy()

        content.remove()

        items = null
    }
}

export default create