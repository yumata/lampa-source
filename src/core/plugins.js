import Utils from '../utils/utils'
import Storage from './storage/storage'
import Settings from '../interaction/settings/settings'
import Arrays from '../utils/arrays'
import Account from './account/account'
import Lang from './lang'
import Extensions from '../interaction/extensions/extensions'
import Noty from '../interaction/noty'
import Base64 from '../utils/base64'
import Request from '../utils/reguest'
import Cache from '../utils/cache'
import Manifest from './manifest'
import Status from '../utils/status'
import ParentalControl from '../interaction/parental_control'

let _created = []
let _loaded  = []
let _network = new Request()
let _blacklist = []
let _awaits = []
let _noload = []

/**
 * Запуск
 */
function init(){
    _loaded = Storage.get('plugins','[]')

    Settings.main().render().find('[data-component="plugins"]').unbind('hover:enter').on('hover:enter',()=>{
        ParentalControl.personal('extensions',()=>{
            Extensions.show()
        }, false, true)
    })
}

function get(){
    return _loaded.map(a=>a)
}

function modify(){
    let list = Storage.get('plugins','[]')

    list = list.map(a=>{
        return typeof a == 'string' ? {url: a, status: 1} : a
    })

    list.forEach(a=>{
        a.url = (a.url + '').replace('cub.watch', Manifest.cub_domain).replace('bwa.to', 'bwa.ad')
    })

    console.log('Plugins','modify:', list)
    
    Storage.set('plugins', list)
}

function remove(plug){
    Arrays.remove(_loaded, plug)

    console.log('Plugins','remove:', plug, 'index:', _loaded.indexOf(plug) ,'from:', _loaded)

    Storage.set('plugins', _loaded)
}

function add(plug){
    _loaded.push(plug)

    console.log('Plugins','add:', plug)

    Storage.set('plugins', _loaded)

    push(plug)
}

function push(plug){
    let find = _created.find(a=>a == plug.url)

    if(!find && plug.status == 1){
        if(_blacklist.find(a=>plug.url.indexOf(a) >= 0)) return Noty.show(Lang.translate('torrent_error_connect'),{time: 8000})

        _created.push(plug.url)

        console.log('Plugins','push:', plug)

        Utils.putScriptAsync([addPluginParams(plug.url)],false,()=>{
            Noty.show(Lang.translate('plugins_check_fail'),{time: 8000})
        },()=>{
            updatePluginDB(plug.url, addPluginParams(plug.url))

            Noty.show(Lang.translate('plugins_add_success'))
        },false)
    }
}

function save(){
    console.log('Plugins','save:', _loaded)

    Storage.set('plugins', _loaded)
}

function updatePluginDB(name, url){
    //if(Account.hasPremium()){
        let cu = Utils.addUrlComponent(url, 'cache=true')

        _network.native(cu,(str)=>{
            Cache.rewriteData('plugins', name, str).then(()=>{
                console.log('Plugins','update plugin cache:', name)
            }).catch((e)=>{
                console.warn('Plugins','add to cache fail:', name, typeof e == 'string' ? e : e ? e.message : 'no details')
            })
        },false,false,{
            dataType: 'text'
        })
    //}
}

function createPluginDB(name){
    //if(Account.hasPremium()){
        Cache.getData('plugins',name).then(code=>{
            if(code){
                let s = document.createElement('script')
                    s.type = 'text/javascript'
                
                try {
                    s.appendChild(document.createTextNode(code))
                    document.body.appendChild(s)
                } 
                catch (e) {
                    s.text = code
                    document.body.appendChild(s)
                }

                console.log('Plugins','add plugin from cache:', name)
            }
            else console.warn('Plugins','no find in cache:', name)
        }).catch(e=>{
            console.warn('Plugins','include from cache fail:', name, typeof e == 'string' ? e : e.message)
        })
    //}
}

