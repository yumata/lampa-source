import Storage from '../storage/storage'

let permit = {}

Object.defineProperty(permit, 'account', { 
    get: ()=> Storage.get('account','{}')
})

Object.defineProperty(permit, 'token', { 
    get: ()=> permit.account.token
})

Object.defineProperty(permit, 'use', { 
    get: ()=>  permit.token && Storage.field('account_use') && window.lampa_settings.account_use
})

Object.defineProperty(permit, 'sync', { 
    get: ()=>  permit.use && window.lampa_settings.account_sync
})

export default permit