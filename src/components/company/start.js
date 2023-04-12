import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Api from '../../interaction/api'

function Company(data) {
    let html

    this.create = function () {
        html = Template.get('company', {
            name: data.name,
            img: data.logo_path ? Api.img(data.logo_path) : data.img || 'img/img_broken.svg',
            place: (data.headquarters ? data.headquarters + (data.origin_country ? ', ' : '') : '') + (data.origin_country ? data.origin_country : '')
        })

        if(!data.logo_path) html.addClass('icon--broken')
    }

    this.toggle = function () {
        Controller.add('company', {
            invisible: true,
            toggle: () => {
                Controller.collectionSet(this.render())
                Controller.collectionFocus(false, this.render())
            },
            left: () => {
                if (Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down: this.onDown,
            up: this.onUp,
            back: this.onBack
        })

        Controller.toggle('company')
    }

    this.render = function (js) {
        return js ? html[0] : html
    }

    this.destroy = function () {
        html.remove()
    }
}

export default Company