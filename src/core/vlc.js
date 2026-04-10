import Storage from '../core/storage/storage'
import Noty from '../interaction/noty'
import Lang from './lang'

// Константы
const POLLING_INTERVAL_MS = 5000
const DEFAULT_VLC_PORT = 3999
const DEFAULT_VLC_PASSWORD = '123456'
const MAX_FAILED_ATTEMPTS = 3

// Состояние
let vlcCallbacks = {}
let pollingInterval = null
let lastSuccessfulTimecode = null
let currentVLCProcess = null
let currentHash = null
let failedAttempts = 0

/**
 * Получение URL VLC API
 */
function getVLCURL(port) {
    return `http://localhost:${port}/requests/status.json`
}

/**
 * Сохранение таймкода при закрытии плеера
 */
function saveTimecodeOnVLCClose(hash) {
    if (lastSuccessfulTimecode && hash && vlcCallbacks[hash]) {
        console.log('VLC', 'Процесс закрылся, сохраняем последний timecode:', lastSuccessfulTimecode)
        vlcCallbacks[hash](
            lastSuccessfulTimecode.percent,
            lastSuccessfulTimecode.currentTime,
            lastSuccessfulTimecode.duration
        )

        // Очищаем всё после сохранения
        stopTimecodePolling()
        delete vlcCallbacks[hash]
        currentVLCProcess = null
        currentHash = null
    } else if (hash && vlcCallbacks[hash]) {
        // Если не было ни одного успешного запроса, но процесс закрылся
        console.log('VLC', 'Процесс закрылся, но timecode не был получен')
        stopTimecodePolling()
        delete vlcCallbacks[hash]
        currentVLCProcess = null
        currentHash = null
    }
}

/**
 * Получение и сохранение статуса из VLC
 */
function fetchAndSaveTimecode(port, password, hash) {
    const headers = {
        'Authorization': `Basic ${btoa(':' + password)}`
    }

    return fetch(getVLCURL(port), {headers})
        .then(response => {
            if (!response.ok) {
                throw new Error('VLC API вернул ошибку')
            }
            return response.json()
        })
        .then(status => {
            // Успешный запрос - сбрасываем счетчик ошибок
            failedAttempts = 0

            if (status.time && status.length) {
                const currentTime = status.time / 1000 // мс → сек
                const duration = status.length / 1000   // мс → сек
                const percent = Math.round((currentTime / duration) * 100)

                lastSuccessfulTimecode = {percent, currentTime, duration}
                // console.log('VLC', 'Timecode обновлен:', lastSuccessfulTimecode)
            }
        })
        .catch(error => {
            console.error('VLC', 'Ошибка получения timecode из VLC:', error)
            failedAttempts++
            console.log('VLC', `Неудачных попыток: ${failedAttempts}/${MAX_FAILED_ATTEMPTS}`)

            // Если превысили лимит неудачных попыток и процесс VLC уже закрыт
            if (failedAttempts >= MAX_FAILED_ATTEMPTS && !currentVLCProcess) {
                console.log('VLC', 'Превышен лимит неудачных попыток, останавливаем polling')

                // Сохраняем последний известный timecode, если он есть
                if (lastSuccessfulTimecode && vlcCallbacks[hash]) {
                    console.log('VLC', 'Сохраняем последний timecode перед остановкой')
                    vlcCallbacks[hash](
                        lastSuccessfulTimecode.percent,
                        lastSuccessfulTimecode.currentTime,
                        lastSuccessfulTimecode.duration
                    )
                }

                stopTimecodePolling()
                delete vlcCallbacks[hash]
                currentHash = null
            }

            throw error
        })
}

/**
 * Запуск периодического опроса timecode из VLC
 * @param {string} hash - идентификатор сессии
 * @param {Object} data - данные сессии
 * @param {number} port - порт VLC
 * @param {string} password - пароль VLC
 */
