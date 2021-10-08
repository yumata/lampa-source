import Template from './template'
import Api from './api'
import Arrays from '../utils/arrays'
import Select from './select'
import Favorite from '../utils/favorite'
import Controller from './controller'

function create(data, params = {}){
    Arrays.extend(data,{
        title: data.name,
        original_title: data.original_name,
        release_date: data.first_air_date
    })

    data.release_date = (data.release_date || '0000').slice(0,4)

    let card = Template.get('card',data)
    let img  = new Image()
        img.crossOrigin = "Anonymous"

    if(params.card_small){
        card.addClass('card--small')

        card.find('.card__title').remove()
        card.find('.card__age').remove()
    }

    if(params.card_category){
        card.addClass('card--category')

        card.find('.card__age').remove()
    }

    this.image = function(){
        img.onload = function(){
            card.find('img')[0].src = img.src

            card.addClass('card--loaded')
        }
    
        img.onerror = function(e){
            card.find('img')[0].src = './img/img_broken.svg'
        }
    }

    this.addicon = function(name){
        card.find('.card__icons-inner').append('<div class="card__icon icon--'+name+'"></div>')
    }

    this.favorite = function(){
        let status = Favorite.check(data)

        card.find('.card__icon').remove()

        if(status.book) this.addicon('book')
        if(status.like) this.addicon('like')
        if(status.wath) this.addicon('wath')
    }

    this.create = function(){
        this.favorite()

        card.on('hover:focus',(e)=>{
            this.onFocus(e.target, data)
        }).on('hover:enter',(e)=>{
            this.onEnter(e.target, data)
        }).on('hover:long',(e)=>{

            let enabled = Controller.enabled().name
            let status  = Favorite.check(data)

            Select.show({
                title: 'Действие',
                items: [
                    {
                        title: status.book ? 'Убрать из закладок' : 'В закладки',
                        subtitle: 'Смотрите в меню (Закладки)',
                        where: 'book'
                    },
                    {
                        title: status.like ? 'Убрать из понравившихся' : 'Нравится',
                        subtitle: 'Смотрите в меню (Нравится)',
                        where: 'like'
                    },
                    {
                        title: status.wath ? 'Убрать из ожидаемых' : 'Смотреть позже',
                        subtitle: 'Смотрите в меню (Позже)',
                        where: 'wath'
                    }
                ],
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onSelect: (a)=>{
                    Favorite.toggle(a.where, data)

                    this.favorite()

                    Controller.toggle(enabled)
                }
            })
        })

        this.image()
    }

    this.visible = function(){
        if(this.visibled) return

        if(data.poster_path) img.src = Api.img(data.poster_path)
        else img.src = './img/img_broken.svg'

        this.visibled = true
    }

    this.destroy = function(){
        img.onerror = ()=>{}
        img.onload = ()=>{}

        img.src = ''

        card.remove()

        card = null

        img = null
    }

    this.render = function(){
        return card
    }
}

export default create