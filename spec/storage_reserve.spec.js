import {beforeEach, expect, suite, test, vi} from 'vitest'

const cache = vi.hoisted(()=>({ rows: {}, fail: false }))

vi.mock('../src/interaction/settings/params', ()=>({ default: { field: ()=>{} } }))
vi.mock('../src/core/storage/workers', ()=>({ default: {} }))
vi.mock('../src/interaction/noty', ()=>({ default: { show: ()=>{} } }))
vi.mock('../src/core/lang', ()=>({ default: { translate: (a)=>a } }))
vi.mock('../src/core/socket', ()=>({ default: { listener: { follow: ()=>{} } } }))
vi.mock('../src/core/account/api', ()=>({ default: { load: ()=>Promise.resolve() } }))
vi.mock('../src/utils/cache', ()=>({
    default: {
        getData: ()=> cache.fail ? Promise.reject(new Error('closed')) : Promise.resolve(Object.keys(cache.rows).map(k=>cache.rows[k])),
        rewriteData: (table, key, value)=>{
            if(cache.fail) return Promise.reject(new Error('closed'))

            cache.rows[key] = value

            return Promise.resolve()
        },
        deleteData: (table, key)=>{
            delete cache.rows[key]

            return Promise.resolve()
        },
        clearTable: ()=>{
            cache.rows = {}

            return Promise.resolve()
        }
    }
}))

function quotaError(name = 'QuotaExceededError', code = 22){
    let e = new Error('quota')

    e.name = name
    e.code = code

    return e
}

// localStorage с ограничением по числу символов, как в браузере
function fakeLocalStorage(){
    let store = {
        limit: Infinity,
        error: quotaError(),
        getItem(key){
            return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null
        },
        setItem(key, value){
            let used = Object.keys(data).reduce((a, k)=> a + (k == key ? 0 : data[k].length), 0)

            if(used + String(value).length > store.limit) throw store.error

            data[key] = String(value)
        },
        removeItem(key){
            delete data[key]
        },
        clear(){
            data = {}
        }
    }

    let data = {}

    return new Proxy(store, {
        ownKeys: ()=> Object.keys(data),
        getOwnPropertyDescriptor: (t, key)=> Object.prototype.hasOwnProperty.call(data, key) ? {value: data[key], enumerable: true, configurable: true} : undefined
    })
}

let Storage
let local

// Модуль хранит состояние в замыкании: каждый импорт — как новый запуск приложения
async function start(load = true){
    vi.resetModules()

    Storage = (await import('../src/core/storage/storage')).default

    if(load) await new Promise(resolve=>Storage.task(resolve))
}

function flush(){
    return new Promise(resolve=>setTimeout(resolve))
}

// Запись, которая не влезает: значение уходит в резерв
async function overflow(name, value){
    local.limit = 0

    Storage.set(name, value)

    await flush()

    local.limit = Infinity
}

beforeEach(()=>{
    cache.rows = {}
    cache.fail = false

    local = fakeLocalStorage()

    vi.stubGlobal('window', {localStorage: local, location: {reload: ()=>{}}})
    vi.stubGlobal('localStorage', local)
    vi.spyOn(console, 'log').mockImplementation(()=>{})
})

suite('overflow', ()=>{
    test('value moves to the reserve and survives a restart', async ()=>{
        await start()

        local.setItem('name', 'old')

        await overflow('name', 'new')

        expect(local.getItem('name')).toBe(null)
        expect(cache.rows.name.value).toBe('new')

        await start()

        expect(Storage.get('name')).toBe('new')
    })

    test('old value is kept when the reserve cannot be written', async ()=>{
        await start()

        local.setItem('name', 'old')

        cache.fail = true

        await overflow('name', 'new')

        expect(local.getItem('name')).toBe('old')
    })

    test.each([
        ['QUOTA_EXCEEDED_ERR', 22],
        ['NS_ERROR_DOM_QUOTA_REACHED', 1014],
        ['Error', 22]
    ])('quota error %s (%i) is recognized', async (name, code)=>{
        await start()

        local.error = quotaError(name, code)

        await overflow('name', 'new')

        expect(cache.rows.name.value).toBe('new')
    })

    test('other errors do not touch the stored value', async ()=>{
        await start()

        local.setItem('name', 'old')
        local.error = quotaError('SecurityError', 18)

        await overflow('name', 'new')

        expect(local.getItem('name')).toBe('old')
        expect(cache.rows.name).toBe(undefined)
    })

    test('callerror is called on overflow', async ()=>{
        await start()

        let called = 0

        local.limit = 0

        Storage.set('name', 'new', false, ()=> called++)

        expect(called).toBe(1)
    })
})

