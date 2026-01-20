import Lang from './utils/lang.js'
import Templates from './utils/templates.js'
import Player from './utils/player.js'
import Handler from './utils/handler.js'
import Favorite from './utils/favorite.js'
import Created from './utils/created.js'
import Shot from './components/shot.js'
import Lenta from './lenta/lenta.js'
import Api from './utils/api.js'
import List from './components/list.js'
import Card from './components/card.js'
import View from './utils/view.js'
import Channel from './components/channel.js'
import Present from './components/present.js'
import Roll from './utils/roll.js'
import Tags from './utils/tags.js'
import Settings from './utils/settings.js'

function startPlugin() {
    window.plugin_shots_ready = true

    function init(){
        Lang.init()

        Templates.init()

        Player.init()

        Handler.init()

        Settings.init()

        Favorite.init()

        Created.init()

        View.init()

        Tags.load()

        $('body').append(`
            <style>
            @@include('../plugins/shots/css/style.css')
            </style>
        `)

        // Добавляем компоненты

        Lampa.Component.add('shots_list', List)
        Lampa.Component.add('shots_card', Card)
        Lampa.Component.add('shots_channel', Channel)

        // Экран закладок - шоты

        Lampa.ContentRows.add({
            index: 1,
            screen: ['bookmarks'],
            call: (params, screen)=>{
                let favotite = Favorite.get()
                let created  = Created.get()
                let lines    = []
                let onmore   = {
                    emit: {
                        onMore: function(){
                            Lampa.Activity.push({
                                url: this.data.type,
                                title: this.data.title,
                                component: 'shots_list',
                                page: 2
                            })
                        }
                    }
                }

                Lampa.Utils.extendItemsParams(favotite, {
                    createInstance: (item_data)=> Shot(item_data, {
                        playlist: favotite,
                        onNext: (page, call)=>{
                            Favorite.page(page, call)
                        }
                    })
                })

                Lampa.Utils.extendItemsParams(created, {
                    createInstance: (item_data)=> Shot(item_data, {
                        playlist: created,
                        onNext: (page, call)=>{
                            Created.page(page, call)
                        }
                    })
                })

                if(favotite.length){
                    lines.push({
                        title: Lampa.Lang.translate('shots_title_favorite'),
                        results: favotite,
                        type: 'favorite',
                        total_pages: favotite.length >= 20 ? 2 : 1,
                        params: onmore
                    })
                }

                if(created.length){
                    lines.push({
                        title: Lampa.Lang.translate('shots_title_created'),
                        results: created,
                        type: 'created',
                        total_pages: created.length >= 20 ? 2 : 1,
                        params: onmore
                    })
                }

                if(lines.length) return lines
            }
        })

        // Главный экран - шоты

        Lampa.ContentRows.add({
            name: 'shots_main',
            title: 'Shots',
            index: 2,
            screen: ['main'],
            call: (params, screen)=>{
                return function(call){
                    Api.lenta({sort: 'new'}, (shots)=>{
                        Lampa.Utils.extendItemsParams(shots, {
                            createInstance: (item_data)=> Shot(item_data, {
                                playlist: shots,
                                onNext: (page, call)=>{
                                    Api.lenta({sort: 'new', page: page}, call)
                                }
                            })
                        })

                        call({
                            title: 'Shots',
                            results: shots,
                            type: 'favorite',
                            total_pages: 1,
                            icon_svg: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                            icon_bgcolor: '#fff',
                            icon_color: '#fd4518',
                            params: {
                                module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon')
                            }
                        })
                    })
                }
            }
        })

        // Кнопка в меню

        let waiting = false

        Lampa.Menu.addButton('<svg><use xlink:href="#sprite-shots"></use></svg>', 'Shots', ()=>{
            let present = new Present()

            present.onComplete = ()=>{
                present.onBack = ()=>{}

                if(waiting) return

                waiting = true

                let call = (shots)=>{
                    Lampa.Loading.stop()

                    present.destroy()

                    waiting = false

                    if(shots.length == 0){
                        return Lampa.Bell.push({
                            icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                            text: Lampa.Lang.translate('shots_alert_noshots')
                        })
                    }

                    let lenta = new Lenta(shots[0], shots)

                    lenta.onNext = (page, call)=>{
                        Roll.next(call)
                    }

                    lenta.start()
                }

                Lampa.Loading.start(()=>{
                    waiting = false

                    present.destroy()

                    call = ()=>{}

                    Lampa.Loading.stop()
                })

                Roll.start(call)
            }

            present.onBack = ()=>{
                present.destroy()

                Lampa.Controller.toggle('content')
            }

            present.start()
        })
    }

    if(Lampa.Manifest.app_digital >= 307){
        if(window.appready) init()
        else{
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') init()
            })
        }
    }
}

if(!window.plugin_shots_ready) startPlugin()