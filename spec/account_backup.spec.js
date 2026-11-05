import {beforeEach, expect, test, vi} from 'vitest'

const state = vi.hoisted(()=>({ stored: {}, restored: [], outcome: ()=>true, notes: [], imported: {} }))

vi.mock('../src/core/account/permit', ()=>({ default: { access: true, token: 'token' } }))
vi.mock('../src/core/account/api', ()=>({ default: { url: ()=>'', load: ()=>Promise.resolve({data: state.imported}) } }))
vi.mock('../src/core/account/modal', ()=>({ default: { limited: ()=>{} } }))
vi.mock('../src/core/lang', ()=>({ default: { translate: (a)=>a } }))
vi.mock('../src/interaction/noty', ()=>({ default: { show: (text)=> state.notes.push(text) } }))
vi.mock('../src/interaction/select', ()=>({ default: { show: (params)=> params.onSelect(params.items[0]) } }))
vi.mock('../src/core/storage/storage', ()=>({
    default: {
        keys: ()=> Object.keys(state.stored),
        value: (key)=> state.stored[key],
        restore: (key, value)=>{
            state.restored.push([key, value])

            return Promise.resolve(state.outcome(key))
        }
    }
}))

import Backup from '../src/core/account/backup'

let ajax

function flush(){
    return new Promise(resolve=>setTimeout(resolve))
}

beforeEach(()=>{
    state.stored   = {}
    state.restored = []
    state.notes    = []
    state.imported = {}
    state.outcome  = ()=>true

    ajax = vi.fn()

    let jquery = ()=> [undefined]

    jquery.ajax = ajax

    vi.stubGlobal('$', jquery)
    vi.stubGlobal('window', {location: {reload: ()=>{}}})
})

test('export includes every stored value, without app.js', async ()=>{
    state.stored = {setting: 'in-local', big: '{"from":"reserve"}', 'app.js': 'code'}

    Backup.publish()

    let file = ajax.mock.calls[0][0].data.get('file')

    expect(JSON.parse(await file.text())).toEqual({setting: 'in-local', big: '{"from":"reserve"}'})
})

test('import restores every value and reports the real result', async ()=>{
    state.imported = {one: '1', two: '2', three: '3'}
    state.outcome  = (key)=> key != 'two'

    vi.useFakeTimers({toFake: ['setTimeout']})

    Backup.inject()

    vi.useRealTimers()

    await flush()

    expect(state.restored).toEqual([['one', '1'], ['two', '2'], ['three', '3']])
    expect(state.notes[0]).toContain('(2/1)')
})
