import Utils from './math'
import Storage from './storage'
import Reguest from './reguest'
import Arrays from './arrays'
import Socket from './socket'
import Account from './account'
import Manifest from './manifest'


let network = new Reguest()
let api     = Utils.protocol() + Manifest.cub_domain + '/api/'


class WorkerArray{
    constructor(field){
        this.field  = field
        this.empty  = []
        this.data   = []
        this.limit  = 3000
        this.loaded = false
    }

    init(){
        Storage.listener.follow('change',(e)=>{
            if(this.field == e.name && this.loaded){
                try{
                    this.save(e.value)
                }
                catch(e){
                    console.log('StorageWorker',this.field,e.message)
                }
            } 
        })

        this.update()

        setInterval(this.update.bind(this),1000*60*10)
    }

    restrict(result){
        if(Arrays.isObject(result)){
            let keys = Arrays.getKeys(result)

            if(keys.length > this.limit){
                let remv = keys.slice(0, keys.length - this.limit)

                remv.forEach(k=>{
                    delete result[k]
                })
            }
        }
        else if(result.length > this.limit){
            result = result.slice(result.length - this.limit)
        }

        return result
    }

    parse(from){
        let to = Storage.cache(this.field, this.limit) ///this.restrict(Arrays.decodeJson(localStorage.getItem(this.field),Arrays.clone(this.empty)))

        this.filter(from, to)

        Storage.set(this.field, to)//localStorage.setItem(this.field, JSON.stringify(to))

        this.data = this.restrict(Arrays.decodeJson(localStorage.getItem(this.field),Arrays.clone(this.empty)))

        Lampa.Listener.send('worker_storage',{type:'insert', name:this.field, from, to})
    }

    filter(from, to){
        from.forEach(a=>{
            if(to.indexOf(a) == -1) to.push(a)
        })
    }

    update(){
        let account = Account.canSync()

        if(account){
            network.silent(api + 'storage/data/'+this.field,(result)=>{
                try{
                    this.parse(result.data)
                }
                catch(e){
                    console.log('StorageWorker',this.field,e.message)
                }

                this.loaded = true
            },()=>{
                setTimeout(this.update.bind(this),1000*60*1)
            },false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                }
            })
        }
    }

    send(id,value){
        if(this.field !== 'online_view' && !Account.hasPremium()) return

        console.log('StorageWorker','save:',this.field, id,value)

        let str = JSON.stringify(value)

        if(str.length < 10000){
            Socket.send('storage',{
                params: {
                    id: id,
                    name: this.field,
                    value: value
                }
            })
        }
    }

    sendRemove(id,value){
        let str = JSON.stringify(value)

        console.log('StorageWorker','remove:',this.field, id,value)

        if(str.length < 10000){
            Socket.send('storage',{
                params: {
                    id: id,
                    name: this.field,
                    value: value,
                    remove: true
                }
            })
        }
    }

    save(value){
        let uniq = value.filter(a=>this.data.indexOf(a) == -1)

        uniq.forEach(val=>{
            this.data.push(val)

            this.send(null, val)
        })
    }

    remove(value){
        Arrays.remove(this.data, value)

        this.sendRemove(null, value)
    }
}

class WorkerFilterID extends WorkerArray {
    filter(from, to) {
        from.forEach(a=>{
            let find = to.find(b=>b.id == a.id)

            if(!find) to.push(a)
            else{
                to[to.indexOf(find)] = a
            }
        })
    }

    save(value){
        let uniq = []

        value.forEach(val=>{
            let find = this.data.find(a=>a.id == val.id)

            if(!find){
                this.data.push(val)

                uniq.push(val)
            } 
            else if(JSON.stringify(val) !== JSON.stringify(find)){
                this.data[this.data.indexOf(find)] = val
                
                uniq.push(val)
            }
        })

        uniq.forEach(val=>{
            this.send(null, val)
        })
    }

    remove(id){
        let find = this.data.find(a=>a.id == id)

        if(find) Arrays.remove(this.data, find)

        this.sendRemove(id, null)
    }
}

class WorkerObject extends WorkerArray {
    constructor(params){
        super(params)
        
        this.data  = {}
        this.empty = {}
    }

    filter(from, to) {
        for(let id in from){
            to[id] = from[id]
        }
    }

    save(value){
        let uniq = []

        for(let id in value){
            let a = value[id]
            let b = this.data[id]

            if(!this.data[id]){
                this.data[id] = a

                uniq.push(id)
            }
            else{
                a = JSON.stringify(a)
                b = JSON.stringify(b)

                if(a !== b){
                    this.data[id] = value[id]

                    uniq.push(id)
                }
            }
        }

        uniq.forEach(id=>{
            this.send(id, value[id])
        })
    }

    remove(id){
        delete this.data[id]

        this.sendRemove(id, null)
    }
}

export default {
    online_view: WorkerArray,
    torrents_view: WorkerArray,
    search_history: WorkerArray,

    timetable: WorkerFilterID,
    quality_scan: WorkerFilterID,

    online_choice_videocdn: WorkerObject,
    online_choice_filmix: WorkerObject,
    online_choice_kinobase: WorkerObject,
    online_choice_cdnmovies: WorkerObject,
    online_choice_rezka: WorkerObject,
    online_last_balanser: WorkerObject,
}