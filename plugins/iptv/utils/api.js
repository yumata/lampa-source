import DB from './db'
import Params from './params'
import M3u8 from './m3u8'

class Api{
    static network = new Lampa.Reguest()
    static api_url = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/iptv/'

    static get(method){
        return new Promise((resolve, reject)=>{
            let account = Lampa.Storage.get('account','{}')

            if(!account.token) return resolve()

            this.network.silent(this.api_url + method,resolve,resolve,false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                }
            })
        })
    }

    static time(call){
        this.network.silent(this.api_url + 'time',call,()=>{
            call({time: Date.now()})
        })
    }

    static m3u(url){
        return new Promise((resolve, reject)=>{
            let account = Lampa.Storage.get('account','{}')

            if(!account.token) return reject(Lampa.Lang.translate('account_login_failed'))

            this.network.timeout(20000)

            this.network[window.god_enabled ? 'native' : 'silent'](url,(str)=>{
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
                        else reject(Lampa.Lang.translate('account_export_fail_600') + ' (' + (j.text || j.message) + ')')
                    },
                    error: reject
                })
            },reject,false,{
                dataType: 'text'
            })
        })
    }

    static list(){
        return new Promise((resolve, reject)=>{
            Promise.all([
                this.get('list'),
                DB.getDataAnyCase('playlist','list')
            ]).then(result=>{
                if(result[0]) DB.rewriteData('playlist','list',result[0])

                let playlist = result[0] || result[1] || {list: []}

                playlist.list = playlist.list.concat(Lampa.Storage.get('iptv_playlist_custom','[]'))

                resolve(playlist)
            }).catch(reject)
        })
    }

    static m3uClient(url){
        return new Promise((resolve, reject)=>{
            this.network.timeout(20000)

            this.network[window.god_enabled ? 'native' : 'silent'](url,(str)=>{
                if (typeof str != 'string' || str.substr(0, 7).toUpperCase() !== "#EXTM3U") {
					return reject(Lampa.Lang.translate('torrent_parser_request_error'))
				}

                let list
                let catchup

                try{
                    str = str.replace(/tvg-rec="(\d+)"/g, 'catchup="default" catchup-days="$1"')
                    
                    list = M3u8.parse(str)
                }
                catch(e){}

                if(list && list.items){
                    let channels = []
        
                    if(list.header.raw.indexOf('catchup') >= 0){
                        catchup = {
                            days: 0,
                            source: '',
                            type: ''
                        }
        
                        let m_days   = list.header.raw.match(/catchup-days="(\d+)"/)
                        let m_type   = list.header.raw.match(/catchup="([a-z]+)"/)
                        let m_source = list.header.raw.match(/catchup-source="(.*?)"/)
        
                        if(m_days)   catchup.days   = m_days[1]
                        if(m_type)   catchup.type   = m_type[1]
                        if(m_source) catchup.source = m_source[1]
                    }
        
                    for(let i = 0; i < list.items.length; i++){
                        let item   = list.items[i]
                        let name   = item.name.trim()

          
                        let channel = {
                            id: item.tvg && item.tvg.id ? item.tvg.id : null,
                            name: name.replace(/ \((\+\d+)\)/g,' $1').replace(/\s+(\s|ⓢ|ⓖ|ⓥ|ⓞ|Ⓢ|Ⓖ|Ⓥ|Ⓞ)/g, ' ').trim(),
                            logo: item.tvg && item.tvg.logo && item.tvg.logo.indexOf('http') == 0 ? item.tvg.logo : null,
                            group: item.group.title,
                            url: item.url,
                            catchup: item.catchup,
                            timeshift: item.timeshift,
                            tvg: item.tvg
                        }
        
                        if(!item.catchup.type && catchup && item.raw.indexOf('catchup-enable="1"') >= 0){
                            channel.catchup = catchup
                        }
        
                        channels.push(channel)
                    }
        
                    let result = {
                        menu: [],
                        channels: channels,
                    }
        
                    result.menu.push({
                        name: '',
                        count: channels.length,
                    })
        
                    for(let i = 0; i < channels.length; i++){
                        let channel = channels[i]
                        let group = channel.group
        
                        let find = result.menu.find(item => item.name === group)
        
                        if(find){
                            find.count++
                        }
                        else{
                            result.menu.push({
                                name: group,
                                count: 1,
                            })
                        }
                    }
        
                    resolve({
                        name: '',
                        playlist: result,
                        secuses: true
                    })
                }
                else{
                    reject(Lampa.Lang.translate('torrent_parser_empty'))
                }
            },reject,false,{
                dataType: 'text'
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

                let error = (e)=>{
                    playlist ? resolve(playlist) : reject(e)
                }

                if(params && params.loading == 'lampa' || data.custom){
                    this[Lampa.Account.logged() ? 'm3u' : 'm3uClient'](data.url).then(secuses).catch(error)
                }
                else{
                    this.get('playlist/' + id).then(secuses).catch(()=>{
                        this.m3u(data.url).then(secuses).catch(error)
                    })
                }
            }).catch(reject)
        })
    }

    static program(data){
        return new Promise((resolve, reject)=>{
            let days     = Lampa.Storage.field('iptv_guide_custom') ? Lampa.Storage.field('iptv_guide_save') : 3
            let tvg_id   = data.tvg && data.tvg.id ? data.tvg.id : data.channel_id
            let tvg_name = data.tvg && data.tvg.name ? data.tvg.name : ''

            let loadCUB = ()=>{
                let id = Lampa.Storage.field('iptv_guide_custom') ? tvg_id : data.channel_id
                
                this.network.timeout(5000)

                this.network.silent(this.api_url + 'program/'+data.channel_id+'/'+data.time + '?full=true',(result)=>{
                    DB.rewriteData('epg', id, result.program).finally(resolve.bind(resolve, result.program))
                },(a)=>{
                    if(a.status == 500) DB.rewriteData('epg', id, []).finally(resolve.bind(resolve, []))
                    else reject()
                })
            }

            let loadEPG = (id, call)=>{
                DB.getDataAnyCase('epg', id, 60 * 24 * days).then(epg=>{
                    if(epg) resolve(epg)
                    else call()
                })
            }

            if(tvg_id){
                loadEPG(tvg_id, ()=>{
                    DB.getDataAnyCase('epg_channels', (tvg_name || data.name).toLowerCase()).then(gu=>{
                        if(gu) loadEPG(gu.id, loadCUB)
                        else loadCUB()
                    })
                })
            }
            else reject()
        })
    }
}

export default Api