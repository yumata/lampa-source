import Favorites from './favorites'
import Locked from './locked'

let DB = new Lampa.DB('cub_iptv', ['playlist','params','epg','favorites','other', 'epg_channels', 'locked'], 6)
    DB.logs = true
    DB.openDatabase().then(()=>{
        Favorites.load()
        Locked.load()
    }).catch(()=>{
        Favorites.nosuport()
        Locked.nosuport()
    })

export default DB