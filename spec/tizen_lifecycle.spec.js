import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import Lifecycle, {isRestoring, lifecycleEvents, whenRestored} from '../src/interaction/player/video/tizen_lifecycle'

let cleanups = []
beforeEach(()=>vi.useFakeTimers())
afterEach(()=>{ cleanups.forEach(cleanup=>cleanup()); cleanups=[];vi.clearAllTimers();vi.useRealTimers() })
function setup(initial='PAUSED'){
    let state = initial, handler, success, failure
    const doc = {hidden:false, addEventListener:vi.fn((name, fn)=>{handler=fn}), removeEventListener:vi.fn()}
    const av = {
        getState:vi.fn(()=>state), getCurrentTime:vi.fn(()=>120000), getDuration:vi.fn(()=>7200000),
        suspend:vi.fn(()=>{state='NONE'}), restoreAsync:vi.fn((url, time, prepare, ok, error)=>{
            if(typeof url !== 'string' || typeof time !== 'number' || time % 1 !== 0) throw {name:'TypeMismatchError'}
            success=ok;failure=error
        }),
        pause:vi.fn(()=>{state='PAUSED'}), play:vi.fn(()=>{state='PLAYING'}), close:vi.fn()
    }
    const events=[], error=vi.fn(), callback=e=>events.push(e)
    lifecycleEvents.follow('event', callback)
    const lifecycle=Lifecycle(av,doc,error,()=> 'https://example.invalid/private-stream')
    cleanups.push(()=>{if(isRestoring() && failure) failure({name:'Cleanup'}); lifecycle.destroy(); lifecycleEvents.remove('event',callback)})
    return {av,doc,lifecycle,events,error,
        setState(value){state=value},
        hide(){doc.hidden=true;handler()}, show(){doc.hidden=false;handler()},
        finish(restored=initial){state=restored;success()}, fail(){failure({name:'SecurityError',message:'private URL'})}}
}
describe('Tizen playback lifecycle',()=>{
    test('waits for playback when success callback arrives in READY, then retains pause',()=>{
        const s=setup();s.av.play.mockImplementation(()=>{});s.hide();s.show();s.finish('READY')
        expect(isRestoring()).toBe(false)
        expect(s.lifecycle.blocked()).toBe(true)
        expect(s.error).not.toHaveBeenCalled()
        expect(s.av.pause).not.toHaveBeenCalled()
        expect(s.events.at(-1)).toEqual({type:'restore-callback',state:'READY'})
        vi.advanceTimersByTime(1100)
        expect(s.av.play).toHaveBeenCalledTimes(1)
        expect(s.error).not.toHaveBeenCalled()
        s.setState('PLAYING');vi.advanceTimersByTime(100)
        expect(s.av.pause).toHaveBeenCalledTimes(1)
        expect(s.events.at(-1).type).toBe('restored')
        expect(s.events.at(-1).state).toBe('PAUSED')
        expect(s.lifecycle.blocked()).toBe(false)
    })
    test('stops polling a player closed while buffering after restore',()=>{
        const s=setup();s.hide();s.show();s.finish('READY');s.lifecycle.destroy()
        const reads=s.av.getState.mock.calls.length
        vi.advanceTimersByTime(20000)
        expect(s.av.getState).toHaveBeenCalledTimes(reads)
        expect(s.error).not.toHaveBeenCalled()
    })
    test('reports a timeout if restoration never reaches playback',()=>{
        const s=setup();s.av.play.mockImplementation(()=>{});s.hide();s.show();s.finish('READY');vi.advanceTimersByTime(15000)
        expect(s.events.at(-1)).toEqual({type:'restore-error',error:'RestoreTimeoutError'})
        expect(s.error).toHaveBeenCalledTimes(1)
        expect(s.lifecycle.blocked()).toBe(false)
    })
    test.each(['PLAYING','PAUSED'])('restores %s at saved position without forcing playback', state=>{
        const s=setup(state)
        s.hide(); s.hide()
        expect(s.av.suspend).toHaveBeenCalledTimes(1)
        expect(s.lifecycle.position()).toBe(120)
        expect(s.lifecycle.duration()).toBe(7200)
        s.show(); s.show()
        expect(s.av.restoreAsync).toHaveBeenCalledTimes(1)
        expect(s.av.restoreAsync.mock.calls[0].slice(0,3)).toEqual(['https://example.invalid/private-stream',120000,false])
        expect(isRestoring()).toBe(true)
        s.finish()
        expect(isRestoring()).toBe(false)
        expect(s.av.play).not.toHaveBeenCalled()
        expect(s.events.at(-1)).toEqual({type:'restored',state,positionMs:120000,beforeState:state,beforePositionMs:120000})
        expect(JSON.stringify(s.events)).not.toContain('private-stream')
    })
    test('corrects an unexpectedly playing restoration to retain pause',()=>{
        const s=setup();s.hide();s.show();s.finish('PLAYING')
        expect(s.av.pause).toHaveBeenCalledTimes(1)
        expect(s.events.at(-1).state).toBe('PAUSED')
    })
    test('retains a pause requested while restoration is pending',()=>{
        const s=setup('PLAYING');s.hide();s.show();s.lifecycle.intent(true);s.finish('PLAYING')
        expect(s.av.pause).toHaveBeenCalledTimes(1)
    })
    test('suspends again if hidden while restoration is pending',()=>{
        const s=setup('PLAYING');s.hide();s.show();s.hide()
        expect(s.av.suspend).toHaveBeenCalledTimes(1)
        s.finish()
        expect(s.av.suspend).toHaveBeenCalledTimes(2)
        expect(s.events.at(-1).type).toBe('suspended')
    })
    test('defers close until callback and never resumes disposed players',()=>{
        const s=setup();s.hide();s.show();s.lifecycle.destroy();whenRestored(()=>s.av.close())
        expect(s.av.close).not.toHaveBeenCalled()
        s.finish('PLAYING')
        expect(s.av.close).toHaveBeenCalledTimes(1)
        expect(s.av.pause).not.toHaveBeenCalled()
        expect(s.av.play).not.toHaveBeenCalled()
        expect(s.doc.removeEventListener).toHaveBeenCalled()
    })
    test('reports callback and synchronous failures without raw error text',()=>{
        const s=setup();s.hide();s.show();s.fail()
        expect(s.error).toHaveBeenCalledTimes(1)
        expect(isRestoring()).toBe(false)
        expect(s.events.at(-1)).toEqual({type:'restore-error',error:'SecurityError'})
        const other=setup();other.av.suspend.mockImplementation(()=>{throw {name:'NotSupportedError'}})
        other.hide();other.show()
        expect(other.av.restoreAsync).not.toHaveBeenCalled()
        expect(other.events.at(-1).type).toBe('suspend-error')
    })
    test('leaves idle players and unsupported APIs alone',()=>{
        const s=setup('NONE');s.hide();s.show();expect(s.av.suspend).not.toHaveBeenCalled()
        const other=setup();other.av.restoreAsync=undefined;other.hide()
        expect(other.av.suspend).not.toHaveBeenCalled()
    })
    test('supports older TVs with synchronous restore',()=>{
        const s=setup();s.av.restoreAsync=undefined;s.av.restore=vi.fn(()=>s.setState('PAUSED'));s.hide();s.show()
        expect(s.av.restore).toHaveBeenCalledTimes(1)
        expect(isRestoring()).toBe(false)
    })
})
