import Favorites from './utils/favorites'
import Guide from './utils/guide'

function init(){
    Lampa.Params.trigger('iptv_guide_update_after_start', false)
    Lampa.Params.trigger('iptv_guide_custom', false)
    Lampa.Params.select('iptv_guide_url','','')
    Lampa.Params.select('iptv_guide_interval',{
        '1': '1',
        '2': '2',
        '3': '3',
        '5': '5',
        '8': '8',
        '12': '12',
        '18': '18',
        '24': '24 / 1',
        '48': '48 / 2',
        '72': '72 / 3',
        '96': '96 / 4',
        '120': '120 / 5',
        '144': '144 / 6',
        '168': '168 / 7',
    },'24')
    

    Lampa.Settings.listener.follow('open', function (e) {
        if(e.name == 'iptv'){
            if(!Lampa.Account.hasPremium()){
                let body = e.body.find('.scroll__body > div')

                let info = $(`<div class="settings-param selector" data-type="button" data-static="true">
                    <div class="settings-param__name">${Lampa.Lang.translate('account_premium_more')}</div>
                    <div class="settings-param__descr">${Lampa.Lang.translate('iptv_premium')}</div>
                </div>`)

                info.on('hover:enter',Lampa.Account.showCubPremium)

                body.prepend('<div class="settings-param-title"><span>'+Lampa.Lang.translate('title_settings')+'</span></div>')

                body.prepend(info)
            }
        }
        if(e.name == 'iptv_guide'){
            let status = e.body.find('.update-guide-status')
            let parser = window.iptv_guide_update_process
            let listen = ()=>{
                if(!parser) return

                parser.follow('start',()=>{
                    status.find('.settings-param__name').text(Lampa.Lang.translate('iptv_guide_status_update'))
                    status.find('.settings-param__value').text(Lampa.Lang.translate('iptv_guide_status_parsing') + ' 0%')
                })

                parser.follow('percent',(data)=>{
                    status.find('.settings-param__value').text(Lampa.Lang.translate('iptv_guide_status_parsing') + ' '+data.percent.toFixed(2)+'%')
                })

                parser.follow('finish',(data)=>{
                    status.find('.settings-param__name').text(Lampa.Lang.translate('iptv_guide_status_finish'))
                    status.find('.settings-param__value').text(Lampa.Lang.translate('iptv_guide_status_channels') + ' - ' + data.count + ', '+Lampa.Lang.translate('iptv_guide_status_date')+' - ' + Lampa.Utils.parseTime(data.time).briefly)
                })

                parser.follow('error',(data)=>{
                    status.find('.settings-param__name').text(Lampa.Lang.translate('title_error'))
                    status.find('.settings-param__value').text(data.text)
                })
            }

            e.body.find('.update-guide-now').on('hover:enter',()=>{
                if(window.iptv_guide_update_process) return Lampa.Noty.show(Lampa.Lang.translate('iptv_guide_status_update_wait'))

                Guide.update(status)

                parser = window.iptv_guide_update_process

                listen()
            })

            let last_status = Lampa.Storage.get('iptv_guide_updated_status','{}')

            if(last_status.type){
                if(last_status.type == 'error'){
                    status.find('.settings-param__name').text(Lampa.Lang.translate('title_error'))
                    status.find('.settings-param__value').text(last_status.text)
                }
                if(last_status.type == 'finish'){
                    status.find('.settings-param__value').text(Lampa.Lang.translate('iptv_guide_status_channels') + ' - ' + last_status.channels + ', '+Lampa.Lang.translate('iptv_guide_status_date')+' - ' + Lampa.Utils.parseTime(last_status.time).briefly)
                }
            }

            if(parser) listen()
        }
    })

    Lampa.SettingsApi.addComponent({
        component: 'iptv',
        icon: `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>
            <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
        name: 'IPTV'
    })

    if(Lampa.Manifest.app_digital >= 200){
        Lampa.SettingsApi.addParam({
            component: 'iptv',
            param: {
                type: 'button'
            },
            field: {
                name: Lampa.Lang.translate('iptv_param_guide'),
            },
            onChange: ()=>{
                Lampa.Settings.create('iptv_guide',{
                    onBack: ()=>{
                        Lampa.Settings.create('iptv')
                    }
                })
            }
        })
    }

    Lampa.SettingsApi.addParam({
        component: 'iptv',
        param: {
            type: 'title'
        },
        field: {
            name: Lampa.Lang.translate('more'),
        }
    })

    Lampa.SettingsApi.addParam({
        component: 'iptv',
        param: {
            name: 'iptv_use_db',
            type: 'select',
            values: {
                indexdb: 'IndexedDB',
                storage: 'LocalStorage',
            },
            default: 'indexdb'
        },
        field: {
            name: Lampa.Lang.translate('iptv_param_use_db'),
        },
        onChange: ()=>{
            Favorites.load().then(()=>{
                document.querySelectorAll('.iptv-playlist-item').forEach(element => {
                    Lampa.Utils.trigger(element, 'update')
                })
            })
        }
    })

    Lampa.SettingsApi.addParam({
        component: 'iptv',
        param: {
            name: 'iptv_favotite_save',
            type: 'select',
            values: {
                url: '#{iptv_param_save_favorite_url}',
                name: '#{iptv_param_save_favorite_name}',
            },
            default: 'url'
        },
        field: {
            name: Lampa.Lang.translate('iptv_param_save_favorite'),
        }
    })

    Lampa.SettingsApi.addParam({
        component: 'iptv',
        param: {
            name: 'iptv_favotite_sort',
            type: 'select',
            values: {
                add: '#{iptv_param_sort_add}',
                name: '#{iptv_param_sort_name}',
                view: '#{iptv_param_sort_view}'
            },
            default: 'add'
        },
        field: {
            name: Lampa.Lang.translate('iptv_param_sort_favorite'),
        },
        onRender: (item)=>{
            if(!Lampa.Account.hasPremium()){
                item.removeClass('selector')
                
                item.append(Lampa.Template.get('cub_iptv_param_lock'))
            }
        },
        onChange: ()=>{
            
        }
    })
}

export default {
    init
}