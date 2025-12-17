import Utils from '../../utils/utils'
import Storage from './storage'
import Reguest from '../../utils/reguest'
import Arrays from '../../utils/arrays'
import Socket from '../socket'
import Account from '../account/account'
import Manifest from '../manifest'


let network = new Reguest()

function api(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

class WorkerArray{
    constructor(field){
        this.field  = field
        this.empty  = []
        this.data   = []
        this.limit  = 3000
        this.loaded = false
        this.update_time = 0
    }

    init(class_type){
        let timer_update
        let start_time = Date.now()

        this.class_type  = class_type

        console.log('StorageWorker', this.field, 'start follow')

        Storage.listener.follow('change',(e)=>{
            if(this.field == e.name && this.loaded && Account.Permit.sync && Account.hasPremium()){
                try{
                    this.save(e.value)
                }
                catch(e){
                    console.log('StorageWorker',this.field,e.message)
                }
            }

            if(e.name == 'account'){
                clearTimeout(timer_update)

                timer_update = setTimeout(this.update.bind(this,true),5 * 1000)
            }
        })

        Socket.listener.follow('message',(e)=>{
            if(e.method == 'storage' && e.data.name == this.field){
                try{
                    if(e.data.remove) this.removeFromSocket(e.data)
                    else this.updateFromSocket(e.data)
                }
                catch(e){
                    console.log('StorageWorker',this.field,e.message)
                }
            }
        })

        Socket.listener.follow('open',(e)=>{
            if(Date.now() - start_time > 1000 * 60 * 5){
                clearTimeout(timer_update)

                timer_update = setTimeout(this.update.bind(this,false,true),10 * 1000)
            }
        })

        this.update()
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

    parse(from, nolisten){
        let to = Storage.cache(this.field, this.limit, Arrays.clone(this.empty))

        this.filter(from, to)

        Storage.set(this.field, to, nolisten)

        this.data = this.restrict(Arrays.decodeJson(localStorage.getItem(this.field),Arrays.clone(this.empty)))

        Lampa.Listener.send('worker_storage',{type:'insert', name:this.field, from, to})
    }

    filter(from, to){
        from.forEach(a=>{
            if(to.indexOf(a) == -1) to.push(a)
        })
    }

    update(full, nolisten){
        if(Account.Permit.sync && Account.hasPremium() && Date.now() - this.update_time > 1000 * 60 * 9){
            let account = Account.Permit.account

            this.update_time = Date.now()

            let url = api() + 'storage/data/'+encodeURIComponent(this.field) + '/' + this.class_type
            let all = full

            if(Storage.get('storage_'+this.field+'_update_time','0') + 1000 * 60 * 60 * 24 < Date.now()) all = true

            if(all) url = url + '?full=true'

            network.silent(url,(result)=>{
                try{
                    this.parse(result.data, nolisten)
                }
                catch(e){
                    console.log('StorageWorker',this.field,e.message)
                }

                Storage.set('storage_'+this.field+'_update_time',Date.now())

                this.loaded = true
            },(e)=>{
                console.log('StorageWorker', this.field, e.decode_error)
            },false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                }
            })
        }
    }

    removeFromSocket(data){
        Arrays.remove(this.data, data.value)

        let store = Storage.cache(this.field, this.limit, Arrays.clone(this.empty))

        Arrays.remove(store, data.value)

        Storage.set(this.field, store, true)
    }

    updateFromSocket(data){
        let from = [data.value]

        this.parse(from, true)
    }

    send(id,value){
        if(!Account.hasPremium()) return

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

    sendClean(){
        Socket.send('storage',{
            params: {
                id: null,
                name: this.field,
                value: '',
                clean: true
            }
        })
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

    clean(){
        this.data = []

        this.sendClean()
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

    removeFromSocket(data){
        let find = this.data.find(a=>a.id == data.id)

        if(find) Arrays.remove(this.data, find)

        let store = Storage.cache(this.field, this.limit, Arrays.clone(this.empty))

        find = store.find(a=>a.id == data.id)

        if(find) Arrays.remove(store, find)

        Storage.set(this.field, store, true)
    }

    updateFromSocket(data){
        let from = [data.value]

        this.parse(from, true)
    }

    save(value){
        let uniq = []

        value.forEach(val=>{
            let find = this.data.find(a=>a.id == val.id)

            if(!find){
                this.data.push(typeof val == 'object' ? Arrays.clone(val) : val)

                uniq.push(val)
            } 
            else if(JSON.stringify(val) !== JSON.stringify(find)){
                this.data[this.data.indexOf(find)] = typeof val == 'object' ? Arrays.clone(val) : val
                
                uniq.push(val)
            }
        })

        uniq.forEach(val=>{
            this.send(val.id, val)
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

    removeFromSocket(data){
        delete this.data[id]

        let store = Storage.cache(this.field, this.limit, Arrays.clone(this.empty))

        delete store[id]

        Storage.set(this.field, store, true)
    }

    updateFromSocket(data){
        let object = {}
            object[data.id] = data.value

        this.parse(object, true)
    }

    save(value){
        let uniq = []

        for(let id in value){
            let a = value[id]
            let b = this.data[id]

            if(!this.data[id]){
                this.data[id] = typeof a == 'object' ? Arrays.clone(a) : a

                uniq.push(id)
            }
            else{
                a = JSON.stringify(a)
                b = JSON.stringify(b)

                if(a !== b){
                    this.data[id] = typeof value[id] == 'object' ? Arrays.clone(value[id]) : value[id]

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

    clean(){
        this.data = {}

        this.sendClean()
    }
}

export default {
    //['string',0499383]
    array_string: WorkerArray,

    //[{'id':'049994',...}]
    array_object_id: WorkerFilterID,

    //{'id048994':{...}, ...}
    object_object: WorkerObject,

    //{'id399884':'string', ...}
    object_string: WorkerObject
}