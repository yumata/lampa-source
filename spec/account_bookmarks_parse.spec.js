import {expect, suite, test, beforeAll} from 'vitest'

// src/utils/worker/utils.js — код Web Worker: вешает onmessage и отвечает через postMessage
let answer

beforeAll(async ()=>{
    globalThis.postMessage = (data)=>{ answer = data }
    globalThis.onmessage   = null // в модуле строгий режим: присвоить можно только существующей глобальной

    await import('../src/utils/worker/utils.js')
})

function parse(rows){
    answer = null

    globalThis.onmessage({data: {type: 'account_bookmarks_parse', data: rows}})

    return answer
}

suite('Разбор дампа закладок', () => {
    test('обычные строки разбираются, порядок разворачивается', () => {
        let result = parse([
            {id: 1, card_id: '603', type: 'book', data: JSON.stringify({id: 603, title: 'Матрица', quality: 'hd', release_quality: 'webdl'})},
            {id: 2, card_id: '550', type: 'like', data: JSON.stringify({id: 550, title: 'Бойцовский клуб'})}
        ])

        expect(result.map(b=>b.id)).toEqual([2, 1])
        expect(result[1].data).toEqual({id: 603, title: 'Матрица'})
    })

    test('пустой data не обрывает разбор — карточка из card_id и card_title', () => {
        let result = parse([
            {id: 26, card_id: '920', type: 'book', data: '', card_title: 'Тачки', card_type: 'movie', card_poster: '/a.jpg'},
            {id: 27, card_id: '1399', type: 'history', data: '{битый', card_title: 'Игра престолов', card_type: 'tv'},
            {id: 28, card_id: '603', type: 'book', data: JSON.stringify({id: 603, title: 'Матрица'})}
        ])

        expect(result.length).toBe(3)
        expect(result.find(b=>b.id == 26).data).toEqual({id: 920, source: 'tmdb', poster_path: '/a.jpg', title: 'Тачки'})
        expect(result.find(b=>b.id == 27).data).toMatchObject({id: 1399, name: 'Игра престолов', original_name: 'Игра престолов'})
    })

    test('без card_id битая строка пропускается, остальные на месте', () => {
        let result = parse([
            {id: 30, type: 'book', data: ''},
            {id: 31, card_id: '603', type: 'book', data: JSON.stringify({id: 603, title: 'Матрица'})}
        ])

        expect(result.map(b=>b.id)).toEqual([31])
    })
})
