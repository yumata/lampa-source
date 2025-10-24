import Settings from './settings/api'
import Lang from '../core/lang'
import Storage from '../core/storage/storage'
import Utils from '../utils/utils'
import StorageManager from './storage_manager'
import Controller from '../core/controller'
import Select from './select'
import Cache from '../utils/cache'
import Favorite from '../core/favorite'
import Noty from './noty'

let component = 'data'
let icon = `<svg width="37" height="38" viewBox="0 0 37 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.60156 1.565H25.6104L33.7051 10.4361C34.2934 11.0809 34.6191 11.9226 34.6191 12.7955V32.1959C34.6191 34.1289 33.0521 35.6959 31.1191 35.6959H5.60156C3.66857 35.6959 2.10156 34.1289 2.10156 32.1959V5.065C2.10156 3.13201 3.66856 1.565 5.60156 1.565Z" stroke="white" stroke-width="3"/>
    <rect x="10.7227" y="24.4752" width="15.2754" height="11.2209" rx="1.5" stroke="white" stroke-width="3"/>
</svg>`

function init(){
    Settings.addComponent({
        component: component,
        icon,
        name: Lang.translate('settings_rest_cache_all'),
        after: 'parental_control',
    })

    let status

    Settings.addParam({
        component,
        param: {
            type: 'button'
        },
        field: {
            name: Lampa.Lang.translate('settings_rest_cache_calculate'),
        },
        onRender: (item)=>{
            status = $(`<div class="settings-param__descr hide"></div>`)

            item.append(status)
        },
        onChange: (a,b)=>{
            status.removeClass('hide')

            Storage.getsize((size)=>{
                status.text(Lang.translate('title_left') + ' - ' + Utils.bytesToSize(size))
            })
        }
    })

    Settings.addParam({
        component,
        param: {
            type: 'title'
        },
        field: {
            name: Lampa.Lang.translate('more'),
        }
    })

    Settings.addParam({
        component,
        param: {
            type: 'button'
        },
        field: {
            name: Lampa.Lang.translate('extensions_edit'),
        },
        onChange: ()=>{
            StorageManager.open({
                onBack: ()=>{
                    Controller.toggle('settings_component')
                }
            })
        }
    })

    Settings.addParam({
        component,
        param: {
            type: 'button'
        },
        field: {
            name: Lampa.Lang.translate('fav_clear_title'),
        },
        onChange: ()=>{
            Favorite.clear('history')

            Noty.show(Lang.translate('torrent_error_made'))
        }
    })

    Settings.addParam({
        component,
        param: {
            type: 'button'
        },
        field: {
            name: Lampa.Lang.translate('settings_rest_cache'),
        },
        onChange: ()=>{
            Select.show({
                title: Lang.translate('settings_rest_cache'),
                items: [
                    {
                        title: Lang.translate('settings_rest_cache_only'),
                        subtitle: Lang.translate('settings_rest_cache_only_descr')
                    },
                    {
                        title: Lang.translate('settings_rest_cache_all'),
                        subtitle: Lang.translate('settings_rest_cache_all_descr'),
                        full: true
                    }
                ],
                onSelect: (a)=>{
                    Controller.toggle('settings_component')

                    Storage.clear(a.full)

                    Cache.clearAll()
                },
                onBack: ()=>{
                    Controller.toggle('settings_component')
                }
            })
        }
    })
}

export default {
    init
}