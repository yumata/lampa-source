import Favorites from './favorites'

let DB = new Lampa.DB('cub_iptv', ['playlist','params','epg','favorites','other'], 4)
    DB.logs = true
    DB.openDatabase().then(Favorites.load).catch(e=>{})

export default DB