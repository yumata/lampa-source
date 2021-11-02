import Template from './template'
import Favorite from '../utils/favorite'

function create(){
    let html

    this.create = function(){
        html = Template.get('info')
    }

    this.update = function(data){
        let create = ((data.release_date || data.first_air_date || '0000') + '').slice(0,4)

        html.find('.info__title').text(data.title)
        html.find('.info__title-original').text(data.original_title)
        html.find('.info__create').text(create).toggleClass('hide', create == '0000')
        html.find('.info__rate span').text(data.vote_average)
        html.find('.info__rate').toggleClass('hide', data.vote_average == 0)

        html.find('.info__icon').removeClass('active')

        let status = Favorite.check(data)

        $('.icon--book',html).toggleClass('active', status.book)
        $('.icon--like',html).toggleClass('active', status.like)
        $('.icon--wath',html).toggleClass('active', status.wath)
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        html.remove()

        html = null
    }
}

export default create