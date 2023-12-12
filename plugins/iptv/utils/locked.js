import DB from './db'
import Utils from './utils'

let locked = []

class Locked{
    static load(){
        return new Promise((resolve, reject)=>{
            if(Utils.canUseDB()){
                DB.getData('locked').then((result)=>{
                    locked = result || []
                }).finally(resolve)
            }
            else{
                this.nosuport()

                resolve()
            }
        })
    }

    static nosuport(){
        locked = Lampa.Storage.get('iptv_locked_channels','[]')
    }

    static list(){
        return locked
    }

    static find(key){
        return locked.find(a=>a == key)
    }

    static format(type, element){
        return type == 'channel' ? 'channel:' + element[Lampa.Storage.get('iptv_favotite_save','url')] : type == 'group' ? 'group:' + element : 'other:' + element
    }

    static remove(key){
        return new Promise((resolve, reject)=>{
            let find = locked.find(a=>a == key)

            if(find){
                if(Utils.canUseDB()){
                    DB.deleteData('locked', key).then(()=>{
                        Lampa.Arrays.remove(locked, find)
    
                        resolve()
                    }).catch(reject)
                }
                else{
                    Lampa.Arrays.remove(locked, find)

                    Lampa.Storage.set('iptv_locked_channels',locked)

                    resolve()
                }
            }
            else reject()
        })
    }

    static add(key){
        return new Promise((resolve, reject)=>{
            if(!locked.find(a=>a == key)){

                if(Utils.canUseDB()){
                    DB.addData('locked', key, key).then(()=>{
                        locked.push(key)

                        resolve()
                    }).catch(reject)
                }
                else{
                    locked.push(key)

                    Lampa.Storage.set('iptv_locked_channels',locked)

                    resolve()
                }
            }
            else reject()
        })
    }

    static update(key){
        return new Promise((resolve, reject)=>{
            if(locked.find(a=>a == key)){

                if(Utils.canUseDB()) DB.updateData('locked', key, key).then(resolve).catch(reject)
                else{
                    Lampa.Storage.set('iptv_locked_channels',locked)

                    resolve()
                }
            }
            else reject()
        })
    }

    static toggle(key){
        return this.find(key) ? this.remove(key) : this.add(key)
    }
}

export default Locked