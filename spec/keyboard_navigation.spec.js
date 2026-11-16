import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import {describe, expect, test} from 'vitest'
import Navigation from '../src/interaction/keyboard/navigation'
import Subscribe from '../src/utils/subscribe'

function load(path, globals){
    let source = readFileSync(new URL('../src/' + path, import.meta.url), 'utf8')
        .replace(/^import .*$/gm, '').replace('export default ', 'globalThis.module = ')
    let context = vm.createContext({...globals})
    vm.runInContext(source, context)
    return context.module
}

// Навигации от клавиши нужен только getBoundingClientRect()
function key(name, left, width = 50){
    return {name, getBoundingClientRect: ()=>({left, right: left + width, width, height: 40})}
}

// Ряды из строк раскладки, как в layers.js. Клавиши делят ширину ряда поровну,
// поэтому ряды с разным числом клавиш сдвинуты друг относительно друга
function keyboard(lines, width = 1000, gap = 5){
    return lines.map(line=>{
        let names = line.split(' ')
        let size  = (width - gap * (names.length - 1)) / names.length

        return names.map((name, index)=>key(name, index * (size + gap), size))
    })
}

function move(rows, from, direction){
    return new Navigation().move(rows, from, direction)
}

// узкие клавиши над широкими
function digitsOverSpace(){
    return [
        [key('1', 0), key('2', 55), key('3', 110), key('4', 165)],
        [key('space', 0, 140), key('enter', 145, 70)]
    ]
}

describe('keyboard navigation', ()=>{
    test('does not skip a row whose keys overlap the current one by less than half', ()=>{
        // Navigator (straightOnly) в такой раскладке уходил из ряда 0 сразу в ряд 2
        let a  = key('a', 100)
        let b1 = key('b1', 70)
        let b2 = key('b2', 130)
        let c  = key('c', 100)
        let rows = [[a], [b1, b2], [c]]

        expect([b1, b2]).toContain(move(rows, a, 'down'))
        expect([b1, b2]).toContain(move(rows, c, 'up'))
    })

    test('goes to the key directly above or below', ()=>{
        let rows = keyboard(['q w e', 'a s d'])

        expect(move(rows, rows[0][2], 'down')).toBe(rows[1][2])
        expect(move(rows, rows[1][0], 'up')).toBe(rows[0][0])
    })

    test('prefers a wide key when the current one is over it', ()=>{
        // центр space дальше от клавиши, чем центр dot, но клавиша стоит над space
        let from = key('from', 330)
        let rows = [[from], [key('space', 0, 390), key('dot', 395)]]

        expect(move(rows, from, 'down')).toBe(rows[1][0])
    })

    test('goes to the last key of a shorter row', ()=>{
        let from = key('bksp', 300)
        let rows = [[key('q', 0), from], [key('a', 0), key('s', 55)]]

        expect(move(rows, from, 'down')).toBe(rows[1][1])
    })

    test('never lands on a hidden key', ()=>{
        let from = key('from', 0)
        let rows = [[from], [key('hidden', 0, 0), key('visible', 55)]]

        expect(move(rows, from, 'down')).toBe(rows[1][1])
    })

    test('returns null when there is nowhere to go', ()=>{
        let rows = keyboard(['q w e', 'a s d'])

        expect(move(rows, rows[0][1], 'up')).toBe(null)
        expect(move(rows, rows[1][1], 'down')).toBe(null)
        expect(move(rows, key('not on the keyboard', 0), 'down')).toBe(null)
        expect(move(rows, null, 'down')).toBe(null)
    })

    test('down and up returns to the starting key even when the key below is wider', ()=>{
        // без запомненной горизонтали «вверх» со space вело бы на его центр, то есть на клавишу 2
        let rows = digitsOverSpace()
        let navigation = new Navigation()

        expect(navigation.move(rows, rows[0][0], 'down')).toBe(rows[1][0])
        expect(navigation.move(rows, rows[1][0], 'up')).toBe(rows[0][0])
    })

    test('forgets the column once focus moves to another key', ()=>{
        let rows = digitsOverSpace()
        let navigation = new Navigation()

        navigation.move(rows, rows[0][0], 'down')

        // пользователь ушёл вправо на enter, горизонталь берётся уже от него
        expect(navigation.move(rows, rows[1][1], 'up')).toBe(rows[0][3])
    })
})

