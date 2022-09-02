import Utils from './math'
import Storage from './storage'
import Reguest from './reguest'
import Arrays from './arrays'
import Socket from './socket'
import Account from './account'


let network = new Reguest()
let api     = Utils.protocol() + 'cub.watch/api/'


class WorkerArray{
    constructor(field){
        this.field = field
        this.empty = []
        this.data  = []
        this.limit = 3000
    }

    init(){
        this.update(()=>{
            Storage.listener.follow('change',(e)=>{
                if(this.field == e.name){
                    try{
                        this.save(e.value)
                    }
                    catch(e){
                        console.log('StorageWorker',this.field,e.message)
                    }
                } 
            })
        })
    }

    parse(from){
        let to = Storage.cache(this.field,this.limit,Arrays.clone(this.empty))

        this.filter(from, to)

        localStorage.setItem(this.field, JSON.stringify(to))

        this.data = to
    }

    filter(from, to){
        from.forEach(a=>{
            if(to.indexOf(a) == -1) to.push(a)
        })
    }

    update(call){
        let account = Account.canSync()

        if(account){
            network.silent(api + 'storage/data/'+this.field,(result)=>{
                try{
                    this.parse(result.data)
                }
                catch(e){
                    console.log('StorageWorker',this.field,e.message)
                }

                if(call) call()
            },()=>{
                if(call) call()
            },false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                }
            })
        }
        else if(call) call()
    }

    send(id,value){
        if(this.field !== 'online_view' && !Account.hasPremium()) return

        //console.log('StorageWorker','send:',this.field, id,value)

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

    save(value){
        let uniq = value.filter(a=>this.data.indexOf(a) == -1)

        uniq.forEach(val=>{
            this.data.push(val)

            this.send(null, val)
        })
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
}

export default {
    online_view: WorkerArray,
    torrents_view: WorkerArray,
    search_history: WorkerArray,

    timetable: WorkerFilterID,
    recomends_list: WorkerFilterID,
    quality_scan: WorkerFilterID,

    online_choice_videocdn: WorkerObject,
    online_choice_filmix: WorkerObject,
    online_choice_kinobase: WorkerObject,
    online_choice_cdnmovies: WorkerObject,
    online_choice_rezka: WorkerObject,
    online_last_balanser: WorkerObject,
}