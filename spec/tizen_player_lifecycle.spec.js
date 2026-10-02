import {afterEach, describe, expect, test, vi} from 'vitest'
import Tizen from '../src/interaction/player/video/tizen'
import {isRestoring} from '../src/interaction/player/video/tizen_lifecycle'
let finish, players=[]
afterEach(()=>{if(isRestoring()) finish();players.forEach(video=>video.destroy());players=[];vi.unstubAllGlobals()})
function setup(){
    let state='PLAYING', handlers=[], calls=[]
    const av={}
    for(const name of ['open','close','setListener','setDisplayRect','setDisplayMethod','setSilentSubtitle','seekTo','getTotalTrackInfo','getCurrentStreamInfo','setSpeed']){
        av[name]=vi.fn(()=>{calls.push(name);return []})
    }
    av.getState=vi.fn(()=>state)
    av.getCurrentTime=vi.fn(()=>123456)
    av.getDuration=vi.fn(()=>7200000)
    av.suspend=vi.fn(()=>{state='NONE'})
    av.restoreAsync=vi.fn((url,time,prepare,success)=>{
        if(typeof url !== 'string' || typeof time !== 'number') throw {name:'TypeMismatchError'}
        finish=()=>{state='PLAYING';success()}
    })
    av.play=vi.fn(()=>{state='PLAYING'})
    av.pause=vi.fn(()=>{state='PAUSED'})
    av.prepareAsync=vi.fn()
    vi.stubGlobal('webapis',{avplay:av})
    vi.stubGlobal('window',{innerWidth:1920,innerHeight:1080})
    vi.stubGlobal('document',{hidden:false,addEventListener:(type,fn)=>handlers.push(fn),removeEventListener:(type,fn)=>{handlers=handlers.filter(x=>x!==fn)}})
    vi.stubGlobal('$',()=>({0:{remove:vi.fn()},width:vi.fn(),height:vi.fn()}))
    function player(){let result;Tizen(video=>{result=video;players.push(video)});result.src='https://example.invalid/private-stream';return result}
    return {av,calls,player,hide(){document.hidden=true;handlers.slice().forEach(fn=>fn())},show(){document.hidden=false;handlers.slice().forEach(fn=>fn())}}
}
describe('Tizen wrapper during restore',()=>{
    test('uses cached getters and blocks AVPlay calls until restoration finishes',()=>{
        const s=setup(), video=s.player();s.hide();s.show()
        const stateReads=s.av.getState.mock.calls.length
        expect(video.currentTime).toBe(123.456)
        expect(video.duration).toBe(7200)
        expect(video.audioTracks).toEqual([])
        expect(video.textTracks).toEqual([])
        video.currentTime=10;video.size('cover');video.speed(2);video.pause()
        expect(video.paused).toBe(true)
        expect(s.av.seekTo).not.toHaveBeenCalled()
        expect(s.av.setSpeed).not.toHaveBeenCalled()
        expect(s.av.getState).toHaveBeenCalledTimes(stateReads)
        finish()
        expect(s.av.pause).toHaveBeenCalledTimes(1)
    })
    test('queues close and new player initialization until the old restore completes',()=>{
        const s=setup(), old=s.player();s.hide();s.show();old.destroy()
        s.av.open.mockClear()
        s.calls.length=0
        const next=s.player();next.load()
        expect(s.av.close).not.toHaveBeenCalled()
        expect(s.av.open).not.toHaveBeenCalled()
        expect(s.av.prepareAsync).not.toHaveBeenCalled()
        finish()
        expect(s.calls.indexOf('close')).toBeLessThan(s.calls.indexOf('open'))
        expect(s.av.open).toHaveBeenCalledTimes(1)
        expect(s.av.prepareAsync).toHaveBeenCalledTimes(1)
    })
})