describe('keyboard navigation on staggered rows', ()=>{
    // как английская раскладка поиска: 12, 10 и 11 клавиш в ряду
    let rows = keyboard([
        '{MIC} q w e r t y u i o p {BKSP}',
        '{LANG} a s d f g h j k l',
        '{SIM} z x c v b n m . {SPACE}'
    ])
    // индекс ряда клавиши; -1, если идти было некуда (move вернул null)
    let rowOf = item=>rows.findIndex(row=>row.includes(item))

    test('every key leads to the adjacent row, or nowhere from the edge rows', ()=>{
        rows.forEach((row, index)=>{
            row.forEach(item=>{
                expect(rowOf(move(rows, item, 'up')), item.name + ' up').toBe(index - 1)
                expect(rowOf(move(rows, item, 'down')), item.name + ' down').toBe(index + 1 < rows.length ? index + 1 : -1)
            })
        })
    })

    test('walking to the edge row and back returns to the same key', ()=>{
        rows.flat().forEach(item=>{
            for(let [there, back] of [['down', 'up'], ['up', 'down']]){
                let navigation = new Navigation()
                let current = item
                let steps = 0
                let next

                while((next = navigation.move(rows, current, there))){
                    current = next
                    steps++
                }

                while(steps--) current = navigation.move(rows, current, back)

                expect(current, item.name + ' ' + there + ' and back').toBe(item)
            }
        })
    })
})

describe('keyboard controller', ()=>{
    // Фокус хранится в одном месте и меняется любым способом: Navigator.focus,
    // Navigator.move или Controller.collectionFocus. Тесты смотрят только на итог
    function harness(type){
        let rows = keyboard(['q w e', 'a s d', 'z x c'])
        let focus = rows[0][1]
        let controller
        let events = []

        // Navigator со старым поведением: вниз через ряд, вверх некуда
        let skip = {down: rows[2][1], up: false}
        let Navigator = {
            getFocusedElement: ()=>focus,
            focus: item=>{ focus = item },
            canmove: direction=>skip[direction],
            move: direction=>{ focus = skip[direction] || focus }
        }
        let Keyboard = load('interaction/keyboard/keyboard.js', {
            Navigator, Navigation, Subscribe,
            Controller: {add: (name, value)=>controller = value, toggle: ()=>{}, collectionFocus: Navigator.focus},
            Storage: {field: ()=>{}},
            Platform: {is: ()=>false, screen: ()=>false},
            window: {SimpleKeyboard: {}, innerHeight: 1080},
            $: ()=>({})
        })
        let instance = new Keyboard({keyboard: type})

        // ряды берутся из раскладки выше, а не из DOM
        instance._rows = ()=>rows

        instance.listener.follow('up', ()=>events.push('up'))
        instance.listener.follow('down', ()=>events.push('down'))
        instance.toggle()

        return {controller, rows, events, focused: ()=>focus, focus: item=>{ focus = item }}
    }

    test('lampa keyboard goes to the next row where Navigator would skip one', ()=>{
        let h = harness('lampa')

        h.controller.down()

        expect(h.focused()).toBe(h.rows[1][1])
        expect(h.events).toEqual([])
    })

    test('lampa keyboard hands focus over when there is no row in that direction', ()=>{
        let h = harness('lampa')

        h.controller.up()

        expect(h.focused()).toBe(h.rows[0][1])
        expect(h.events).toEqual(['up'])

        h.focus(h.rows[2][1])
        h.controller.down()

        expect(h.focused()).toBe(h.rows[2][1])
        expect(h.events).toEqual(['up', 'down'])
    })

    test('simple keyboard keeps Navigator navigation', ()=>{
        let h = harness('simple')

        h.controller.down()

        expect(h.focused()).toBe(h.rows[2][1])
        expect(h.events).toEqual([])

        h.controller.up()

        expect(h.events).toEqual(['up'])
    })
})