suite('reserve stays up to date', ()=>{
    test('successful write removes the reserve entry', async ()=>{
        await start()
        await overflow('name', 'old')

        Storage.set('name', 'new')

        await flush()

        expect(cache.rows.name).toBe(undefined)

        local.removeItem('name')

        await start()

        expect(Storage.get('name', 'default')).toBe('default')
    })

    test('write that fits during a pending overflow is not removed', async ()=>{
        await start()

        local.limit = 0

        Storage.set('name', 'first')

        local.limit = Infinity

        Storage.set('name', 'second')

        await flush()

        expect(local.getItem('name')).toBe('second')
        expect(cache.rows.name).toBe(undefined)
    })

    test('stale entries are dropped on start', async ()=>{
        cache.rows.name = {key: 'name', value: 'stale'}

        local.setItem('name', 'fresh')

        await start()

        expect(Storage.get('name')).toBe('fresh')
        expect(cache.rows.name).toBe(undefined)
    })
})

suite('get', ()=>{
    test('default read before the reserve loads is not remembered', async ()=>{
        cache.rows.name = {key: 'name', value: 'saved'}

        await start(false)

        expect(Storage.get('name', 'default')).toBe('default')

        await new Promise(resolve=>Storage.task(resolve))

        expect(Storage.get('name', 'default')).toBe('saved')
    })

    test('change is sent for settings read before the reserve loads', async ()=>{
        cache.rows.name = {key: 'name', value: 'saved'}
        cache.rows.other = {key: 'other', value: 'unread'}

        await start(false)

        let changes = []

        Storage.listener.follow('change', (e)=> changes.push(e))

        Storage.get('name', 'default')
        Storage.get('missing', 'default')

        await new Promise(resolve=>Storage.task(resolve))

        expect(changes).toEqual([{name: 'name', value: 'saved'}])
    })

    test('default is remembered after the reserve loads', async ()=>{
        await start()

        let list = Storage.get('list', '[]')

        list.push(1)

        expect(Storage.get('list', '[]')).toBe(list)
    })

    test('false and 0 are not replaced by the default', async ()=>{
        await start()

        Storage.set('flag', false)
        Storage.set('count', 0)

        expect(Storage.get('flag', 'true')).toBe(false)
        expect(Storage.get('count', 5)).toBe(0)
    })

    test('false from the reserve is not replaced by the default', async ()=>{
        await start()
        await overflow('flag', false)
        await start()

        expect(Storage.get('flag', 'true')).toBe(false)
    })
})

suite('value', ()=>{
    test('reads the reserve', async ()=>{
        await start()
        await overflow('name', 'saved')
        await start()

        expect(Storage.value('name', 'default')).toBe('saved')
    })

    test('returns the default for an empty key', async ()=>{
        await start()

        expect(Storage.value('name', 'default')).toBe('default')
        expect(Storage.value('name')).toBe('')
    })

    test('reserved false reads as a string, like localStorage', async ()=>{
        await start()
        await overflow('flag', false)
        await start()

        expect(Storage.value('flag')).toBe('false')
    })
})

suite('keys and erase', ()=>{
    test('keys lists localStorage and the reserve without duplicates', async ()=>{
        await start()

        local.setItem('both', '1')

        await overflow('reserved', 'x')

        local.limit = 0

        Storage.set('both', '22')

        local.limit = Infinity

        expect(Storage.keys().sort()).toEqual(['both', 'reserved'])
    })

    test('erase removes the value everywhere', async ()=>{
        await start()
        await overflow('name', 'saved')

        Storage.erase('name')

        await flush()

        expect(Storage.get('name', 'default')).toBe('default')
        expect(Storage.value('name', 'default')).toBe('default')
        expect(Storage.keys()).toEqual([])
        expect(cache.rows.name).toBe(undefined)
    })
})

