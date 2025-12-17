import Timeline from '../../timeline'
import Timetable from '../../../core/timetable'
import Lang from '../../../core/lang'
import Storage from '../../../core/storage/storage'
import Utils from '../../../utils/utils'
import Template from '../../template'

export default {
    onCreate: function(){
        let timer

        this.html.on('hover:focus hover:touch hover:hover', ()=>{
            clearTimeout(timer)

            timer = setTimeout(()=>{
                this.html.classList.contains('focus') && this.emit('watched')
            },500)
        })

        this.listenerWatched = (e)=>{
            if((e.target == 'timeline' && e.reason == 'read') || (e.target == 'timetable' && e.id == this.data.id)) this.emit('update')
        }

        Lampa.Listener.follow('state:changed', this.listenerWatched)
    },

    onUpdate: function(){
        this.watched_checked = false

        this.watched_wrap?.remove()

        this.html.classList.contains('focus') && this.emit('watched')
    },

    onWatched: function(){
        if(!Storage.field('card_episodes')) return
        
        if(!this.watched_checked){
            let data = this.data

            function get(callback){
                if(data.original_name) Timetable.get(data, callback)
                else callback([])
            }

            get((episodes, from_db)=>{
                let viewed

                // Нужно разбить 1й сезон на сезоны и взять последний сезон
                if(episodes[0] && episodes[0].season_number == 1){
                    let seasons = Utils.splitEpisodesIntoSeasons(episodes)

                    episodes = seasons[Object.keys(seasons).pop()]
                }

                let Draw = ()=>{
                    episodes.forEach(ep=>{
                        let hash = Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '',ep.episode_number,data.original_title].join(''))
                        let view = Timeline.view(hash)

                        if(view.percent) viewed = {ep, view}
                    })

                    // Пытаемся найти последний просмотренный из истории последнего просмотра
                    if(!viewed && data.original_name){
                        let last  = Storage.get('online_watched_last', '{}')
                        let filed = last[Utils.hash(data.original_title)]

                        if(filed && filed.episode){
                            viewed = {
                                ep: {
                                    episode_number: filed.episode,
                                    name: Lang.translate('full_episode') + ' ' + filed.episode,
                                },
                                view: Timeline.view(Utils.hash([filed.season, filed.season > 10 ? ':' : '',filed.episode,data.original_title].join('')))
                            }
                        }
                    }

                    // Если это фильм и не нашли просмотренное, то проверим по прогрессу просмотра из таймлайна
                    if(!viewed && !data.original_name){
                        let time = Timeline.watched(data, true)

                        if(time.percent) {
                            viewed = {
                                ep: {
                                    name: Lang.translate('title_viewed') + ' ' + (time.time ? Utils.secondsToTimeHuman(time.time) : time.percent + '%'),
                                },
                                view: time
                            }
                        }
                    }

                    // Если это сериал и не нашли просмотренное, то проверим по прогрессу просмотра из таймлайна
                    if(!viewed && data.original_name){
                        let any = Timeline.watched(data, true).pop()

                        if(any) viewed = {ep: {
                            name: Lang.translate('full_episode') + ' ' + any.ep,
                        }, view: any.view}
                    }

                    if(viewed){
                        let soon = []
                        let next = episodes.slice(episodes.indexOf(viewed.ep)).filter(ep=>ep.air_date).filter(ep=>{
                            let date = Utils.parseToDate(ep.air_date).getTime()

                            if(date > Date.now()) soon.push(ep)

                            return date < Date.now()
                        }).slice(0,5)

                        if(next.length == 0) next = [viewed.ep]

                        if(soon.length && next.length < 5 && !next.find(n=>n.episode_number == soon[0].episode_number)) next.push(soon[0])

                        let wrap = Template.js('card_watched',{})

                        next.forEach(ep=>{
                            let div  = document.createElement('div')
                            let span = document.createElement('span')
                            let date = Utils.parseToDate(ep.air_date)
                            let now  = Date.now()
                            let days = Math.ceil((date.getTime() - now)/(24*60*60*1000))

                            div.addClass('card-watched__item')
                            div.append(span)

                            span.innerText = (ep.episode_number ?  ep.episode_number + ' - ' : '') + (days > 0 ? Lang.translate('full_episode_days_left') + ': ' + days : (ep.name || Lang.translate('noname')))

                            if(ep == viewed.ep) div.append(Timeline.render(viewed.view)[0])

                            wrap.find('.card-watched__body').append(div)
                        })

                        this.watched_wrap = wrap

                        let view = this.html.find('.card__view')

                        view.insertBefore(wrap, view.firstChild)
                    }
                }

                Draw()
            })

            this.watched_checked = true
        }
    },

    onDestroy: function(){
        Lampa.Listener.remove('state:changed', this.listenerWatched)
    }
}