import Subscribe from '../../../utils/subscribe'

export const lifecycleEvents = Subscribe()
let restoring = false
let deferred = []
export function isRestoring(){ return restoring }
export function whenRestored(call){
    if(restoring) deferred.push(call)
    else call()
}

// AVPlay forbids further calls until restoreAsync has invoked a callback.
export default function lifecycle(av, doc, onError, getUrl){
    let saved
    let disposed = false
    let phase = 'active'
    let settleTimer
    let settleDeadline
    let readyStarted = false
    function report(type, details = {}){
        lifecycleEvents.send('event', Object.assign({type}, details))
    }
    function release(){
        restoring = false
        const calls = deferred
        deferred = []
        calls.forEach(call=>call())
    }
    function fail(type, error){
        clearTimeout(settleTimer)
        phase = 'active'
        report(type, {error: error && error.name || 'Error'})
        saved = undefined
        if(!disposed) onError()
    }
    function settle(){
        if(disposed || phase !== 'resuming') return
        try {
            let state = av.getState()
            // On this TV the restore callback precedes completion of buffering.
            if(state !== 'PLAYING' && state !== 'PAUSED'){
                if(Date.now() >= settleDeadline) throw {name:'RestoreTimeoutError'}
                if(state === 'READY' && !readyStarted){
                    readyStarted = true
                    av.play()
                }
                settleTimer = setTimeout(settle, 100)
                return
            }
            if(saved.paused && state === 'PLAYING') av.pause()
            else if(!saved.paused && state === 'PAUSED') av.play()
            state = av.getState()
            report('restored', {state, positionMs: av.getCurrentTime(),
                beforeState: saved.state, beforePositionMs: saved.positionMs})
            phase = 'active'
            saved = undefined
            if(doc.hidden) hide()
        } catch(error){ fail('restore-error', error) }
    }
    function hide(){
        if(disposed || restoring || phase !== 'active') return
        try {
            const state = av.getState()
            if(state !== 'PLAYING' && state !== 'PAUSED') return
            if(typeof av.suspend !== 'function' || (typeof av.restoreAsync !== 'function' && typeof av.restore !== 'function')){
                report('suspend-unavailable')
                return
            }
            saved = {state, positionMs: av.getCurrentTime(), paused: state === 'PAUSED'}
            try { saved.durationMs = av.getDuration() } catch(error){ saved.durationMs = 0 }
            av.suspend()
            phase = 'suspended'
            report('suspended', {state: saved.state, positionMs: saved.positionMs})
        } catch(error){ fail('suspend-error', error) }
    }
    function show(){
        if(disposed || restoring || phase !== 'suspended') return
        phase = 'restoring'
        restoring = true
        report('restore-start', {state: saved.state, positionMs: saved.positionMs})
        let settled = false
        function success(){
            if(settled) return
            settled = true
            // This callback is the first point at which AVPlay calls are safe.
            if(disposed){ release(); return }
            phase = 'resuming'
            readyStarted = false
            settleDeadline = Date.now() + 15000
            try {
                report('restore-callback', {state: av.getState()})
            } catch(error){ fail('restore-error', error) }
            release()
            settle()
        }
        function failure(error){
            if(settled) return
            settled = true
            fail('restore-error', error)
            release()
        }
        try {
            // Some TV bindings reject null optional arguments with TypeMismatchError.
            // Keep the URL private and pass the captured position as an unsigned integer.
            const url = getUrl()
            if(typeof url !== 'string' || !url) throw {name:'InvalidValuesError'}
            let position = Math.max(0, Math.min(4294967295, Math.round(saved.positionMs)))
            if(saved.durationMs <= 0 && position === 0) position = 1
            if(typeof av.restoreAsync === 'function') av.restoreAsync(url, position, false, success, failure)
            else { av.restore(url, position, false); success() }
        } catch(error){ failure(error) }
    }
    function visibility(){ if(doc.hidden) hide(); else show() }
    doc.addEventListener('visibilitychange', visibility)
    return {
        blocked: ()=>restoring || phase === 'suspended' || phase === 'resuming',
        position: ()=>saved ? saved.positionMs / 1000 : 0,
        duration: ()=>saved ? saved.durationMs / 1000 : 0,
        paused: ()=>saved ? saved.paused : false,
        intent: paused=>{ if(saved) saved.paused = paused },
        visibility,
        destroy: ()=>{
            disposed = true
            clearTimeout(settleTimer)
            doc.removeEventListener('visibilitychange', visibility)
            saved = undefined
        }
    }
}
