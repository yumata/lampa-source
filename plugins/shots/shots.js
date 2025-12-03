import Lang from './utils/lang.js'
import Templates from './utils/templates.js'
import Player from './utils/player.js'
import Handler from './utils/handler.js'
import Favorite from './utils/favorite.js'
import Created from './utils/created.js'
import Shot from './components/shot.js'

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
    }

    if(window.appready) init()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') init()
        })
    }
}

if(!window.plugin_shots_ready) startPlugin()