suite('clear', ()=>{
    function clear(full){
        vi.useFakeTimers()

        Storage.clear(full)

        vi.useRealTimers()
    }

    test('full clear does not bring values back', async ()=>{
        await start()
        await overflow('name', 'saved')

        clear(true)

        await flush()
        await start()

        expect(Storage.get('name', 'default')).toBe('default')
    })

    test('cache clear keeps reserved settings and removes reserved cache', async ()=>{
        await start()
        await overflow('setting', 'keep')
        await overflow('online_view', '["a"]')
        await overflow('file_view_1', '{"a":1}')

        clear(false)

        await flush()

        expect(cache.rows.setting.value).toBe('keep')
        expect(cache.rows.online_view).toBe(undefined)
        expect(cache.rows.file_view_1).toBe(undefined)
    })

    test('cache clear works when the storage is full', async ()=>{
        await start()

        local.setItem('online_big', 'x'.repeat(10))
        local.limit = 10

        expect(()=> clear(false)).not.toThrow()
        expect(local.getItem('online_big')).toBe('')
    })
})

suite('getsize', ()=>{
    test('does not keep the test key between measurements', async ()=>{
        await start()

        vi.useFakeTimers()

        Storage.getsize(()=>{})

        vi.advanceTimersByTime(250)

        expect(local.getItem('testsize')).toBe(null)

        local.limit = 0

        vi.advanceTimersByTime(100)

        vi.useRealTimers()

        expect(local.getItem('testsize')).toBe(null)
    })

    test('leftover test key is removed on start', async ()=>{
        local.setItem('testsize', 'aaaa')

        await start()

        expect(local.getItem('testsize')).toBe(null)
    })
})

suite('JSON.stringify error', ()=>{
    function circular(){
        let value = {}

        value.self = value

        return value
    }

    test('stored value is not overwritten', async ()=>{
        await start()

        Storage.set('name', {a: 1})
        Storage.set('name', circular())

        expect(local.getItem('name')).toBe('{"a":1}')

        await start()

        expect(Storage.get('name')).toEqual({a: 1})
    })

    test('reserve entry is not overwritten', async ()=>{
        await start()
        await overflow('name', 'saved')

        Storage.set('name', circular())

        await flush()

        expect(cache.rows.name.value).toBe('saved')
    })

    test('callerror and change are still called', async ()=>{
        await start()

        let errors  = 0
        let changes = 0

        Storage.listener.follow('change', ()=> changes++)

        Storage.set('name', circular(), false, ()=> errors++)
        Storage.set('name', circular(), true)

        expect(errors).toBe(1)
        expect(changes).toBe(1)
    })
})

suite('restore', ()=>{
    test('value that fits goes to localStorage and removes the reserve entry', async ()=>{
        await start()
        await overflow('name', 'old')

        expect(await Storage.restore('name', 'new')).toBe(true)

        await flush()

        expect(local.getItem('name')).toBe('new')
        expect(cache.rows.name).toBe(undefined)
    })

    test('value that does not fit goes to the reserve', async ()=>{
        await start()

        local.setItem('name', 'old')
        local.limit = 0

        expect(await Storage.restore('name', 'new')).toBe(true)

        local.limit = Infinity

        expect(local.getItem('name')).toBe(null)
        expect(cache.rows.name.value).toBe('new')
    })

    test('reports when the value could not be saved', async ()=>{
        await start()

        local.setItem('name', 'old')
        local.limit = 0

        cache.fail = true

        expect(await Storage.restore('name', 'new')).toBe(false)
        expect(local.getItem('name')).toBe('old')
    })

    test('other errors are reported as not saved', async ()=>{
        await start()

        local.limit = 0
        local.error = quotaError('SecurityError', 18)

        expect(await Storage.restore('name', 'new')).toBe(false)
        expect(cache.rows.name).toBe(undefined)
    })
})
