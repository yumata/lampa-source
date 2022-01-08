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
import Player from '../../interaction/player'
import Android from "../../utils/android";
import Platform from "../../utils/platform";

function create(data, params = {}){
    let html
    let last
    let tbtn
    let follow = function(e){
        if(e.name == 'parser_use'){
            let status = Storage.get('parser_use')

            tbtn.toggleClass('selector',status).toggleClass('hide',!status)
        }
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
            descr: Utils.substr(data.movie.overview || 'Без описания.', 420),
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

        tbtn = html.find('.view--torrent')

        tbtn.on('hover:enter',()=>{
            let query = data.movie.original_title

            if(Storage.field('parse_lang') == 'ru' || !/\w{3}/.test(query)) query = data.movie.title

            Activity.push({
                url: '',
                title: 'Торренты',
                component: 'torrents',
                search: query,
                search_one: data.movie.title,
                search_two: data.movie.original_title,
                movie: data.movie,
                page: 1
            })
        })

        html.find('.info__icon').on('hover:enter',(e)=>{
            let type = $(e.target).data('type')

            params.object.card        = data.movie
            params.object.card.source = params.object.source

            Favorite.toggle(type, params.object.card)

            this.favorite()
        })

        if(data.videos && data.videos.results.length){
            html.find('.view--trailer').on('hover:enter',()=>{
                let items = []

                data.videos.results.forEach(element => {
                    items.push({
                        title: element.name,
                        subtitle: element.official ? 'Официальный' : 'Неофициальный',
                        id: element.key,
                        player: element.player,
                        url: element.url
                    })
                });

                Select.show({
                    title: 'Трейлеры',
                    items: items,
                    onSelect: (a)=>{
                        this.toggle()

                        if(a.player){
                            Player.play(a)
                            Player.playlist([a])
                        } else if(Platform.is('android')){
                            Android.openYoutube(a.id)
                        }
                        else YouTube.play(a.id)
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

        follow({name: 'parser_use'})

        this.favorite()
    }

    this.groupButtons = function(){
        let buttons = html.find('.full-start__buttons > *').not('.full-start__icons,.info__rate,.open--menu').hide()

        html.find('.open--menu').on('hover:enter',()=>{
            let enabled = Controller.enabled().name

            let menu = []

            buttons.each(function(){
                menu.push({
                    title: $(this).text(),
                    btn: $(this)
                })
            })

            Select.show({
                title: 'Смотреть',
                items: menu,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onSelect: (a)=>{
                    a.btn.trigger('hover:enter')
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

    this.toggleBackground = function(){
        Background.immediately(Utils.cardImgBackground(data.movie))
    }

    this.toggle = function(){
        Controller.add('full_start',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last || html.find('.open--menu')[0], this.render())

                /*
                let tb = html.find('.view--torrent'),
                    tr = html.find('.view--trailer')

                Controller.collectionSet(this.render())
                Controller.collectionFocus(last || (!tb.hasClass('hide') ? tb[0] : !tr.hasClass('hide') && tr.length ? tr[0] : false), this.render())
                */
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