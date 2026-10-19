import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {describe, expect, test, vi} from 'vitest'

function load(path, globals){
    let source = readFileSync(new URL('../src/' + path, import.meta.url), 'utf8')
        .replace(/^import .*$/gm, '').replace('export default ', 'globalThis.module = ')
    let context = vm.createContext({...globals})
    vm.runInContext(source, context)
    return context.module
}

function harness(){
    let menus = [], activities = []
    let Activity = {all: ()=>activities, push: vi.fn()}
    let Controller = {toggle: vi.fn()}
    let Select = {show: options=>menus.push(options)}
    let Lang = {translate: key=>key}
    let menu = load('interaction/episode/menu.js', {Activity, Controller, Select, Lang})
    let card = {id: 12, source: 'tmdb', name: 'Series'}
    let episode = {data: {title: 'Episode', season_number: 1, timeline: {percent: 0}}, emit: vi.fn()}
    return {menu, menus, activities, Activity, Controller, Select, Lang, card, episode}
}

describe('season episode menu', ()=>{
    test('opening and cancelling preserves progress', ()=>{
        let h = harness()
        h.episode.data.timeline.percent = 42
        h.menu(h.episode, h.card)
        expect(h.menus[0].items.map(item=>item.title)).toEqual(['title_watch', 'episode_mark_unwatched'])
        h.menus[0].onBack()
        expect(h.episode.emit).not.toHaveBeenCalled()
        expect(h.Activity.push).not.toHaveBeenCalled()
        expect(h.episode.data.timeline.percent).toBe(42)
    })
    test('viewed invokes the existing mark action', ()=>{
        let h = harness()
        h.menu(h.episode, h.card)
        h.menus[0].onSelect(h.menus[0].items[1])
        expect(h.episode.emit).toHaveBeenCalledWith('mark')
        expect(h.Activity.push).not.toHaveBeenCalled()
    })
    test('watch reuses matching full card and passes season', ()=>{
        let h = harness(), emit = vi.fn()
        h.activities.push({component: 'full', card: h.card, activity: {component: {items: [{emit}]}}})
        h.activities.push({component: 'full', card: {...h.card, id: 99}, activity: {component: {items: [{emit: vi.fn()}]}}})
        h.episode.data.season_number = 3
        h.menu(h.episode, h.card)
        h.menus[0].onSelect(h.menus[0].items[0])
        expect(emit).toHaveBeenCalledWith('watch', expect.objectContaining({season: 3}))
        expect(h.episode.emit).not.toHaveBeenCalled()
        emit.mock.calls[0][1].onBack()
        expect(h.Controller.toggle).toHaveBeenLastCalledWith('content')
    })
    test('watch loads card when list was opened directly', ()=>{
        let h = harness()
        h.menu(h.episode, h.card)
        h.menus[0].onSelect(h.menus[0].items[0])
        expect(h.Activity.push).toHaveBeenCalledWith(expect.objectContaining({component: 'full', id: 12, episode_season: 1}))
    })
})

describe('torrent season search', ()=>{
    function search(context, lang = 'df'){
        let handler
        let Activity = {push: vi.fn()}
        let button = {toggleClass(){return this}, on(event, fn){handler = fn}}
        let Storage = {field: key=>key == 'parse_lang' ? lang : true}
        let module = load('components/full/start/torrents.js', {Activity, Storage, Lang: {translate: key=>key}, window: {lampa_settings: {torrents_use: true}}})
        let card = {title: 'Локальна назва', original_title: 'Original', first_air_date: '2020-02-03'}
        module.onCreate.call({html: {find: ()=>button}, card})
        handler({}, context)
        return {params: Activity.push.mock.calls[0][0], card}
    }
    test('adds S01 to configured query and alternate titles, preserves metadata', ()=>{
        let {params, card} = search({season: 1}, 'lg_df_year')
        expect(params.search).toBe('Локальна назва Original 2020 S01')
        expect(params.search_one).toBe('Локальна назва S01')
        expect(params.search_two).toBe('Original S01')
        expect(params.movie).toBe(card)
        expect(card.original_title).toBe('Original')
    })
    test.each([[0, 'S00'], [12, 'S12'], [100, 'S100']])('handles season %i', (season, suffix)=>{
        expect(search({season}).params.search).toBe('Original ' + suffix)
    })
    test('ordinary watch does not inherit season selection', ()=>{
        search({season: 2})
        expect(search(undefined).params.search).toBe('Original')
    })
})

describe('standard source menu', ()=>{
    test('keeps plugin sources, includes priority source, and forwards season only for this launch', ()=>{
        let h = harness(), torrent = {trigger: vi.fn()}, plugin = {trigger: vi.fn()}
        let entries = [torrent, plugin]
        let collection = {
            length: 2,
            not(){return this},
            filter(fn){expect(fn.call(torrent)).toBe(true); return this},
            each(fn){entries.forEach(entry=>fn.call(entry))}
        }
        let wrap = entry=>({
            ...entry,
            find: ()=>({prop: ()=>'<svg></svg>'}),
            text: ()=>entry === torrent ? 'Torrents' : 'Plugin',
            data: ()=>'', clone(){return this}, removeClass(){return this}, prop: ()=>'<button></button>'
        })
        let buttons = load('components/full/start/buttons.js', {
            Controller: h.Controller, Select: h.Select, Lang: h.Lang,
            Storage: {get: ()=> 'priority', set: vi.fn()}, Utils: {hash: ()=> 'priority'}, $: wrap
        })
        let owner = {html: {find: ()=>collection}, emit: vi.fn()}
        let context = {season: 1, onBack: vi.fn()}
        buttons.onWatch.call(owner, context)
        expect(h.menus[0].items).toHaveLength(2)
        h.menus[0].onSelect(h.menus[0].items[0])
        expect(torrent.trigger).toHaveBeenCalledWith('hover:enter', [context])
        h.menus[0].onBack()
        expect(context.onBack).toHaveBeenCalledOnce()
    })
})
