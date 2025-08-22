import Template from './template'

import Head from './head/head'
import Menu from './menu'
import Settings from './settings/settings'
import Background from './background'
import Activity from './activity/activity'
import Search from './search/global'

/**
 * Инициализирует основное приложение
 * @returns {void}
 */
function app(){
    let app  = $('#app').empty()
    let wrap = Template.get('wrap')

    wrap.find('.wrap__left').append(Menu.render())
    wrap.find('.wrap__content').append(Activity.render())

    app.append(Background.render())

    app.append(Head.render())

    app.append(wrap)

    app.append(Settings.render())

    app.append(Search.render())
}

export default {app}