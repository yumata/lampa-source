import Storage from '../core/storage/storage'
import Permit from '../core/account/permit'
import Listener from '../core/account/listener'

function init(){
    Storage.listener.follow('change',(e)=>{
        if(!Permit.child) return

        if(e.name == 'source' && e.value !== 'cub'){
            Storage.set('source', 'cub', true)
        }

        if(e.name == 'account' || e.name == 'parental_control_personal'){
            Storage.add('parental_control_personal', 'account_profiles', true)
            Storage.add('parental_control_personal', 'settings', true)
        }
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account') toggleMenu()
    })

    Listener.follow('profile_check', toggleMenu)

    addStyle()

    toggleMenu()
}

function addStyle(){
    let not = ['main', 'movie', 'tv', 'cartoon', 'catalog', 'filter', 'anime', 'favorite', 'history', 'timetable', 'subscribes', 'settings', 'about', 'console', 'edit']
    let css = `
        body.hide-menu .menu__item:not([data-action="${not.join('"]):not([data-action="')}"]){
            display: none;
        }
    `

    let teg = document.createElement('style')
    teg.type = 'text/css'
    teg.appendChild(document.createTextNode(css))
    document.body.appendChild(teg)
}

function toggleMenu(){
    document.body.toggleClass('hide-menu', Boolean(Permit.child))
}


export default {
    init
}