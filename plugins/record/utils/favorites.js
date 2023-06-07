class Favorites{
    static get(){
        let all = Lampa.Storage.get('radio_favorite_stations','[]')

        all.sort((a,b)=>{
            return a.added > b.added ? -1 : a.added < b.added ? 1 : 0
        })

        return all
    }

    static find(favorite){
        return this.get().find(a=>a.id == favorite.id)
    }

    static remove(favorite){
        let list = this.get()
        let find = this.find(favorite)

        if(find){
            Lampa.Arrays.remove(list, find)

            Lampa.Storage.set('radio_favorite_stations', list)
        }
    }

    static add(favorite){
        let list = this.get()
        let find = this.find(favorite)

        if(!find){
            Lampa.Arrays.extend(favorite,{
                id: Lampa.Utils.uid(),
                added: Date.now()
            })

            list.push(favorite)

            Lampa.Storage.set('radio_favorite_stations', list)
        }
    }

    static update(favorite){
        let list = this.get()
        let find = this.find(favorite)

        if(find){
            Lampa.Storage.set('radio_favorite_stations', list)
        }
    }

    static toggle(favorite){
        return this.find(favorite) ? this.remove(favorite) : this.add(favorite)
    }
}

export default Favorites