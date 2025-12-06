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

function startPlugin() {
    window.plugin_shots_ready = true

    function init(){
        Lang.init()

        Templates.init()

        Player.init()

        Handler.init()

        Favorite.init()

        Created.init()

        $('body').append(`
            <style>
            @@include('../plugins/shots/css/style.css')
            </style>
        `)

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

        Lampa.ContentRows.add({
            index: 2,
            screen: ['main'],
            call: (params, screen)=>{
                return function(call){
                    Api.lenta(1, (shots)=>{
                        Lampa.Utils.extendItemsParams(shots, {
                            createInstance: (item_data)=> Shot(item_data, {
                                playlist: shots,
                                onNext: (page, call)=>{
                                    Api.lenta(page, call)
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

        Lampa.Menu.addButton('<svg><use xlink:href="#sprite-shots"></use></svg>', 'Shots', ()=>{
            Api.lenta(1, (shots)=>{
                let lenta = new Lenta(shots[0], shots)

                lenta.onNext = (page, call)=>{
                    Api.lenta(page, call)
                }

                lenta.start()
            })
        })

        Lampa.Component.add('shots_list', List)
    }

    if(Lampa.Manifest.app_digital >= 307 && Lampa.Platform.screen('tv')){
        if(window.appready) init()
        else{
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') init()
            })
        }
    }
}

if(!window.plugin_shots_ready) startPlugin()