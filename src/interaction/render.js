import Template from './template'

import Head from './head'
import Menu from './menu'
import Settings from './settings'
import Background from './background'
import Activity from './activity'
import Search from './search_global'
import Birthday from './birthday'

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

    Birthday.start()
}

export default {app}