import Storage from '../storage/storage'

let permit = {}

// Получить аккаунт
Object.defineProperty(permit, 'account', { 
    get: ()=> Storage.get('account', '{}')
})

// Получить профиль аккаунта
Object.defineProperty(permit, 'profile', { 
    get: ()=> permit.account.profile || {}
})

// Получить данные пользователя
Object.defineProperty(permit, 'user', { 
    get: ()=> Storage.get('account_user', '{}')
})

// Получить токен аккаунта
Object.defineProperty(permit, 'token', { 
    get: ()=> permit.account.token
})

// Пользователь залогинен и разрешено использование аккаунта
Object.defineProperty(permit, 'access', { 
    get: ()=> permit.token && window.lampa_settings.account_use
})

// Пользователь включил синхронизацию
Object.defineProperty(permit, 'use', { 
    get: ()=>  permit.access && Storage.field('account_use')
})

// Синхронизация включена и разрешено использование синхронизации
Object.defineProperty(permit, 'sync', { 
    get: ()=>  permit.use && window.lampa_settings.account_sync
})

// Детский профиль
Object.defineProperty(permit, 'child', { 
    get: ()=>  permit.access && permit.profile.child
})

// Детский профиль - маленький ребенок (до 14 лет)
Object.defineProperty(permit, 'child_small', { 
    get: ()=>  permit.child ? permit.profile.age <= 14 : false
})

export default permit