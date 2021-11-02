import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Api from '../../interaction/api'

function create(data, params = {}){
    let html
    let last

    this.create = function(){
        html = Template.get('person_start',{
            name: data.name,
            birthday: data.birthday,
            descr: Utils.substr(data.biography, 1020),
            img: data.profile_path ? Api.img(data.profile_path) : data.img || 'img/img_broken.svg',
            place: data.place_of_birth
        })
    }

    this.toggle = function(){
        Controller.add('full_start',{
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

        Controller.toggle('full_start')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        last = null

        html.remove()
    }
}

export default create