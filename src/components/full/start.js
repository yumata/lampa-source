import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Select from '../../interaction/select'
import Utils from '../../utils/math'
import Api from '../../interaction/api'
import YouTube from '../../interaction/youtube'
import Arrays from '../../utils/arrays'
import Favorite from '../../utils/favorite'
import Activity from '../../interaction/activity'
import Storage from '../../utils/storage'
import Background from '../../interaction/background'

function create(data, params = {}){
    let html
    let last
    let follow = function(){
        let status = Storage.get('parser_use')

        html.find('.view--torrent').toggleClass('selector',status).toggleClass('hide',!status)
    }

    Arrays.extend(data.movie,{
        title: data.movie.name,
        original_title: data.movie.original_name,
        runtime: 0,
        img: data.movie.poster_path ? Api.img(data.movie.poster_path) : 'img/img_broken.svg'
    })

    this.create = function(){
        let genres = (data.movie.genres || ['---']).slice(0,3).map((a)=>{
            return Utils.capitalizeFirstLetter(a.name)
        }).join(', ')


        html = Template.get('full_start',{
            title: data.movie.title,
            original_title: data.movie.original_title,
            descr: Utils.substr(data.movie.overview, 420),
            img: data.movie.img,
            time: Utils.secondsToTime(data.movie.runtime * 60,true),
            genres: genres,
            r_themovie: data.movie.vote_average,
            seasons: data.movie.number_of_seasons,
            episodes: data.movie.number_of_episodes
        })

        if(data.movie.number_of_seasons){
            html.find('.is--serial').removeClass('hide')
        }

        html.find('.view--torrent').on('hover:enter',()=>{
            let s = data.movie.original_title

            if(!/\w{3}/.test(s)){
                s = data.movie.title
            }

            Activity.push({
                url: '',
                title: 'Торренты',
                component: 'torrents',
                search: s,
                movie: data.movie,
                page: 1
            })
        })

        if(data.videos && data.videos.results.length){
            html.find('.view--trailer').on('hover:enter',()=>{
                let items = []

                data.videos.results.forEach(element => {
                    items.push({
                        title: element.name,
                        subtitle: element.official ? 'Официальный' : 'Неофициальный',
                        id: element.key
                    })
                });

                Select.show({
                    title: 'Трейлеры',
                    items: items,
                    onSelect: (a)=>{
                        YouTube.play(a.id)
                    },
                    onBack: ()=>{
                        Controller.toggle('full_start')
                    }
                })
            })
        }
        else{
            html.find('.view--trailer').remove()
        }

        Background.immediately(Utils.cardImgBackground(data.movie))

        Storage.listener.follow('change',follow)

        follow()

        this.menu()

        this.favorite()
    }

    this.menu = function(){
        html.find('.open--menu').on('hover:enter',()=>{
            let enabled = Controller.enabled().name
            let status  = Favorite.check(params.object.card)

            let menu = []

            menu.push({
                title: status.book ? 'Убрать из закладок' : 'В закладки',
                subtitle: 'Смотрите в меню (Закладки)',
                where: 'book'
            })

            menu.push({
                title: status.like ? 'Убрать из понравившихся' : 'Нравится',
                subtitle: 'Смотрите в меню (Нравится)',
                where: 'like'
            })

            menu.push({
                title: status.wath ? 'Убрать из ожидаемых' : 'Смотреть позже',
                subtitle: 'Смотрите в меню (Позже)',
                where: 'wath'
            })

            Select.show({
                title: 'Действие',
                items: menu,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onSelect: (a)=>{
                    Favorite.toggle(a.where, params.object.card)

                    this.favorite()
                    
                    Controller.toggle(enabled)
                }
            })
        })
    }

    this.favorite = function(){
        let status = Favorite.check(params.object.card)

        $('.info__icon',html).removeClass('active')

        $('.icon--book',html).toggleClass('active',status.book)
        $('.icon--like',html).toggleClass('active',status.like)
        $('.icon--wath',html).toggleClass('active',status.wath)
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

        Storage.listener.remove('change',follow)
    }
}

export default create