function startTimecodePolling(hash, data, port = DEFAULT_VLC_PORT, password = DEFAULT_VLC_PASSWORD) {
    // Останавливаем предыдущий пуллинг
    stopTimecodePolling()

    lastSuccessfulTimecode = null
    failedAttempts = 0

    // Делаем первый запрос сразу, чтобы получить начальный timecode
    console.log('VLC', 'Делаем первый запрос timecode')
    fetchAndSaveTimecode(port, password, hash).catch(error => {
        console.error('VLC', 'Первый запрос не удался')
    })

    // Запускаем интервал
    pollingInterval = setInterval(() => {
        // Проверяем, жив ли процесс VLC
        if (!currentVLCProcess) {
            console.log('VLC', 'Процесс VLC не найден, останавливаем polling')
            stopTimecodePolling()
            return
        }

        fetchAndSaveTimecode(port, password, hash).catch(error => {
            // Ошибка уже обработана в fetchAndSaveTimecode
        })
    }, POLLING_INTERVAL_MS)
}

/**
 * Остановка периодического опроса timecode
 */
function stopTimecodePolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        lastSuccessfulTimecode = null
        failedAttempts = 0
    }
}

/**
 * Запуск VLC плеера
 * @param {string} url - URL медиафайла
 * @param {Object} data - дополнительные данные
 * @param {Object} options - опции запуска (port, password)
 */
function openPlayer(url, data, options = {}) {
    const {
        port = DEFAULT_VLC_PORT,
        password = DEFAULT_VLC_PASSWORD,
        fullscreen = true
    } = options
    const file = require('fs')

    // Сохраняем hash сразу, чтобы он был доступен при закрытии
    if (data.timeline) {
        currentHash = data.timeline.hash
        vlcCallbacks[data.timeline.hash] = data.timeline.handler
    }

    // Подготовка аргументов для VLC
    const startTime = (data.timeline?.time ?? 0) * 1000
    const vlcArgs = [
        '--extraintf=http',
        '--http-host=localhost',
        `--http-port=${port}`,
        `--http-password=${password}`,
        `--start-time=${startTime}`,
        '--play-and-exit',
        '--no-loop',
        encodeURI(url)
    ]
    if (fullscreen) {
        vlcArgs.push('--fullscreen')
    }

    const playerPath = Storage.field('player_nw_path')

    // Попытка запуска VLC
    if (file.existsSync(playerPath)) {
        const spawn = require('child_process').spawn
        currentVLCProcess = spawn(playerPath, vlcArgs)

        // Отслеживаем закрытие процесса VLC
        currentVLCProcess.on('close', (code) => {
            console.log('VLC', 'Процесс закрыт с кодом:', code)

            if (currentHash && vlcCallbacks[currentHash]) {
                saveTimecodeOnVLCClose(currentHash)
            }

            currentVLCProcess = null
        })

        // Отслеживаем ошибки процесса
        currentVLCProcess.on('error', (error) => {
            console.error('VLC', 'Ошибка процесса:', error)

            if (currentHash && vlcCallbacks[currentHash]) {
                saveTimecodeOnVLCClose(currentHash)
            }

            currentVLCProcess = null
        })

        // Отслеживаем выход процесса
        currentVLCProcess.on('exit', (code, signal) => {
            console.log('VLC', 'Процесс завершен с кодом:', code, 'сигнал:', signal)

            if (currentHash && vlcCallbacks[currentHash]) {
                saveTimecodeOnVLCClose(currentHash)
            }

            currentVLCProcess = null
        })

    } else {
        Noty.show(Lang.translate('player_not_found') + ': ' + playerPath)
        return
    }

    // Запускаем polling с небольшой задержкой
    setTimeout(() => {
        if (data.timeline) {
            startTimecodePolling(data.timeline.hash, data, port, password)
        }
    }, 2000)
}

export default {
    openPlayer,
    stopTimecodePolling
}