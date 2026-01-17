import Storage from '../core/storage/storage.js'
import Noty from "../interaction/noty";
import Lang from "./lang";

let vlcCallbacks = {}
let pollingInterval = null

function init() {
    // Инициализация при необходимости
}

function connectToVLC(port = 8080, password = '') {
    return new Promise((resolve, reject) => {
        // Проверка доступности VLC API
        fetch(`http://localhost:${port}/requests/status.json`, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + password)
            }
        })
            .then(response => {
                if (response.ok) resolve(true)
                else reject(new Error('VLC API недоступен'))
            })
            .catch(reject)
    })
}

function startTimecodePolling(hash, data, port = 8080, password = '') {
    // Останавливаем предыдущий пуллинг, если он был
    stopTimecodePolling()

    pollingInterval = setInterval(() => {
        fetch(`http://localhost:${port}/requests/status.json`, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + password)
            }
        })
            .then(response => response.json())
            .then(status => {
                if (status.time && status.length) {
                    let currentTime = status.time / 1000 // VLC возвращает в мс
                    let duration = status.length / 1000
                    let percent = Math.round((currentTime / duration) * 100)

                    // Вызываем callback для сохранения timecode
                    if (vlcCallbacks[hash]) {
                        vlcCallbacks[hash](percent, currentTime, duration)
                    }
                }
            })
            .catch(error => {
                // Noty.show("Ошибка стопим пулинг " + Math.random())
                stopTimecodePolling()
                // console.error('Ошибка получения timecode из VLC:', error)
            })
    }, 2000) // Обновляем каждые 2 секунды
}

function stopTimecodePolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        // Noty.show("Остановили пулинг VLC таймкода")
    }
}

function openPlayer(url, data, options = {}) {
    let {port = 8080, password = ''} = options

    // Запускаем VLC с включенным HTTP API

    var startTime = (data.timeline ? data.timeline.time : 0) * 1000
    var vlcArgs = [
        '--extraintf=http',
        '--http-host=localhost',
        "--http-port=".concat(port),
        '--http-password=' + password,
        '--start-time=' + startTime,
        '--fullscreen',
        '--play-and-exit',
        '--no-loop',
        encodeURI(url.replace('&preload', '&play'))
    ]

    // Lampa.Noty.show("Запуск внешнего плеера vlc")
    var path = Storage.field('player_nw_path');

    try {
        // если есть require
        let spawn = require('child_process').spawn
        spawn('vlc', vlcArgs)
    } catch (error) {
        // если НЕТ require
        if (window.api.fileExists(path)) {
            window.api.spawnProcess(path, vlcArgs)
        } else {
            Noty.show(Lang.translate('player_not_found') + ': ' + path);
        }
    }

    // Ждем запуска VLC и начинаем отслеживание
    setTimeout(() => {
        connectToVLC(port, password)
            .then(() => {
                if (data.timeline) {
                    vlcCallbacks[data.timeline.hash] = data.timeline.handler
                    startTimecodePolling(data.timeline.hash, data, port, password)
                }
            })
            .catch(console.error)
    }, 2000)
}

export default {
    init,
    openPlayer,
    stopTimecodePolling
}