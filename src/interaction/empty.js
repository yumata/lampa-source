import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'

function create(params = {}){

    Arrays.extend(params,{
        title: 'Здесь пусто',
        descr: 'На данный момент список пустой'
    })

    let html = Template.get('empty',params)

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(html)
                Controller.collectionFocus(false,html)
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                Navigator.move('right')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.render = function(add){
        if(add) html.append(add)

        return html
    }
}

export default create