import Lang from '../../../utils/lang'
import Controller from '../../../core/controller'
import Loading from '../../loading'
import TMDB from '../../../utils/api/tmdb'
import Manifest from '../../../utils/manifest'

class Module{
    onCreate(){
        function drawMenu(){
            let menu = []

            Manifest.plugins.forEach(plugin=>{
                if(plugin.type == 'video' && plugin.onContextMenu && plugin.onContextLauch){
                    menu.push({
                        title: plugin.name,
                        subtitle: plugin.subtitle || plugin.description,
                        onSelect: ()=>{
                            if(!this.data.imdb_id && data.source == 'tmdb'){
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

export default Module