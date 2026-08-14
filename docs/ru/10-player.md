[← Манифест и меню](09-manifest-menu.md) · [Содержание](README.md) · **Далее: [Подводные камни →](11-pitfalls.md)**

---

# Интеграция плеера

## Стандартный плагин для плеера

Наиболее распространённый паттерн: подписка на события Player в `init()` и очистка при `destroy`.

```js
function init() {
    function onPlayerStart(data) {
        // data.url    — URL потока
        // data.title  — заголовок
        // data.movie  — объект карточки (id, title, …)
        console.log('[MyPlugin] плеер стартовал:', data.url)

        // Подписаться на события PlayerVideo ЗДЕСЬ — не в init()
        function onTimeUpdate(e) {
            // e.current, e.duration — секунды
        }

        function onEnded() {
            cleanup()
        }

        function onDestroy() {
            Lampa.PlayerVideo.listener.remove('timeupdate', onTimeUpdate)
            Lampa.PlayerVideo.listener.remove('ended',      onEnded)
            Lampa.Player.listener.remove('destroy', onDestroy)
        }

        Lampa.PlayerVideo.listener.follow('timeupdate', onTimeUpdate)
        Lampa.PlayerVideo.listener.follow('ended',      onEnded)
        Lampa.Player.listener.follow('destroy', onDestroy)
    }

    Lampa.Player.listener.follow('start', onPlayerStart)
}
```

> **Критически важно:** Модуль PlayerVideo **пересоздаётся** при каждом открытии плеера. Подписывайтесь на его события только внутри обработчика `Player:start` и всегда удаляйте слушателей в `Player:destroy`. Подписка в `init()` в обход этого правила приводит к накоплению слушателей.

---

## Отмена запуска плеера

Используйте событие `create`, чтобы перехватить запуск плеера до начала воспроизведения:

```js
Lampa.Player.listener.follow('create', (data) => {
    // data.data  — объект данных воспроизведения
    // data.abort — функция для отмены

    if (shouldRedirect(data.data)) {
        data.abort()
        openMyCustomPlayer(data.data)
    }
})
```

---

## Добавление дорожек и субтитров

Используйте `PlayerPanel.setTracks()` и `PlayerPanel.setSubs()` внутри обработчика события `ready`:

```js
Lampa.Player.listener.follow('ready', () => {
    // Добавить аудиодорожки
    Lampa.PlayerPanel.setTracks([
        { id: 0, title: 'Русский', lang: 'ru' },
        { id: 1, title: 'Английский', lang: 'en' }
    ])

    // Добавить субтитры
    Lampa.PlayerPanel.setSubs([
        { id: 0, title: 'Русские', lang: 'ru', url: 'http://…/ru.vtt' },
        { id: 1, title: 'Английские', lang: 'en', url: 'http://…/en.vtt' }
    ])
})
```

---

## Перехват свойств видео

Используйте `Object.defineProperty` внутри обработчика `ready`, чтобы перехватить значение `src` или управлять дорожками нестандартным способом:

```js
Lampa.Player.listener.follow('ready', () => {
    let video = Lampa.PlayerVideo.video   // HTMLVideoElement

    let originalSrc = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype, 'src'
    )

    Object.defineProperty(video, 'src', {
        set: function(value) {
            // Модифицировать URL перед установкой
            let modified = transformUrl(value)
            originalSrc.set.call(this, modified)
        },
        get: function() {
            return originalSrc.get.call(this)
        },
        configurable: true
    })
})
```

---

## Событие external — внешний плеер

Срабатывает, когда содержимое открывается во внешнем плеере (MX Player, VLC и т.д.):

```js
Lampa.Player.listener.follow('external', (data) => {
    // data.url   — URL для внешнего плеера
    // data.title — заголовок
    console.log('[MyPlugin] внешний плеер:', data.url)
})
```

---

## Паттерн с поддержкой торрентов

```js
Lampa.Player.listener.follow('start', (data) => {
    // data.torrent_hash — присутствует при воспроизведении торрента
    if (data.torrent_hash) {
        console.log('торрент-хэш:', data.torrent_hash)
        console.log('индекс файла:', data.id)
    }
})

// Список файлов торрента открыт/закрыт
Lampa.Listener.follow('torrent_file', (e) => {
    if (e.type == 'render') {
        // e.item    — jQuery-элемент строки файла
        // e.element — объект данных файла
        // e.items   — все файлы торрента

        // Добавить кнопку к каждому файлу
        let btn = $('<div class="my-btn">Открыть</div>')
        btn.on('hover:enter', () => myOpenFile(e.element))
        e.item.append(btn)
    }
})
```

---

## События WebOS

На устройствах LG WebOS можно слушать аппаратные кнопки пульта прямо из плагина плеера:

```js
Lampa.Player.listener.follow('start', () => {
    function onKey(e) {
        if (e.keyCode == 1001) {  // кнопка INFO/Details
            showMyOverlay()
        }
    }

    function onDestroy() {
        document.removeEventListener('keydown', onKey)
        Lampa.Player.listener.remove('destroy', onDestroy)
    }

    document.addEventListener('keydown', onKey)
    Lampa.Player.listener.follow('destroy', onDestroy)
})
```

---

[← Манифест и меню](09-manifest-menu.md) · [Содержание](README.md) · **Далее: [Подводные камни →](11-pitfalls.md)**
