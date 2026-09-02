import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {describe, expect, test} from 'vitest'

const source = readFileSync(new URL('../src/interaction/torrent.js', import.meta.url), 'utf8')
const start = source.indexOf('const TORRENT_PRELOAD_POLL_MS')
const end = source.indexOf('function list(', start)

if(start < 0 || end < 0) throw new Error('torrent preload implementation not found')

const preloadSource = source.slice(start, end)

class FakeClock {
    constructor(){
        this.now = 0
        this.nextId = 1
        this.timers = new Map()
    }

    setTimeout(fn, delay){
        let id = this.nextId++
        this.timers.set(id, {at: this.now + Number(delay || 0), fn})
        return id
    }

    clearTimeout(id){
        this.timers.delete(id)
    }

    advance(ms){
        let target = this.now + ms

        while(true){
            let selectedId
            let selected

            for(let [id, timer] of this.timers){
                if(timer.at <= target && (!selected || timer.at < selected.at || timer.at === selected.at && id < selectedId)){
                    selectedId = id
                    selected = timer
                }
            }

            if(!selected) break

            this.timers.delete(selectedId)
            this.now = selected.at
            selected.fn()
        }

        this.now = target
    }
}

function harness({android = false, selectedPlayer = 'lampa', gstWork = true, respond} = {}){
    let clock = new FakeClock()
    let state = {
        requests: 0,
        requestObjects: 0,
        inFlight: 0,
        maxInFlight: 0,
        clears: 0,
        runs: 0,
        stops: 0,
        cancel: null
    }

    class RequestMock {
        constructor(){
            state.requestObjects++
        }

        timeout(ms){
            this.timeoutMs = ms
        }

        silent(url, success, error){
            let requestIndex = state.requests++
            state.inFlight++
            state.maxInFlight = Math.max(state.maxInFlight, state.inFlight)

            let result = respond ? respond(url, requestIndex) : {
                type: 'success',
                value: {preloaded_bytes: 95, preload_size: 100}
            }

            if(result.type === 'hang') return

            clock.setTimeout(()=>{
                state.inFlight--
                if(result.type === 'error') error(new Error('network'))
                else success(result.value)
            }, result.delay == null ? 5 : result.delay)
        }

        clear(){
            state.clears++
            state.inFlight = 0
        }
    }

    class FakeDate extends Date {
        static now(){
            return clock.now
        }
    }

    let context = {
        Date: FakeDate,
        Request: RequestMock,
        Platform: {is: name=>name === 'android' && android},
        Storage: {field: name=>name === 'player_torrent' ? selectedPlayer : undefined},
        Torserver: {
            ip: ()=>'http://ts',
            gstWork: ()=>gstWork
        },
        Loading: {
            start: cancel=>state.cancel = cancel,
            stop: ()=>state.stops++,
            setProgress: ()=>{}
        },
        Utils: {bytesToSize: value=>String(value)},
        setTimeout: clock.setTimeout.bind(clock),
        clearTimeout: clock.clearTimeout.bind(clock)
    }

    vm.runInNewContext(`${preloadSource}\nthis.__preload = preload`, context)

    let data = {
        url: 'http://ts/stream/file.mkv?index=1&preload',
        torrent_hash: 'hash'
    }

    context.__preload(data, ()=>state.runs++)

    return {clock, data, state}
}

describe('Torrent preload handoff', () => {
    test('dispatches an external Android torrent immediately through play', () => {
        let result = harness({android: true, selectedPlayer: 'android', gstWork: false})

        expect(result.state.runs).toBe(1)
        expect(result.state.requestObjects).toBe(0)
        expect(result.data.url).toContain('&play')
        expect(result.data.url).not.toContain('&preload')
    })

    test('completes at 95 percent without overlapping polls', () => {
        let result = harness({
            respond: (url, index)=>({
                type: 'success',
                value: {preloaded_bytes: index ? 95 : 10, preload_size: 100}
            })
        })

        result.clock.advance(1100)

        expect(result.state.runs).toBe(1)
        expect(result.state.requests).toBe(2)
        expect(result.state.maxInFlight).toBe(1)
    })

    test('falls back to play when progress stalls', () => {
        let result = harness({
            respond: ()=>({
                type: 'success',
                value: {preloaded_bytes: 0, preload_size: 100}
            })
        })

        result.clock.advance(9000)

        expect(result.state.runs).toBe(1)
        expect(result.state.maxInFlight).toBe(1)
        expect(result.data.url).toContain('&play')
    })

    test('falls back within the stall window after repeated request errors', () => {
        let result = harness({respond: ()=>({type: 'error'})})

        result.clock.advance(7000)
        expect(result.state.runs).toBe(0)

        result.clock.advance(2000)

        expect(result.state.runs).toBe(1)
        expect(result.state.maxInFlight).toBe(1)
        expect(result.data.url).toContain('&play')
    })

    test('uses the independent deadline when a request never calls back', () => {
        let result = harness({respond: ()=>({type: 'hang'})})

        result.clock.advance(29000)
        expect(result.state.runs).toBe(0)

        result.clock.advance(2000)

        expect(result.state.runs).toBe(1)
        expect(result.state.maxInFlight).toBe(1)
        expect(result.data.url).toContain('&play')
    })

    test('ignores a late response after the deadline dispatch', () => {
        let result = harness({
            respond: ()=>({
                type: 'success',
                value: {preloaded_bytes: 95, preload_size: 100},
                delay: 31000
            })
        })

        result.clock.advance(32000)

        expect(result.state.runs).toBe(1)
        expect(result.data.url).toContain('&play')
    })

    test('cancels without dispatching playback', () => {
        let result = harness({respond: ()=>({type: 'hang'})})

        result.state.cancel()
        result.clock.advance(31000)

        expect(result.state.runs).toBe(0)
        expect(result.state.stops).toBe(1)
    })
})
