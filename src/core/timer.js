import Keypad from './keypad'

let timers = []
let paused = false

function init(){
    setInterval(()=>{
        if(paused) return

        let now = Date.now()

        timers.forEach(t => {
            if(paused && !t.background) return

            if (now - t.last >= t.interval) {
                t.last = now

                try {
                    t.call()
                }
                catch (e) {
                    console.error('Timer', 'call error:', e)
                }
            }
        })
    }, 1000)

    document.addEventListener('visibilitychange', () => {
        paused = document.visibilityState !== 'visible'

        console.log('Timer', 'visibility change:', document.visibilityState, 'paused:', paused)

        update()
    })

    // Разблокировка по клику или нажатию клавиши

    document.addEventListener('click', unpaused)

    Keypad.listener.follow('keydown', unpaused)
}

/**
 * Добавить таймер
 * @param {integer} interval - интервал в миллисекундах
 * @param {boolean} immediate - если true, то таймер будет вызван сразу при добавлении
 * @param {boolean} background - если true, то таймер будет работать в фоне, даже если вкладка не активна
 * @param {function} call - функция для вызова
 * @returns {void}
 */
function add(interval, call, immediate = false, background = false){
    timers.push({
        interval, 
        call, 
        last: Date.now(), 
        immediate,
        background
    })
}

/**
 * Обновить таймеры
 * @returns {void}
 */
function update(){
    // Обновить метки времени, чтобы таймеры не "догоняли"
    timers.forEach(t => t.last = Date.now())

    // Вызвать отложенные таймеры
    if(!paused) timers.forEach(t => t.immediate && t.call())
}

/**
 * Разблокировать таймеры
 * @returns {void}
 */
function unpaused(){
    if(paused){
        paused = false

        console.log('Timer', 'unpaused by action')

        update()
    }
}

/**
 * Удалить таймер
 * @param {function} call - функция для вызова
 * @returns {void}
 */
function remove(call){
    timers = timers.filter(t => t.call !== call)
}

export default {
    init,
    add,
    remove,
    update
}