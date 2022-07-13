import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Controller from '../interaction/controller'
import Arrays from './arrays'
import Modal from '../interaction/modal'
import Account from './account'
import Lang from './lang'
import Extensions from '../interaction/extensions'

let created = []
let loaded  = []

/**
 * Запуск
 */
function init(){
    loaded = Storage.get('plugins','[]')

    
    Settings.listener.follow('open',(e)=>{
        if(e.name == 'main'){
            //если не работает, ставь таймер!
            setTimeout(()=>{
                Settings.main().render().find('[data-component="plugins"]').unbind('hover:enter').on('hover:enter',()=>{
                    Extensions.show()
                })
            },10)
        }
    })
}

function get(){
    return loaded.map(a=>a)
}

function modify(){
    let list = Storage.get('plugins','[]')

    list = list.map(a=>{
        return typeof a == 'string' ? {url: a, status: 1} : a
    })
    
    Storage.set('plugins', list)
}

function remove(plug){
    Arrays.remove(loaded, plug)

    Storage.set('plugins', loaded)
}

function add(plug){
    loaded.push(plug)

    Storage.set('plugins', loaded)
}

function save(){
    Storage.set('plugins', loaded)
}

/**
 * Загрузка всех плагинов
 */
function load(call){
    modify()

    Account.plugins((plugins)=>{
        created = plugins.filter(plugin=>plugin.status).map(plugin=>plugin.url).concat(Storage.get('plugins','[]').filter(plugin=>plugin.status).map(plugin=>plugin.url))

        created.push('./plugins/modification.js')
        
        console.log('Plugins','list:', created)

        let errors = []

        Utils.putScript(created,()=>{
            call()

            if(errors.length){
                setTimeout(()=>{
                    let enabled = Controller.enabled().name

                    Modal.open({
                        title: '',
                        html: $('<div class="about"><div class="selector">'+Lang.translate('plugins_no_loaded') + ' ('+errors.join(', ')+')</div></div>'),
                        onBack: ()=>{
                            Modal.close()
                
                            Controller.toggle(enabled)
                        },
                        onSelect: ()=>{
                            Modal.close()
                
                            Controller.toggle(enabled)
                        }
                    })
                },3000)
            }
        },(u)=>{
            Arrays.remove(created, u)

            if(u.indexOf('modification.js') == -1) errors.push(u)
        })
    })
}

export default {
    init,
    load,
    remove,
    loaded: ()=>created,
    add,
    get,
    save
}