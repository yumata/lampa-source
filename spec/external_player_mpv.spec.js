import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import Module from 'module'

vi.mock('../src/core/storage/storage', () => ({default: {field: () => '/usr/bin/mpv'}}))
vi.mock('../src/interaction/noty', () => ({default: {show: vi.fn()}}))
vi.mock('../src/core/lang', () => ({default: {translate: (s) => s}}))
vi.mock('../src/interaction/timeline', () => ({default: {view: (hash, t) => t}}))

import ExternalPlayer from '../src/core/externalPlayer'

const originalLoad = Module._load
let spawned

// Подменяем require(): настоящий mpv не запускается, а Node-модули
// можно "убрать", как в Electron-оболочке lampa-desktop, где window.require
// отдаёт только fs.existsSync и child_process.spawn
function stubRequire(withNode) {
    Module._load = function (request, ...rest) {
        if (request === 'fs') return {existsSync: () => true}
        if (request === 'child_process') return {
            spawn: (cmd, args) => {
                spawned.push({cmd, args})
                return {on: () => {}}
            }
        }
        if (request === 'net') return withNode ? {connect: () => { throw new Error('no mpv') }} : undefined
        if (request === 'os' || request === 'path') return withNode ? originalLoad.call(this, request, ...rest) : undefined

        return originalLoad.call(this, request, ...rest)
    }
}

beforeEach(() => {
    spawned = []
    vi.useFakeTimers()
})

afterEach(() => {
    ExternalPlayer.stopTimecodePolling()
    Module._load = originalLoad
    vi.useRealTimers()
})

describe('ExternalPlayer mpv', () => {
    test('starts mpv without IPC when Node modules are unavailable', () => {
        stubRequire(false)

        const playlist = [{url: 'http://ts/1'}, {url: 'http://ts/2', timeline: {time: 30, percent: 10}}]
        const data = {timeline: {hash: 'h', time: 0, handler: vi.fn()}}

        expect(() => ExternalPlayer.openPlayer('http://ts/1', data, {type: 'mpv', playlist})).not.toThrow()
        expect(() => vi.advanceTimersByTime(3000)).not.toThrow()

        expect(spawned).toHaveLength(1)
        const args = spawned[0].args
        expect(args.some(a => a.startsWith('--input-ipc-server'))).toBe(false)
        expect(args).toContain('--playlist-start=0')
        expect(args).toContain('http://ts/1')
        expect(args).toContain('--start=30')
    })

    test('uses IPC when Node modules are available', () => {
        stubRequire(true)

        ExternalPlayer.openPlayer('http://ts/1', {}, {type: 'mpv'})

        expect(spawned[0].args.some(a => a.startsWith('--input-ipc-server='))).toBe(true)
    })
})
