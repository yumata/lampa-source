import DB from './db'
import Params from './params'

class Api{
    static network = new Lampa.Reguest()
    static api_url = 'http://cub.watch/api/iptv/'

    static get(method){
        return new Promise((resolve, reject)=>{
            let account = Lampa.Storage.get('account','{}')

            if(!account.token) return reject()

            this.network.silent(this.api_url + method,resolve,reject,false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                }
            })
        })
    }

    static list(){
        return new Promise((resolve, reject)=>{
            this.get('list').then(result=>{
                DB.rewriteData('playlist','list',result)

                resolve(result)
            }).catch((e)=>{
                DB.getData('playlist','list').then((result)=>{
                    result ? resolve(result) : reject()
                }).catch(reject)
            })
        })
    }

    static playlist(id){
        return new Promise((resolve, reject)=>{
            Promise.all([
                DB.getData('playlist',id),
                Params.get(id)
            ]).then(result=>{
                let playlist = result[0]
                let params = result[1]

                if(playlist && params){
                    let time = {
                        'always': 0,
                        'hour': 1000 * 60 * 60,
                        'hour12': 1000 * 60 * 60 * 12,
                        'day': 1000 * 60 * 60 * 24,
                        'week': 1000 * 60 * 60 * 24 * 7,
                        'none': 0
                    }
                    
                    if(params.update_time + time[params.update] > Date.now() || params.update == 'none') return resolve(playlist)
                }

                this.get('playlist/' + id).then(result=>{
                    DB.rewriteData('playlist', id, result).finally(()=>{
                        if(params) params.update_time = Date.now()

                        Params.set(id, params).finally(resolve.bind(resolve, result))
                    })
                }).catch(()=>{
                    playlist ? resolve(playlist) : reject()
                })
            }).catch(reject)
        })
    }

    static program(data){
        return new Promise((resolve, reject)=>{
            DB.getDataAnyCase('epg', data.channel_id, 60 * 24 * 3).then(epg=>{
                if(epg) resolve(epg)
                else{
                    this.network.timeout(5000)

                    this.network.silent(this.api_url + 'program/'+data.channel_id+'/'+data.time + '?full=true',(result)=>{
                        DB.rewriteData('epg', data.channel_id, result.program).finally(resolve.bind(resolve, result.program))
                    },(a)=>{
                        if(a.status == 500) DB.rewriteData('epg', data.channel_id, []).finally(resolve.bind(resolve, []))
                        else reject()
                    })
                }
            })
        })
    }
}

export default Api