import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Arrays from './arrays'
import Account from './account'
import Lang from './lang'
import Extensions from '../interaction/extensions'
import Noty from '../interaction/noty'
import Base64 from './base64'

let _created = []
let _loaded  = []

/**
 * Запуск
 */
function init(){
    _loaded = Storage.get('plugins','[]')

    Settings.main().render().find('[data-component="plugins"]').unbind('hover:enter').on('hover:enter',()=>{
        Extensions.show()
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
}

function save(){
    console.log('Plugins','save:', _loaded)

    Storage.set('plugins', _loaded)
}

/**
 * Загрузка всех плагинов
 */
function load(call){
    console.log('Plugins','start load')

    modify()

    Account.plugins((plugins)=>{
        let puts = plugins.filter(plugin=>plugin.status).map(plugin=>plugin.url).concat(Storage.get('plugins','[]').filter(plugin=>plugin.status).map(plugin=>plugin.url))

        puts.push('./plugins/modification.js')

        puts.filter((element, index) => {
            return puts.indexOf(element) === index
        })
        
        console.log('Plugins','list:', puts)

        let errors   = []
        let original = {}
        let include  = []

        puts.forEach(url=>{
            let encode = url
            
            if(!/[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}/.test(encode)){
                encode = encode.replace(/\{storage_(\w+|\d+|_|-)\}/g,(match,key)=>{
                    return encodeURIComponent(Base64.encode(localStorage.getItem(key) || ''))
                })

                let email = localStorage.getItem('account_email')

                if(Account.logged() &&  email) encode = Utils.addUrlComponent(encode, 'email='+encodeURIComponent(Base64.encode(email)))

                encode = Utils.addUrlComponent(encode, 'logged='+encodeURIComponent(Account.logged() ? 'true' : 'false'))
                encode = Utils.addUrlComponent(encode, 'reset='+Math.random())
            }

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
                console.log('Plugins','error:', original[u])

                errors.push(original[u])
            }
        },(u)=>{
            console.log('Plugins','include:', original[u])

            _created.push(original[u])
        },false)
    })
}

export default {
    init,
    load,
    remove,
    loaded: ()=>_created,
    add,
    get,
    save
}