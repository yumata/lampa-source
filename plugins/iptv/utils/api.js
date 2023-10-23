import DB from './db'
import Params from './params'

class Api{
    static network = new Lampa.Reguest()
    static api_url = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/iptv/'

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

    static m3u(url){
        return new Promise((resolve, reject)=>{
            let account = Lampa.Storage.get('account','{}')

            if(!account.token) return reject()

            this.network.timeout(20000)

            this.network.native(url,(str)=>{
                let file = new File([str], "playlist.m3u", {
                    type: "text/plain",
                })

                let formData = new FormData($('<form></form>')[0])
                    formData.append("file", file, "playlist.m3u")

                $.ajax({
                    url: this.api_url + 'lampa',
                    type: 'POST',
                    data: formData,
                    async: true,
                    cache: false,
                    contentType: false,
                    timeout: 20000,
                    enctype: 'multipart/form-data',
                    processData: false,
                    headers: {
                        token: account.token,
                        profile: account.profile.id
                    },
                    success: function (j) {
                        if(j.secuses) resolve(j)
                        else reject()
                    },
                    error: reject
                })
            },reject,false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                },
                dataType: 'text'
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

    static playlist(data){
        let id = data.id

        return new Promise((resolve, reject)=>{
            Promise.all([
                DB.getDataAnyCase('playlist',id),
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

                let secuses = (result)=>{
                    DB.rewriteData('playlist', id, result).finally(()=>{
                        if(params) params.update_time = Date.now()

                        Params.set(id, params).finally(resolve.bind(resolve, result))
                    })
                }

                let error = ()=>{
                    playlist ? resolve(playlist) : reject()
                }

                if(params && params.loading == 'lampa'){
                    this.m3u(data.url).then(secuses).catch(error)
                }
                else{
                    this.get('playlist/' + id).then(secuses).catch(error)
                }
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