function addPluginParams(url){
    let encode = url

    encode = encode.replace('cub.watch', Manifest.cub_domain)

    encode = Utils.fixMirrorLink(encode)
        
    if(!/[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}/.test(encode)){
        encode = encode.replace(/\{storage_(\w+|\d+|_|-)\}/g,(match,key)=>{
            return encodeURIComponent(Base64.encode(localStorage.getItem(key) || ''))
        })

        if(Account.Permit.access) encode = Utils.addUrlComponent(encode, 'email='+encodeURIComponent(Base64.encode(Account.Permit.account.email)))

        encode = Utils.addUrlComponent(encode, 'logged='+encodeURIComponent(Account.Permit.access ? 'true' : 'false'))
        encode = Utils.addUrlComponent(encode, 'reset='+Math.random())
        encode = Utils.addUrlComponent(encode, 'origin='+encodeURIComponent(Base64.encode(window.location.host)))

        encode = Utils.rewriteIfHTTPS(encode)
    }

    return encode
}

function loadBlackList(call){
    if(window.lampa_settings.disable_features.blacklist) return call([])
    
    let status = new Status(2)
        status.onComplite = (res)=>{
            call([].concat(res.cub, res.custom))
        }

    _network.silent(Utils.protocol() + Manifest.cub_domain + '/api/plugins/blacklist',(result)=>{
        let list = result.map(a=>a.url)

        Storage.set('plugins_blacklist', list)

        status.append('cub', list)
    },()=>{
        status.append('cub', Storage.get('plugins_blacklist','[]'))
    }, false, {
        timeout: 1000 * 5
    })

    _network.silent('./plugins_black_list.json',(list)=>{
        status.append('custom', list)
    },()=>{
        status.append('custom', [])
    }, false, {
        timeout: 1000 * 5
    })
}

/**
 * Загрузка всех плагинов
 */
function load(call){
    let errors   = []
    let original = {}
    let include  = []

    _awaits.forEach(url=>{
        let encode = addPluginParams(url)

        include.push(encode)

        original[encode] = url
    })

    Utils.putScriptAsync(include,()=>{
        call()

        if(errors.length){
            setTimeout(()=>{
                Noty.show(Lang.translate('plugins_no_loaded') + ' ('+errors.join(', ')+')',{time: 6000})
            },2000)
        }
    },(u)=>{
        if(u.indexOf('modification.js') == -1){
            console.warn('Extensions','error:', original[u])

            errors.push(original[u])

            _noload.push(original[u])

            createPluginDB(original[u], u)
        }
    },(u)=>{
        console.log('Extensions','include:', original[u])

        _created.push(original[u])

        updatePluginDB(original[u], u)
    },false)
}

function task(call){
    modify()

    _loaded = Storage.get('plugins','[]')

    loadBlackList((black_list)=>{
        Account.Api.plugins((plugins)=>{
            let puts = window.lampa_settings.plugins_use ? plugins.filter(plugin=>plugin.status).map(plugin=>plugin.url).concat(Storage.get('plugins','[]').filter(plugin=>plugin.status).map(plugin=>plugin.url)) : []

            puts.push('./plugins/modification.js')

            puts = puts.filter((element, index) => {
                return puts.indexOf(element) === index
            })
            
            console.log('Plugins','load list:', puts)

            black_list.push('lipp.xyz')
            black_list.push('llpp.xyz')
            black_list.push('scabrum.github.io')
            black_list.push('bylampa.github.io')
            black_list.push('tinyurl.com')

            // Stupid people :(
            black_list.push('t.me/')
            black_list.push('4pda.')
            black_list.push('teletype.in')
            black_list.push('yotube.com')
            
            _blacklist = black_list

            console.log('Plugins','black list:', black_list)

            black_list.forEach(b=>{
                puts = puts.filter(p=>p.toLowerCase().indexOf(b) == -1)
            })

            console.log('Plugins','clear list:', puts)

            _awaits = puts

            call()
        })
    })
}

function awaits(){
    return _awaits
}

export default {
    init,
    load,
    remove,
    loaded: ()=>_created,
    errors: ()=>_noload,
    add,
    get,
    save,
    push,
    task,
    awaits
}
