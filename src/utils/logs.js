import Manifest from './manifest'
import Settings from '../components/settings/api'
import Noty from '../interaction/noty'
import Modal from '../interaction/modal'
import Controller from '../interaction/controller'
import Console from '../interaction/console'
import Lang from './lang'
import Utils from './math'
import Storage from './storage'
import Socket from './socket'

function init(){
    let loader
    let waite

    Settings.addParam({
        component: 'more',
        param: {
            type: 'title'
        },
        field: {
            name: Lampa.Lang.translate('menu_console'),
        }
    })

    Settings.addParam({
        component: 'more',
        param: {
            name: 'export',
            type: 'button',
        },
        field: {
            name: Lang.translate('settings_cub_backup_export'),
        },
        onChange: () => {
            if(waite) return

            waite = true

            loader.removeClass('hide')

            push().then((code)=>{
                Modal.open({
                    title: '',
                    html: $('<div class="about"><div>'+Lang.translate('account_export_secuses')+': <span class="extensions__item-code">'+code+'</span></div></div>'),
                    size: 'small',
                    onBack: closeModal
                })
            }).catch((code)=>{
                Noty.show(Lang.translate('account_export_fail' + (code && typeof code == 'number' ? '_' + code : '')))
            }).finally(()=>{
                waite = false

                loader.addClass('hide')
            })
        },
        onRender: (item)=>{
            loader = $('<div class="broadcast__scan hide" style="margin: 1em 0 0 0"><div></div></div>')

            item.append(loader)
        }
    })

    let terminal_elem
    let terminal_code = Storage.get('terminal_access', '')

    function terminalDrawCode() {
        if(!terminal_elem) return

        terminal_code = Storage.get('terminal_access', '')

        terminal_elem.find('.settings-param__descr').text(terminal_code ? Lang.translate('terminal_code') + ': ' + terminal_code : Lang.translate('terminal_no_access'))
    }

    function terminalWriteCode(code) {
        Storage.set('terminal_access', code)

        terminalDrawCode()

        Socket.send('terminal',{})
    }

    Settings.addParam({
        component: 'more',
        param: {
            name: 'terminal',
            type: 'button',
        },
        field: {
            name: Lang.translate('terminal_title'),
            description: Lang.translate('terminal_no_access'),
        },
        onChange: (a,b,c) => {
            Modal.open({
                title: '',
                html: $('<div class="about"><div>'+Lang.translate('terminal_text')+'</div></div>'),
                size: 'medium',
                buttons: [
                    {
                        name: Lang.translate(terminal_code ? 'terminal_update' : 'terminal_confirm'),
                        onSelect: () => {
                            closeModal()

                            terminalWriteCode(Math.floor(100000 + Math.random() * 900000).toString())
                        }
                    },
                    {
                        name: Lang.translate('terminal_deny'),
                        onSelect: () => {
                            closeModal()

                            terminalWriteCode('')
                        }
                    }
                ],
                onBack: closeModal
            })
        },
        onRender: (item)=>{
            terminal_elem = item

            terminalDrawCode()
        }
    })
}

function closeModal(){
    Modal.close()

    Controller.toggle('settings_component')
}

function push(){
    return new Promise((resolve, reject)=>{
        let file
        let data = JSON.stringify(Console.export())

        try{
            file = new File([data], "lampa_logs.json", {
                type: "text/plain",
            })
        }
        catch(e){}

        if(!file){
            try{
                file = new Blob([data], {type: 'text/plain'})
                file.lastModifiedDate = new Date()
            }
            catch(e){
                reject()
            }
        }

        if(file){
            let formData = new FormData($('<form></form>')[0])
                formData.append("file", file, "lampa_logs.json")

            
            $.ajax({
                url: Utils.protocol() + Manifest.cub_domain + '/api/lampa/logs/write',
                type: 'POST',
                data: formData,
                async: true,
                cache: false,
                timeout: 10000,
                contentType: false,
                enctype: 'multipart/form-data',
                processData: false,
                success: function (j) {
                    resolve(j.code)
                },
                error: function(e){
                    reject(e.rresponseJSON ? e.responseJSON.code : 0)
                }
            })
        }
    })
}

export default {
    init
}