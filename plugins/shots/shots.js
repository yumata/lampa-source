import Lang from './utils/lang.js'
import Templates from './utils/templates.js'
import Player from './utils/player.js'
import Handler from './utils/handler.js'
import Favorite from './utils/favorite.js'
import Created from './utils/created.js'
import Shot from './components/shot.js'
import Lenta from './lenta/lenta.js'
import Api from './utils/api.js'

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
                    })
                }

                if(created.length){
                    lines.push({
                        title: Lampa.Lang.translate('shots_title_created'),
                        results: created,
                        type: 'created',
                    })
                }

                if(lines.length) return lines
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