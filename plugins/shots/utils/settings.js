let component = 'shots'
let icon = `<svg id="sprite-shots" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M253.266 512a19.166 19.166 0 0 1-19.168-19.168V330.607l-135.071-.049a19.164 19.164 0 0 1-16.832-28.32L241.06 10.013a19.167 19.167 0 0 1 36.005 9.154v162.534h135.902a19.167 19.167 0 0 1 16.815 28.363L270.078 502.03a19.173 19.173 0 0 1-16.812 9.97z" fill="white"></path>
</svg>`

function init(){
    Lampa.SettingsApi.addComponent({
        component,
        icon,
        name: Lampa.Lang.translate('Shots'),
    })

    Lampa.SettingsApi.addParam({
        component,
        param: {
            name: 'shots_in_player',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('shots_settings_in_player'),
        }
    })

    Lampa.SettingsApi.addParam({
        component,
        param: {
            name: 'shots_in_card',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('shots_settings_in_card'),
        }
    })
}

export default {
    init
}