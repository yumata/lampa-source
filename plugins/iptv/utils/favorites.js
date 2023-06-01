import DB from './db'
import Utils from './utils'

let favorites = []

class Favorites{
    static load(){
        return new Promise((resolve, reject)=>{
            if(Utils.canUseDB()){
                DB.getData('favorites').then((result)=>{
                    favorites = result || []
                }).finally(resolve)
            }
            else{
                this.nosuport()

                resolve()
            }
        })
    }

    static nosuport(){
        favorites = Lampa.Storage.get('iptv_favorite_channels','[]')
    }

    static list(){
        return favorites
    }

    static key(){
        return Lampa.Storage.get('iptv_favotite_save','url')
    }

    static find(favorite){
        return favorites.find(a=>a[this.key()] == favorite[this.key()])
    }

    static remove(favorite){
        return new Promise((resolve, reject)=>{
            let find = favorites.find(a=>a[this.key()] == favorite[this.key()])

            if(find){
                if(Utils.canUseDB()){
                    DB.deleteData('favorites', favorite[this.key()]).then(()=>{
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
            if(!favorites.find(a=>a[this.key()] == favorite[this.key()])){

                Lampa.Arrays.extend(favorite,{
                    view: 0,
                    added: Date.now()
                })

                if(Utils.canUseDB()){
                    DB.addData('favorites', favorite[this.key()], favorite).then(()=>{
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
            if(favorites.find(a=>a[this.key()] == favorite[this.key()])){

                Lampa.Arrays.extend(favorite,{
                    view: 0,
                    added: Date.now()
                })

                if(Utils.canUseDB()) DB.updateData('favorites', favorite[this.key()], favorite).then(resolve).catch(reject)
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