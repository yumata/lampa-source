import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Utils from '../../utils/math'
import Modal from '../../interaction/modal'
import Timeline from '../../interaction/timeline'
import Lang from '../../utils/lang'
import Platform from '../../utils/platform'
import Layer from '../../utils/layer'
import Activity from '../../interaction/activity'

function create(data, params = {}){
    let html,scroll,last

    let view    = 6
    let tv      = Platform.screen('tv')
    let active  = 0

    this.create = function(){
        html   = Template.get('items_line',{title: params.season.name || Lang.translate('full_series_release')})
        scroll = new Scroll({horizontal: true})

        scroll.render().find('.scroll__body').addClass('full-episodes')

        scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        scroll.onScroll = (step)=>{
            data.slice(active, tv ? active + view : data.length).filter(e=>!e.ready).forEach((elem)=>{
                Controller.collectionAppend(this.append(elem))
            })

            Layer.visible(scroll.render(true))
        }

        html.find('.items-line__body').append(scroll.render())

        data.reverse()

        data.forEach((episode,num)=>episode.episode_number = episode.episode_number || num + 1)

        let wath_all = Template.get('full_episode',{
            name: Lang.translate('more')
        })

        wath_all.addClass('full-episode--wath-all')

        wath_all.on('hover:enter',()=>{
            Activity.push({
                url: '',
                title: Lang.translate('title_episodes'),
                component: 'episodes',
                movie: params.movie,
                page: 1
            })
        })

        scroll.append(wath_all)

        data.slice(0,view).forEach(this.append.bind(this))
    }

    this.append = function(element){
        element.ready = true

        element.date = element.air_date ? Utils.parseTime(element.air_date).full : '----'
        element.num  = element.episode_number

        let episode = Template.get('full_episode',element)
        let hash    = Utils.hash([element.season_number, element.season_number > 10 ? ':' : '',element.episode_number,params.title].join(''))
        let view    = Timeline.view(hash)

        episode.append('<div class="full-episode__viewed">' + Template.get('icon_viewed',{},true) + '</div>')

        episode.toggleClass('full-episode--viewed', Boolean(view.percent))

        if(element.plus) {
            episode.addClass('full-episode--next')
        }

        episode.on('visible',()=>{
            let img = episode.find('img')[0]

            img.onerror = function(e){
                img.src = './img/img_broken.svg'
            }

            img.onload = function(){
                episode.addClass('full-episode--loaded')
            }

            if(element.still_path) img.src = Api.img(element.still_path,'w300')
            else if(element.img) img.src = element.img
            else img.src = './img/img_broken.svg'
        })

        episode.on('hover:focus', (e)=>{
            last = e.target

            active = data.indexOf(element)

            scroll.update($(e.target),true)
        }).on('hover:enter',()=>{
            if(element.overview){
                Modal.open({
                    title: element.name,
                    html: $('<div class="about">'+element.overview+'</div>'),
                    onBack: ()=>{
                        Modal.close()

                        Controller.toggle('content')
                    },
                    onSelect: ()=>{
                        Modal.close()

                        Controller.toggle('content')
                    }
                })
            }
        }).on('hover:long',()=>{
            if(Boolean(view.percent)){
                view.time = 0
                view.percent = 0
            }
            else{
                view.time = view.duration * 0.95
                view.percent = 95
            }

            Timeline.update(view)
            
            episode.toggleClass('full-episode--viewed', Boolean(view.percent))
        })

        scroll.append(episode)

        return episode
    }

    this.toggle = function(){
        Controller.add('full_episodes',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())

                if(this.onToggle) this.onToggle(this)
            },
            update: ()=>{},
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

        Controller.toggle('full_episodes')
    }

    this.render = function(){
        return html
    }
}

export default create