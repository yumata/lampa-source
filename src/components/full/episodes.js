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

        data.slice(0,view).forEach(this.append.bind(this))
    }

    this.append = function(element){
        element.ready = true

        element.date = element.air_date ? Utils.parseTime(element.air_date).full : '----'
        element.num  = element.episode_number

        let episode = Template.get('full_episode',element)
        let hash    = Utils.hash([element.season_number,element.episode_number,params.title].join(''))
        let view    = Timeline.view(hash)

        if(view.percent) episode.find('.full-episode__body').append(Timeline.render(view))

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
                    html: $('<div class="about"><div class="selector">'+element.overview+'</div></div>'),
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