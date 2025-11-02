import Controller from '../core/controller'
import Scroll from '../interaction/scroll'
import Activity from '../interaction/activity/activity'
import TimeTable from '../core/timetable'
import Favorite from '../core/favorite'
import Utils from '../utils/utils'
import Modal from '../interaction/modal'
import Template from '../interaction/template'
import Empty from '../interaction/empty/empty'
import Account from '../core/account/account'
import Lang from '../core/lang'
import TMDB from '../core/tmdb/tmdb'
import Background from '../interaction/background'

function component(object){
    let scroll  = new Scroll({mask:true,over: true, step: 300})
    let html    = $('<div></div>')
    let body    = $('<div class="timetable"></div>')
    let cards   = Favorite.full().card
    let table   = TimeTable.all()
    let last
    
    
    this.create = function(){
        if(Account.Permit.sync) cards = Account.Bookmarks.all()

        if(table.length){
            let date_max = 0
            let date_now = new Date()
            let date_end = new Date()
            let date_one = 24 * 60 * 60 * 1000

            table.forEach(elem=>{
                let episodes = this.episodes(elem.episodes, elem.next)

                episodes.forEach(ep=>{
                    let air = Utils.parseToDate(ep.air_date)
                    let tim = air.getTime()

                    if(date_max < tim){
                        date_max = tim
                        date_end = air
                    }
                })
            })

            let date_dif = Math.max(30,Math.min(30,Math.round(Math.abs((date_now - date_end) / date_one))))

            if(date_dif > 0){
                for(let i = 0; i < date_dif; i++){
                    this.append(date_now)

                    date_now.setDate(date_now.getDate() + 1)
                }

                scroll.minus()
                scroll.append(body)

                html.append(scroll.render())
            }
            else this.empty()
        }
        else this.empty()

        this.activity.loader(false)

        this.activity.toggle()

        return this.render()
    }

    this.episodes = (episodes, next)=>{
        let result = [].concat(episodes)

        if(next && !result.find(e=>e.air_date == next.air_date)){
            result.push(next)
        }

        return result
    }

    this.empty = ()=>{
        let empty = new Empty({
            descr: Lang.translate('timetable_empty')
        })

        html.append(empty.render())

        this.start = empty.start.bind(empty)

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.append = function(date){
        let item = $(`
            <div class="timetable__item selector">
                <div class="timetable__inner">
                    <div class="timetable__date"></div>
                    <div class="timetable__body"></div>
                </div>
            </div>
        `)

        let air_date = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
        let air_epis = []
        let day_week = Utils.parseTime(date.getTime())
        let weeks    = [Lang.translate('week_7'), Lang.translate('week_1'), Lang.translate('week_2'), Lang.translate('week_3'), Lang.translate('week_4'), Lang.translate('week_5'), Lang.translate('week_6')]

        table.forEach(elem=>{
            let episodes = this.episodes(elem.episodes, elem.next)

            episodes.forEach(ep=>{
                let card = cards.find(card=>card.id == elem.id)
                
                if(ep.air_date == air_date && card){
                    air_epis.push({
                        episode: ep,
                        card
                    })
                }
            })
        })

        if(air_epis.length){
            air_epis.slice(0,3).forEach(elem=>{
                item.find('.timetable__body').append('<div><span style="background-color: '+Utils.stringToHslColor(elem.card.name, 50, 50)+'"></span>'+elem.card.name+'</div>')
            })

            if(air_epis.length > 3){
                item.find('.timetable__body').append('<div>+'+(air_epis.length-3)+'</div>')
            }

            if(air_epis.length == 1){
                let preview = $('<div class="timetable__preview"><img><div>'+(air_epis[0].episode.name || Lang.translate('noname'))+'</div></div>')

                Utils.imgLoad(preview.find('img'), TMDB.image('t/p/w200/'+air_epis[0].episode.still_path) ,false,()=>{
                    preview.find('img').remove()
                })

                item.find('.timetable__body').prepend(preview)
            }

            item.addClass('timetable__item--any')
        }

        item.find('.timetable__date').text(day_week.short + ' - ' + weeks[date.getDay()] + '.')

        item.on('hover:focus',function(){
            last = $(this)[0]

            scroll.update($(this))
        }).on('hover:hover',function(){
            last = $(this)[0]

            Navigator.focused(last)
        }).on('hover:enter',function(){
            last = $(this)[0]
            
            let modal = $('<div></div>')

            air_epis.forEach(elem=>{
                let foot = $('<div class="notice__footer"></div>')
                let noty = Template.get('notice_card',{
                    time: Utils.parseTime(air_date).full,
                    title: elem.card.name,
                    descr: Lang.translate('card_new_episode')
                })

                foot.append('<div>S - <b>'+elem.episode.season_number+'</b></div>')
                foot.append('<div>E - <b>'+elem.episode.episode_number+'</b></div>')

                noty.find('.notice__descr').append(foot)

                Utils.imgLoad(noty.find('img'), TMDB.image('t/p/w200/'+elem.card.poster_path),()=>{
                    noty.addClass('image--loaded')
                })

                noty.on('hover:enter',()=>{
                    Modal.close()

                    Activity.push({
                        url: '',
                        component: 'full',
                        id: elem.card.id,
                        method: 'tv',
                        card: elem.card,
                        source: elem.card.source
                    })
                })
                
                modal.append(noty)
            })

            Modal.open({
                title: Lang.translate('menu_tv'),
                size: 'medium',
                html: modal,
                onBack: ()=>{
                    Modal.close()
    
                    Controller.toggle('content')
                }
            })
        })

        body.append(item)
    }

    this.back = function(){
        Activity.backward()
    }

    this.start = function(){
        Controller.add('content',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last || false,scroll.render())

                Background.change(TMDB.image('t/p/w200/oXPYD4c3bLtfAS2FzwjZh7NWqo4.jpg'))
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: this.back
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        scroll.destroy()

        html.remove()
    }
}

export default component