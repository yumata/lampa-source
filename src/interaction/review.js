import Template from "./template"
import Utils from '../utils/math'
import Manifest from '../utils/manifest'
import Arrays from '../utils/arrays'

class Review {
    constructor(element, params = {}) {
        Arrays.extend(params,{
            type:'line'
        })

        this.element = element
        this.params  = params
    }

    create(){
        let text = (this.element.text || this.element.comment) + ''
            text = Utils.capitalizeFirstLetter(this.params.type == 'line' && text.length > 120 ? text.slice(0, 120) + '...' : text)

        this.html = Template.get('full_review', {...this.element, text})

        this.html.addClass('type--' + this.params.type)

        if(this.element.liked < 0) this.html.addClass('bad--comment')

        if (this.element.email) {
            let who = $(`<div class="full-review__user">
                <div class="full-review__user-icon">
                    <img class="full-review__user-img" />
                </div>
                <div class="full-review__user-email">${Utils.capitalizeFirstLetter(this.element.email)}</div>
            </div>`)

            let like = $(`<div class="full-review__like">
                <div class="full-review__like-icon">
                    ${Template.get('icon_like', {}, true)}
                </div>
                <div class="full-review__like-counter">${this.element.liked || 0}</div>
            </div>`)

            this.html.find('.full-review__footer').html(who).append(like)

            this.html.on('visible', () => {
                let img = who.find('img')[0]

                Utils.imgLoad(img, Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + this.element.icon + '.png', () => {
                    who.addClass('loaded')
                }, () => {
                    img.src = './img/actor.svg'
                })
            })
        }
    }

    updateLike(add){
        this.element.liked = (this.element.liked || 0) + add

        this.html.find('.full-review__like-counter').text(this.element.liked)
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()
    }
}


export default Review