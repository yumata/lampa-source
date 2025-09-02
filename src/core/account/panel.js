import Permit from './permit'
import Storage from '../storage/storage'
import Controller from '../controller'
import Select from '../../interaction/select'
import Lang from '../lang'
import Settings from '../../interaction/settings/settings'
import Bookmarks from './bookmarks'
import Profile from './profile'
import Backup from './backup'
import Utils from '../../utils/utils'
import Manifest from '../manifest'

function init(){
    Settings.listener.follow('open',(e)=>{
        if(e.name == 'account') render(e.body)
    })
}

function render(body){
    let account = Permit.account
    let signed  = Boolean(Permit.token)
    let premium = Utils.countDays(Date.now(), Permit.user.premium)

    if(!window.lampa_settings.account_sync){
        body.find('[data-name="account_use"]').remove()
    }

    Utils.qrcode('https://' + Manifest.cub_site, body.find('.ad-server__qr'))

    
    body.find('.settings--account-signin').toggleClass('hide',signed)
    body.find('.settings--account-user').toggleClass('hide',!signed)
    body.find('.settings-param__label').toggleClass('hide',!Boolean(premium))

    if(signed){
        body.find('.settings--account-user-info .settings-param__value').text(account.email)
        body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

        body.find('.settings--account-user-out').on('hover:enter',()=>{
            Storage.set('account','')
            Storage.set('account_user','')
            Storage.set('account_email','')

            Settings.update()

            Bookmarks.update()
        })

        body.find('.settings--account-user-sync').on('hover:enter',(e)=>{
            account = Permit.account

            Select.show({
                title: Lang.translate('settings_cub_sync'),
                items: [
                    {
                        title: Lang.translate('confirm'),
                        subtitle: Lang.translate('account_sync_to_profile') + ' ('+account.profile.name+')',
                        confirm: true
                    },
                    {
                        title: Lang.translate('cancel')
                    }
                ],
                onSelect: (a)=>{
                    if(a.confirm){
                        let loader = $('<div class="broadcast__scan" style="margin: 1em 0 0 0"><div></div></div>')

                        $(e.target).append(loader)

                        Bookmarks.sync(()=>{
                            loader.remove()
                        })
                    }

                    Controller.toggle('settings_component')
                },
                onBack: ()=>{
                    Controller.toggle('settings_component')
                }
            })
        })

        body.find('.settings--account-user-backup').on('hover:enter', (e)=>{
            let loader = $('<div class="broadcast__scan" style="margin: 1em 0 0 0"><div></div></div>')

            $(e.target).append(loader)

            Backup.select(()=>{
                loader.remove()

                Controller.toggle('settings_component')
            })
        })

        body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

        body.find('.settings--account-user-profile').on('hover:enter',()=>{
            Profile.select(()=>{
                Controller.toggle('settings_component')
            })
        })
    }
}

export default {
    init,
    render
}