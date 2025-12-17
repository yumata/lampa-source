import Lang from '../../../core/lang'
import Controller from '../../../core/controller'
import Loading from '../../loading'
import TMDB from '../../../core/api/sources/tmdb'
import Manifest from '../../../core/manifest'

export default {
    onCreate: function(){
        function drawMenu(){
            let menu = []

            Manifest.plugins.forEach(plugin=>{
                if(plugin.type == 'video' && plugin.onContextMenu && plugin.onContextLauch){
                    menu.push({
                        title: plugin.name,
                        subtitle: plugin.subtitle || plugin.description,
                        onSelect: ()=>{
                            if(!this.data.imdb_id && this.data.source == 'tmdb'){
                                Loading.start(()=>{
                                    Loading.stop()
    
                                    Controller.toContent()
                                })
    
                                TMDB.external_imdb_id({
                                    type: this.data.name ? 'tv' : 'movie',
                                    id: this.data.id
                                },(imdb_id)=>{
                                    Loading.stop()
    
                                    this.data.imdb_id = imdb_id
    
                                    plugin.onContextLauch(this.data)
                                })
                            }
                            else plugin.onContextLauch(this.data)
                        }
                    })
                }
            })

            return menu
        }

        this.menu_list.push({
            title: Lang.translate('settings_main_plugins'),
            menu: drawMenu.bind(this),
        })
    }
}