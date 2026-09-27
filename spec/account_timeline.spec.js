import {expect, test, vi} from 'vitest'

const socket = vi.hoisted(()=>({ listeners: {} }))

vi.mock('../src/core/account/api', ()=>({ default: { load: vi.fn(()=>Promise.resolve()) } }))
vi.mock('../src/core/account/permit', ()=>({ default: { sync: true } }))
vi.mock('../src/core/storage/storage', ()=>({ default: { listener: { follow: ()=>{} } } }))
vi.mock('../src/interaction/timeline', ()=>({ default: {} }))
vi.mock('../src/utils/utils', ()=>({ default: { onceInit: (fn)=>fn } }))
vi.mock('../src/utils/arrays', ()=>({ default: {} }))
vi.mock('../src/utils/worker', ()=>({ default: {} }))
vi.mock('../src/core/tracker', ()=>({ default: class { update(){} version(){ return 0 } time(){ return 0 } } }))
vi.mock('../src/core/socket', ()=>({
    default: { listener: { follow: (name, fn)=>{ socket.listeners[name] = fn } } }
}))

import Api from '../src/core/account/api'
import AccountTimeline from '../src/core/account/timeline'

// Экран серий и меню файла передают в Timeline.update объект из Timeline.view() вместе с его
// функцией handler. На сервер должны уйти только данные: jQuery.param вызывает найденные функции,
// и handler() без аргументов перезаписал бы прогресс с percent: undefined.
test('timeline is sent to the server as data only', ()=>{
    AccountTimeline.init()

    let called = 0

    socket.listeners.send({method: 'timeline', data: {params: {
        hash: 1608884677, percent: 95, time: 2498.5, duration: 2630, profile: 1, updated: 1,
        handler: ()=> called++
    }}})

    const sent = Api.load.mock.calls[0][2]

    expect(typeof sent.handler).toBe('undefined')
    expect(sent).toEqual({hash: 1608884677, percent: 95, time: 2498.5, duration: 2630, profile: 1, updated: 1})
    expect(called).toBe(0)
})
