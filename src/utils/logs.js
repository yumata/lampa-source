import Manifest from './manifest'
import Settings from '../components/settings/api'
import Noty from '../interaction/noty'
import Modal from '../interaction/modal'
import Controller from '../interaction/controller'
import Console from '../interaction/console'
import Lang from './lang'
import Utils from './math'

function init(){
    let loader
    let waite

    Settings.addParam({
        component: 'more',
        param: {
            name: 'export',
            type: 'button',
        },
        field: {
            name: Lang.translate('menu_console'),
            description: Lang.translate('settings_cub_backup_export'),
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
                    onBack: ()=>{
                        Modal.close()

                        Controller.toggle('settings_component')
                    }
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