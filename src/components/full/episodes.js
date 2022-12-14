import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Utils from '../../utils/math'
import Modal from '../../interaction/modal'
import Timeline from '../../interaction/timeline'
import Lang from '../../utils/lang'

function create(data, params = {}){
    let html,scroll,last

    this.create = function(){
        html   = Template.get('items_line',{title: params.season.name || Lang.translate('full_series_release')})
        scroll = new Scroll({horizontal: true, scroll_by_item: true})

        scroll.render().find('.scroll__body').addClass('full-episodes')

        html.find('.items-line__body').append(scroll.render())

        let movie_title = params.title

        data.reverse().forEach((element, num) => {
            element.date = element.air_date ? Utils.parseTime(element.air_date).full : '----'
            element.num = element.episode_number || num + 1

            let episode = Template.get('full_episode',element)
            let hash    = Utils.hash([element.season_number,element.episode_number,movie_title].join(''))
            let view    = Timeline.view(hash)
            let visible = false

            if(view.percent) episode.find('.full-episode__body').append(Timeline.render(view))

            if(element.plus) {
                episode.addClass('full-episode--next')
            }

            episode.data('visible',()=>{
                if(!visible && !element.plus){
                    visible = true

                    let img = episode.find('img')[0]

                    img.onerror = function(e){
                        img.src = './img/img_broken.svg'
                    }

                    img.onload = function(){
                        episode.addClass('.full-episode--loaded')
                    }

                    if(element.still_path) img.src = Api.img(element.still_path,'w300')
                    else img.src = './img/img_broken.svg'
                }
            })

            episode.on('hover:focus', (e)=>{
                last = e.target

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
        });
    }

    this.toggle = function(){
        Controller.add('full_episodes',{
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

        Controller.toggle('full_episodes')
    }

    this.render = function(){
        return html
    }
}

export default create