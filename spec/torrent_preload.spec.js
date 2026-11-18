import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {describe, expect, test} from 'vitest'

const source = readFileSync(new URL('../src/interaction/torrent.js', import.meta.url), 'utf8')
const start = source.indexOf('function preload(')
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

function harness({url = 'http://ts/stream/file.mkv?index=1&preload', respond} = {}){
    let clock = new FakeClock()
    let state = {
        urls: [],
        progress: [],
        requestObjects: 0,
        inFlight: 0,
        maxInFlight: 0,
        clears: 0,
        runs: 0,
        starts: 0,
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
            let requestIndex = state.urls.push(url) - 1
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
        Torserver: {ip: ()=>'http://ts'},
        Loading: {
            start: cancel=>{
                state.starts++
                state.cancel = cancel
            },
            stop: ()=>state.stops++,
            setProgress: percent=>state.progress.push(percent)
        },
        Utils: {bytesToSize: value=>String(value)},
        createEta: ()=>({push: ()=>0}),
        preloadDetail: ()=>'',
        setTimeout: clock.setTimeout.bind(clock),
        clearTimeout: clock.clearTimeout.bind(clock)
    }

    vm.runInNewContext(`${preloadSource}\nthis.__preload = preload`, context)

    context.__preload({url}, ()=>state.runs++)

    return {clock, state}
}

function preloaded(bytes, size = 100){
    return {type: 'success', value: {preloaded_bytes: bytes, preload_size: size}}
}

describe('Torrent preload', () => {
    test('plays right away when the url is not a TorrServer preload', () => {
        for(let url of ['http://ts/stream/file.mkv?index=1&play', 'http://other/stream/file.mkv?index=1&preload']){
            let result = harness({url})

            expect(result.state.runs).toBe(1)
            expect(result.state.starts).toBe(0)
            expect(result.state.requestObjects).toBe(0)
        }
    })

    test('completes at 95 percent without overlapping polls', () => {
        let result = harness({respond: (url, index)=>preloaded(index ? 95 : 10)})

        expect(result.state.runs).toBe(0)
        expect(result.state.starts).toBe(1)

        result.clock.advance(1100)

        expect(result.state.runs).toBe(1)
        expect(result.state.stops).toBe(1)
        expect(result.state.urls).toHaveLength(2)
        expect(result.state.maxInFlight).toBe(1)
    })

    test('preloads with the first request and only asks for stats afterwards', () => {
        let result = harness({respond: (url, index)=>preloaded(index < 2 ? 10 : 95)})

        result.clock.advance(2200)

        expect(result.state.urls).toEqual([
            'http://ts/stream/file.mkv?index=1&preload',
            'http://ts/stream/file.mkv?index=1&stat',
            'http://ts/stream/file.mkv?index=1&stat'
        ])
    })

    test('reports progress while preloading', () => {
        let result = harness({respond: (url, index)=>preloaded([10, 50, 95][index])})

        result.clock.advance(2200)

        expect(result.state.progress).toEqual([10, 50])
        expect(result.state.runs).toBe(1)
    })

    test('plays when the server does not report the preload size', () => {
        let result = harness({respond: ()=>({type: 'success', value: {}})})

        result.clock.advance(10)

        expect(result.state.runs).toBe(1)
        expect(result.state.urls).toHaveLength(1)
    })

    test('keeps polling after a request error', () => {
        let result = harness({respond: (url, index)=>index ? preloaded(95) : {type: 'error'}})

        result.clock.advance(1100)

        expect(result.state.runs).toBe(1)
        expect(result.state.urls).toHaveLength(2)
        expect(result.state.maxInFlight).toBe(1)
    })

    test('stops polling when the download makes no progress', () => {
        let result = harness({respond: ()=>preloaded(0)})

        result.clock.advance(5000)

        expect(result.state.stops).toBe(0)

        result.clock.advance(55000)

        expect(result.state.stops).toBe(1)

        let requests = result.state.urls.length

        result.clock.advance(60000)

        expect(result.state.urls).toHaveLength(requests)
    })

    test('cancels without dispatching playback', () => {
        let result = harness({respond: ()=>({...preloaded(95), delay: 500})})

        result.state.cancel()
        result.clock.advance(31000)

        expect(result.state.runs).toBe(0)
        expect(result.state.stops).toBe(1)
        expect(result.state.clears).toBe(1)
        expect(result.state.urls).toHaveLength(1)
    })
})
