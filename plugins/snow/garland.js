let lamps  = []
let colors = ['red', 'blue', 'yellow', 'green']

function resetLamps() {
    lamps.forEach(l => {
        l.opacity = 0.2
    })
}

let mode        = 0
let timer       = null
let snakeHead   = 0
let snakeLength = 5
let colorIndex  = 0

function startMode(newMode) {
    mode = newMode

    clearInterval(timer)

    if (mode === 0)
        timer = setInterval(treeMode, 120)

    if (mode === 1)
        timer = setInterval(colorCycle, 700)

    if (mode === 2)
        timer = setInterval(snake, 100)
}

function snake() {
    resetLamps()

    for (let i = 0; i < snakeLength; i++) {
        const index = (snakeHead - i + lamps.length) % lamps.length
        lamps[index].opacity = 1 - i / snakeLength
    }

    snakeHead = (snakeHead + 1) % lamps.length
}

function colorCycle() {
    const activeColor = colors[colorIndex]

    lamps.forEach(lamp => {
        lamp.opacity = lamp.color === activeColor ? 1 : 0.2
    })

    colorIndex = (colorIndex + 1) % colors.length
}

function treeMode() {
    lamps.forEach(lamp => {

        // случайный старт вспышки
        if (lamp.state === 'idle' && Math.random() < 0.02) {
            lamp.state = 'up'
            lamp.speed = Math.random() * 0.15 + 0.08
        }

        // рост яркости
        if (lamp.state === 'up') {
            lamp.opacity += lamp.speed

            if (lamp.opacity >= 1) {
                lamp.opacity = 1
                lamp.state = 'down'
            }
        }

        // затухание
        if (lamp.state === 'down') {
            lamp.opacity -= 0.05

            if (lamp.opacity <= 0.2) {
                lamp.opacity = 0.2
                lamp.state = 'idle'
            }
        }
    })
}

function run(garland){
    lamps = garland.find('.lamp').toArray().map(el => {
        return {
            element: el,
            get color() {
                return el.attributes['data-color'].value
            },
            set color(value) {
                el.setAttribute('data-color', value)
            },
            get opacity() {
                return parseFloat(el.style.opacity) || 0
            },
            set opacity(value) {
                el.style.opacity = value
            },
            speed: 0, 
            state: 'down'
        }
    })

    startMode(0)

    setInterval(() => {
        startMode((mode + 1) % 3)
    }, 60000)
}

export default {
    run
}