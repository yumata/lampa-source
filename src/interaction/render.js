import Template from './template'

import Head from '../components/head'
import Menu from '../components/menu'
import Settings from '../components/settings'
import Background from './background'
import Activity from './activity'
import Search from '../components/search'
import Noty from './noty'

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

    app.append(Noty.render())
}

export default {app}