import Explorer from '../interaction/explorer'
import Filter from '../interaction/filter'
import Scroll from '../interaction/scroll'
import Controller from '../interaction/controller'
import Lang from '../utils/lang'
import Api from '../interaction/api'
import Template from '../interaction/template'
import Layer from '../utils/layer'
import Timeline from '../interaction/timeline'
import Utils from '../utils/math'
import Background from '../interaction/background'
import Activity from '../interaction/activity'

function component(object){
    let explorer = new Explorer(object)
    let filter   = new Filter(object)
    let scroll   = new Scroll({mask:true,over: true})
    let last

    let choice   = {
        season: object.movie.number_of_seasons
    }

    this.create = function(){
        this.filter()
        this.selected()

        explorer.appendFiles(scroll.render())
        explorer.appendHead(filter.render())

        scroll.body().addClass('torrent-list')

        explorer.render().find('.filter--search, .filter--sort').remove()

        scroll.minus(explorer.render().find('.explorer__files-head'))

        this.load()

        this.activity.toggle()

        return this.render()
    }

    this.filter = function(){
        filter.addButtonBack()

        filter.onSelect = (type, a, b)=>{
            choice.season = b.season //и так сойде ;]

            this.selected()
            this.load()
        }

        filter.onBack = ()=>{
            this.start()
        }
    }

    this.selected = function(){
        let select = []
        let seasons = []

        for(let i in choice){
            if(i == 'season')  select.push(Lang.translate('torrent_serial_season') + ': ' + choice[i])
        }

        for(let i = 0; i < object.movie.number_of_seasons; i++){
            seasons.push({
                title: i+1,
                season: i+1
            })
        }

        filter.set('filter', [{
            title: Lang.translate('torrent_serial_season'),
            subtitle: choice.season,
            noselect: true,
            items: seasons
        }])

        filter.chosen('filter', select)
    }

    this.load = function(){
        this.activity.loader(true)

        let season = choice.season

        Api.clear()

        Api.seasons(object.movie, [season],(v)=>{
            last = false

            scroll.clear()
            scroll.reset()

            if(v[season] && v[season].episodes && v[season].episodes.length){
                this.season(v[season])

                this.draw(v[season].episodes)
            }
            else{
                this.empty()
            }

            this.activity.loader(false)
        })
    }

    this.season = function(season){
        let head = []

        if(season.vote_average) head.push(Lang.translate('title_rating') + ': ' + parseFloat(season.vote_average +'').toFixed(1))
        if(season.air_date) head.push(Lang.translate('full_date_of_release') + ': ' + Utils.parseTime(season.air_date).full)
        
        head.push(Lang.translate('title_episodes') + ': ' + season.episodes.length)

        season.head = head.join('&nbsp; ● &nbsp;')

        let tpl = Template.get('season_info',season)

        tpl.on('hover:focus',(e)=>{
            scroll.update($(e.target), true)
        })

        if(!season.overview) tpl.find('.season-info__overview').remove()

        scroll.append(tpl)
    }

    this.empty = function(){
        let em = Template.get('empty_filter')
        let bn = $('<div class="simple-button selector"><span>'+Lang.translate('filter_clarify')+'</span></div>')

        bn.on('hover:enter',()=>{
            filter.render().find('.filter--filter').trigger('hover:enter')
        })

        em.find('.empty-filter__title').remove()
        em.find('.empty-filter__buttons').removeClass('hide').append(bn)

        scroll.append(em)

        Controller.enable('content')
    }

    this.draw = function(episodes){
        episodes.forEach((episode, index) => {
            let number = episode.episode_number || (index + 1)
            let hash   = Utils.hash([choice.season, choice.season > 10 ? ':' : '', number, object.movie.original_title].join(''))
            let info   = []

            let out_air = new Date((episode.air_date + '').replace(/-/g,'/'))
            let out_now = Date.now()
            let out_day = episode.air_date ? Math.round((out_air.getTime() - out_now)/(24*60*60*1000)) : 1
            let out_txt = Lang.translate('full_episode_days_left')+': ' + (episode.air_date ? out_day : '- -') 

            episode.timeline = Timeline.view(hash)
            episode.time     = Utils.secondsToTime(episode.runtime * 60,true)
            episode.title    = episode.name || (Lang.translate('torrent_serial_episode') + ' ' + number)
            episode.quality  = out_day > 0 ? out_txt : ''

            if(episode.vote_average) info.push(Template.get('season_episode_rate',{rate: parseFloat(episode.vote_average +'').toFixed(1)},true))
            if(episode.air_date) info.push(Utils.parseTime(episode.air_date).full)

            episode.info = info.length ? info.map(i=>'<span>'+i+'</span>').join('<span class="season-episode-split">●</span>') : ''

            let html   = Template.get('season_episode', episode)
            let loader = html.find('.season-episode__loader')
            let image  = html.find('.season-episode__img')

            let viewed  = ()=>{
                html.find('.season-episode__viewed').remove()
                
                if(Boolean(episode.timeline.percent)) html.find('.season-episode__img').append('<div class="season-episode__viewed">'+Template.get('icon_viewed',{},true)+'</div>')
            }

            html.find('.season-episode__timeline').append(Timeline.render(episode.timeline))

            if(out_day > 0) html.css('opacity','0.5')
            else{
                viewed()

                if(Boolean(episode.timeline.percent)) last = html[0]

                html.on('hover:enter',()=>{
                    if(Boolean(episode.timeline.percent)){
                        episode.timeline.time = 0
                        episode.timeline.percent = 0
                    }
                    else{
                        episode.timeline.time = episode.timeline.duration * 0.95
                        episode.timeline.percent = 95
                    }
        
                    Timeline.update(episode.timeline)

                    viewed()
                })
            }

            html.on('hover:focus',(e)=>{
                last = e.target
    
                scroll.update($(e.target), true)
            }).on('visible',()=>{
                let img = html.find('img')[0]

                img.onerror = function(){
                    img.src = './img/img_broken.svg'
                }

                img.onload = function(){
                    image.addClass('season-episode__img--loaded')

                    loader.remove()

                    image.append('<div class="season-episode__episode-number">'+('0' + number).slice(-2)+'</div>')
                }

                if(episode.still_path) img.src = Api.img(episode.still_path, 'w300')
                else if(episode.img) img.src = episode.img
                else{
                    loader.remove()
                    
                    image.append('<div class="season-episode__episode-number">'+('0' + number).slice(-2)+'</div>')
                }
            }).on('hover:hover hover:touch',(e)=>{
                last = e.target

                Navigator.focused(last)
            })

            scroll.append(html)
        })

        if(last) scroll.update($(last), true)

        Layer.visible(scroll.render(true))

        Controller.enable('content')
    }


    this.start = function(){
        if(Activity.active().activity !== this.activity) return

        Background.immediately(Utils.cardImgBackgroundBlur(object.movie))

        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render(), explorer.render())
                Controller.collectionFocus(last || false,scroll.render())
                Navigator.remove(explorer.render().find('.explorer-card__head-img')[0])
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else explorer.toggle()
            },
            right: ()=>{
                filter.show(Lang.translate('title_filter'),'filter')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return explorer.render()
    }

    this.destroy = function(){
        
    }
}

export default component