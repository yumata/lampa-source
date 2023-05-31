import DB from './db'

let favorites = []

class Favorites{
    static load(){
        DB.getData('favorites').then((result)=>{
            favorites = result || []
        })
    }

    static nosuport(){
        favorites = Lampa.Storage.get('iptv_favorite_channels','[]')
    }

    static list(){
        return favorites
    }

    static find(favorite){
        return favorites.find(a=>a.url == favorite.url)
    }

    static remove(favorite){
        return new Promise((resolve, reject)=>{
            let find = favorites.find(a=>a.url == favorite.url)

            if(find){
                if(DB.db){
                    DB.deleteData('favorites', favorite.url).then(()=>{
                        Lampa.Arrays.remove(favorites, find)
    
                        resolve()
                    }).catch(reject)
                }
                else{
                    Lampa.Arrays.remove(favorites, find)

                    Lampa.Storage.set('iptv_favorite_channels',favorites)

                    resolve()
                }
            }
            else reject()
        })
    }

    static add(favorite){
        return new Promise((resolve, reject)=>{
            if(!favorites.find(a=>a.url == favorite.url)){

                Lampa.Arrays.extend(favorite,{
                    view: 0,
                    added: Date.now()
                })

                if(DB.db){
                    DB.addData('favorites', favorite.url, favorite).then(()=>{
                        favorites.push(favorite)

                        resolve()
                    }).catch(reject)
                }
                else{
                    favorites.push(favorite)

                    Lampa.Storage.set('iptv_favorite_channels',favorites)

                    resolve()
                }
            }
            else reject()
        })
    }

    static update(favorite){
        return new Promise((resolve, reject)=>{
            if(favorites.find(a=>a.url == favorite.url)){

                Lampa.Arrays.extend(favorite,{
                    view: 0,
                    added: Date.now()
                })

                if(DB.db) DB.updateData('favorites', favorite.url, favorite).then(resolve).catch(reject)
                else{
                    Lampa.Storage.set('iptv_favorite_channels',favorites)

                    resolve()
                }
            }
            else reject()
        })
    }

    static toggle(favorite){
        return this.find(favorite) ? this.remove(favorite) : this.add(favorite)
    }
}

export default Favorites