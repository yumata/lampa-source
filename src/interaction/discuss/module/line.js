import Template from '../../template'
import Utils from '../../../utils/math'
import Manifest from '../../../utils/manifest'

class Module{
    onCreate(){
        let text = (this.data.text || this.data.comment) + ''
            text = Utils.capitalizeFirstLetter(!this.params.full_text && text.length > 120 ? text.slice(0, 120) + '...' : text)

        this.html = Template.js('full_review', {...this.data, text})

        if(this.data.liked < 0) this.html.addClass('bad--comment')

        if (this.data.email) {
            let who = Template.elem('div', {class: 'full-review__user', children: [
                Template.elem('div', {class: 'full-review__user-icon', children: [
                    Template.elem('img', {class: 'full-review__user-img'})
                ]}),
                Template.elem('div', {class: 'full-review__user-email', text: Utils.capitalizeFirstLetter(this.data.email)})
            ]})

            let like = Template.elem('div', {class: 'full-review__like', children: [
                Template.elem('div', {class: 'full-review__like-icon', children: [
                    Template.js('icon_like')
                ]}),
                Template.elem('div', {class: 'full-review__like-counter', text: this.data.liked || '0'})
            ]})


            this.html.find('.full-review__footer').html(who).append(like)

            this.html.on('visible', () => {
                let img = who.find('img')

                Utils.imgLoad(img, Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + this.data.icon + '.png', () => {
                    who.addClass('loaded')
                }, () => {
                    img.src = './img/actor.svg'
                })
            })
        }
    }

    onUpdateLiked(add){
        this.data.liked = (this.data.liked || 0) + add

        this.html.find('.full-review__like-counter').text(this.data.liked)
    }
}

export default Module