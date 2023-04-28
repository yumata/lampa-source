import DB from './db'

let favorites = []

class Favorites{
    static load(){
        DB.getData('favorites').then((result)=>{
            favorites = result || []
        })
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
                DB.deleteData('favorites', favorite.url).then(()=>{
                    Lampa.Arrays.remove(favorites, find)

                    resolve()
                }).catch(reject)
            }
            else reject()
        })
    }

    static add(favorite){
        return new Promise((resolve, reject)=>{
            if(!favorites.find(a=>a.url == favorite.url)){
                DB.addData('favorites', favorite.url, favorite).then(()=>{
                    favorites.push(favorite)

                    resolve()
                }).catch(reject)
            }
            else reject()
        })
    }

    static toggle(favorite){
        return this.find(favorite) ? this.remove(favorite) : this.add(favorite)
    }
}

export default Favorites