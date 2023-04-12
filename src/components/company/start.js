import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Api from '../../interaction/api'

function create(data, params = {}) {
    let html
    let last

    this.create = function () {
        html = Template.get('company', {
            name: data.name,
            img: data.logo_path ? Api.img(data.logo_path) : data.img || 'img/img_broken.svg',
            place: (data.headquarters ? data.headquarters + (data.origin_country ? ', ' : '') : '') + (data.origin_country ? data.origin_country : '')
        })
        if (!data.logo_path) html.find('.company-start__poster').remove()
    }

    this.toggle = function () {
        Controller.add('full_start', {
            toggle: () => {
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())
            },
            update: () => { },
            right: () => {
                Navigator.move('right')
            },
            left: () => {
                if (Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down: this.onDown,
            up: this.onUp,
            gone: () => {

            },
            back: this.onBack
        })

        Controller.toggle('full_start')
    }

    this.render = function () {
        return html
    }

    this.destroy = function () {
        last = null

        html.remove()
    }
}

export default create