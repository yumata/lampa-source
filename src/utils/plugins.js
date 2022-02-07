import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Controller from '../interaction/controller'
import Arrays from './arrays'
import Params from '../components/settings/params'
import Input from '../components/settings/input'
import Modal from '../interaction/modal'
import Account from './account'

let body

/**
 * Запуск
 */
function init(){
    Settings.listener.follow('open',(e)=>{
        body = null

        if(e.name == 'plugins'){
            body = e.body

            renderPanel()
        }
    })
}

/**
 * Рендер панели плагинов
 */
function renderPanel(){
    if(body){
        let list = Storage.get('plugins','[]')

        $('.selector',body).on('hover:enter',()=>{
            Input.edit({
                value: '',
            },(new_value)=>{
                if(new_value && Storage.add('plugins', new_value)){
                    renderPlugin(new_value, {
                        is_new: true,
                        checked: (error)=>{
                            Modal.open({
                                title: '',
                                html: $('<div class="about"><div class="selector">'+(error ? 'Не удалось проверить работоспособность плагина, однако это не означает что он не работает. Перезагрузите приложение для выяснения загружается ли плагин.' : 'Для работы плагина, необходимо перезагрузить приложение.' )+'</div></div>'),
                                onBack: ()=>{
                                    Modal.close()
    
                                    Controller.toggle('settings_component')
                                },
                                onSelect: ()=>{
                                    Modal.close()
    
                                    Controller.toggle('settings_component')
                                }
                            })
                        }
                    })

                    Params.listener.send('update_scroll')
                }
            })
        })

        list.forEach(url => {
            renderPlugin(url)
        })

        Account.plugins((plugins)=>{
            plugins.forEach((plugin)=>{
                renderPlugin(plugin.url,{
                    is_cub: true,
                    plugin: plugin
                })
            })

            Controller.enable('settings_component')

            Params.listener.send('update_scroll')
        })

        Params.listener.send('update_scroll')
    }
}

/**
 * Рендер плагина
 */
function renderPlugin(url, params = {}){
    let item  = $('<div class="settings-param selector"><div class="settings-param__name">'+(params.is_cub && params.plugin.name ? params.plugin.name + ' - ' : '')+url+'</div><div class="settings-param__descr">'+(params.is_cub ? 'Загружено из CUB' : 'Нажмите для проверки плагина')+'</div><div class="settings-param__status"></div></div>')
    let check = ()=>{
        let status = $('.settings-param__status',item).removeClass('active error wait').addClass('wait')
        
        $.ajax({
            dataType: 'text',
            url: url,
            timeout: 2000,
            crossDomain: true,
            success: (data) => {
                status.removeClass('wait').addClass('active')

                if(params.checked) params.checked()
            },
            error: (jqXHR, exception) => {
                status.removeClass('wait').addClass('error')

                if(params.checked) params.checked(true)
            }
        })
    }

    item.on('hover:long',()=>{
        if(params.is_cub){
            Account.pluginsStatus(params.plugin, params.plugin.status ? 0 : 1)

            item.css({opacity: params.plugin.status ? 0.5 : 1})

            params.plugin.status = params.plugin.status ? 0 : 1
        }
        else{
            let list = Storage.get('plugins','[]')

            Arrays.remove(list, url)

            Storage.set('plugins', list)

            item.css({opacity: 0.5})
        }
    })
    
    if(params.is_cub && !params.plugin.status) item.css({opacity: 0.5})

    item.on('hover:enter', check)

    if(params.is_new) check()

    $('.selector:eq(0)',body).after(item)
}

/**
 * Загрузка всех плагинов
 */
function load(call){
    Account.plugins((plugins)=>{
        let list = plugins.filter(plugin=>plugin.status).map(plugin=>plugin.url).concat(Storage.get('plugins','[]'))
        
        console.log('Plugins','list:', list)

        Utils.putScript(list,call)
    })
}

export default {
    init,
    load
}