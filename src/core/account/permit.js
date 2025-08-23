import Storage from '../storage/storage'

let permit = {}

Object.defineProperty(permit, 'account', { 
    get: ()=> Storage.get('account', '{}')
})

Object.defineProperty(permit, 'token', { 
    get: ()=> permit.account.token
})

Object.defineProperty(permit, 'use', { 
    get: ()=>  permit.token && Storage.field('account_use') && window.lampa_settings.account_use
})

//working
Object.defineProperty(permit, 'sync', { 
    get: ()=>  permit.use && window.lampa_settings.account_sync
})

// function working(){
//     return Storage.get('account','{}').token && Storage.field('account_use') && window.lampa_settings.account_use && window.lampa_settings.account_sync
// }

// function canSync(logged_check){
//     return (logged_check ? logged() && window.lampa_settings.account_sync : working()) ? Storage.get('account','{}') : false
// }

// function workingAccount(){
//     return working() ? Storage.get('account','{}') : false
// }

export default permit