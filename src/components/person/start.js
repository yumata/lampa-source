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
            birthday: Utils.parseTime(data.birthday).full,
            descr: Utils.substr(data.biography || '', 1020),
            img: data.profile_path ? Api.img(data.profile_path) : data.img || 'img/img_broken.svg',
            place: data.place_of_birth || ''
        })

        if(!data.birthday) html.find('.person-start__tag').remove()
        if(!data.place_of_birth) html.find('.person-start__place').remove()

        if(!data.biography) html.addClass('person-start--small')
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