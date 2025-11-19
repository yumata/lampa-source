import Lang from './utils/lang.js'
import Templates from './utils/templates.js'
import Layer from './utils/layer.js'
import Handler from './utils/handler.js'
import Favorite from './utils/favorite.js'
import Shot from './components/shot.js'

function startPlugin() {
    window.plugin_shots_ready = true

    function init(){
        Lang.init()

        Templates.init()

        Layer.init()

        Handler.init()

        Favorite.init()

        $('body').append(`
            <style>
            @@include('../plugins/shots/css/style.css')
            </style>
        `)

        Lampa.ContentRows.add({
            index: 1,
            screen: ['bookmarks'],
            call: (params, screen)=>{
                let favotite = Favorite.get('favorite')
                let created  = Favorite.get('created')
                let lines    = []

                let test = {
                    id: 12345,
                    card: {
                        id: 76640,
                        type: 'movie',
                        title: 'Возвращение героя',
                        release_date: '2013-01-12',
                        poster_path: '/3b18bwznHHXNcJd46IvBPbZjQWL.jpg'
                    },
                    img: 'https://video.lampa-shorts.com/o/DZ-sarbc/s.jpg',
                    file: 'https://video.lampa-shorts.com/o/DZ-sarbc/o.mp4',
                    cid: 1,
                    video_id: 'DOD-SWXbc',
                    status: 'ready',
                    vieved: 250,
                    liked: 398,
                    saved: 120,
                    season: 1,
                    episode: 1,
                    voice_name: 'unknown',
                    start_point: 40,
                    end_point: 120,
                    author: {
                        name: 'John Doe',
                        img: 'https://video.lampa-shorts.com/o/DZ-sarbc/s.jpg'
                    }
                }

                favotite = [test,test,test,test]

                Lampa.Utils.extendItemsParams(favotite, {
                    createInstance: (item_data)=> Shot(item_data, {
                        playlist: favotite,
                        onNext: (page, call)=>{
                            Favorite.page('favorite', call, call, page)
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

        // setTimeout(()=>{
        //     new Upload({
        //         card: {
        //             id: 76640,
        //             title: 'Возвращение героя',
        //             release_date: '2013-01-12',
        //             poster_path: '/3b18bwznHHXNcJd46IvBPbZjQWL.jpg'
        //         }
        //     }).start()
        // },3000)
    }

    if(window.appready) init()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') init()
        })
    }
}

if(!window.plugin_shots_ready) startPlugin()