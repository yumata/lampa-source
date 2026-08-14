[← Жизненный цикл](02-lifecycle.md) · [Содержание](README.md) · **Далее: [Хранилище и сеть →](04-storage-network.md)**

---

# Система событий

## Принцип работы

Система событий основана на `Subscribe()` — лёгкой фабрике pub/sub. Каждый модуль, генерирующий события, предоставляет свой экземпляр `listener`. Подписка — `.follow(type, fn)`, отписка — `.remove(type, fn)`.

```js
// Подписка
Lampa.Player.listener.follow('start', onPlayerStart)

// Отписка (всегда делать в destroy())
Lampa.Player.listener.remove('start', onPlayerStart)

// Подписка на несколько типов событий сразу
Lampa.PlayerVideo.listener.follow('play,pause', onPlaybackChange)
```

> **Всегда храните обработчик в именованной переменной**, чтобы передать ту же ссылку в `.remove()`. Анонимные функции нельзя удалить.

---

## Создание собственной шины событий

Для внутренней коммуникации между модулями плагина создайте приватную шину:

```js
let bus = Lampa.Subscribe()

// В одном модуле
bus.follow('data_loaded', (data) => { renderList(data) })

// В другом модуле
bus.send('data_loaded', { items: result })

// Проверка, зарегистрирован ли слушатель
bus.has('data_loaded', myHandler) // → true / false
```

---

## Глобальные события приложения — `Lampa.Listener`

### `app`

Событие срабатывает в ключевые моменты последовательности загрузки.

```js
Lampa.Listener.follow('app', (e) => {
    if (e.type == 'start') {
        // Последовательность загрузки началась.
        // Большинство модулей ЕЩЁ НЕ готовы.
    }
    if (e.type == 'ready') {
        // Приложение полностью загружено — все Lampa.* API безопасны.
    }
})
```

### `activity`

Срабатывает при каждом переходе между экранами.

```js
Lampa.Listener.follow('activity', (e) => {
    // e.type      — 'create' | 'init' | 'start' | 'destroy' | 'archive'
    // e.component — имя компонента (например, 'full', 'main')
    // e.object    — объект данных activity

    if (e.type == 'destroy' && e.component == 'full') {
        // Пользователь покинул страницу с деталями карточки
    }
})
```

### `full`

События со страницы с детальной информацией карточки.

```js
Lampa.Listener.follow('full', (e) => {
    // Различные события жизненного цикла страницы карточки
})
```

### `torrent` / `torrent_file`

```js
Lampa.Listener.follow('torrent', (e) => {
    // События поиска и управления торрентами
})

Lampa.Listener.follow('torrent_file', (e) => {
    // e.type == 'list_open'  — список файлов торрента открыт
    // e.type == 'list_close' — список файлов торрента закрыт
    // e.type == 'render'     — e.item (jQuery), e.element (данные файла), e.items[]
})
```

### `line`

Срабатывает в строках контента (горизонтальных рядах карточек).

```js
Lampa.Listener.follow('line', (e) => {
    // События строки контента
})
```

### `resize_start` / `resize_end`

```js
Lampa.Listener.follow('resize_start', () => { /* изменение размера окна началось */ })
Lampa.Listener.follow('resize_end',   () => { /* изменение размера окна завершилось */ })
```

### `request_before` / `request_error` / `request_secuses`

Срабатывают в глобальном сетевом слое вокруг запросов с индикатором загрузки.

---

## События плеера — `Lampa.Player.listener`

### `create`

Срабатывает перед открытием плеера. Можно отменить запуск.

```js
Lampa.Player.listener.follow('create', (data) => {
    // data.data  — полный объект данных воспроизведения
    // data.abort — вызовите эту функцию для отмены запуска плеера
    if (shouldBlock(data.data)) data.abort()
})
```

### `start`

Срабатывает, когда плеер открылся и готов загружать видео.

```js
Lampa.Player.listener.follow('start', (data) => {
    // data.url          — URL потока
    // data.title        — отображаемый заголовок
    // data.movie        — объект карточки (id, title, original_title, …)
    // data.torrent_hash — хэш при воспроизведении из торрента
    // data.id           — индекс файла в торренте
})
```

### `ready`

Срабатывает, когда видеоэлемент создан и поток загружается.

### `destroy`

Срабатывает при закрытии плеера. **Здесь удалите все слушатели PlayerVideo.**

```js
Lampa.Player.listener.follow('destroy', () => {
    // Очистить всё, зарегистрированное во время 'start'
})
```

### `external`

Срабатывает, когда файл открывается во внешнем плеере.

---

## События видео — `Lampa.PlayerVideo.listener`

> **Важно:** Модуль PlayerVideo пересоздаётся при каждом открытии плеера. Подписывайтесь внутри обработчика `Player:start` и всегда удаляйте слушателей в `Player:destroy`.

| Событие | Данные | Описание |
|---|---|---|
| `canplay` | `{}` | Видео готово к воспроизведению |
| `timeupdate` | `{duration, current}` | Позиция воспроизведения (секунды) |
| `ended` | `{}` | Видео завершено |
| `error` | `{error: string, fatal: bool}` | Ошибка воспроизведения |
| `play` | `{}` | Воспроизведение возобновлено |
| `pause` | `{}` | Воспроизведение поставлено на паузу |
| `rewind` | `{}` | Выполнена перемотка |
| `tracks` | `{tracks: AudioTrackList}` | Доступны аудиодорожки |
| `subs` | `{subs: TextTrackList}` | Доступны субтитры |
| `levels` | `{levels: [], current: string}` | Уровни качества HLS |
| `progress` | `{down: string}` | Прогресс буферизации |
| `loadeddata` | `{}` | Метаданные медиа загружены |
| `videosize` | `{width, height}` | Размеры видео определены |

```js
Lampa.Player.listener.follow('start', (data) => {
    function onEnded() {
        console.log('Видео завершено')
        Lampa.PlayerVideo.listener.remove('ended', onEnded)
    }

    function onDestroy() {
        Lampa.PlayerVideo.listener.remove('ended', onEnded)
        Lampa.Player.listener.remove('destroy', onDestroy)
    }

    Lampa.PlayerVideo.listener.follow('ended',   onEnded)
    Lampa.Player.listener.follow('destroy', onDestroy)
})
```

---

## События хранилища — `Lampa.Storage.listener`

| Событие | Данные | Описание |
|---|---|---|
| `change` | `{name, value}` | Ключ записан через `Storage.set()` |
| `add` | `{name, value}` | Значение добавлено через `Storage.add()` |
| `clear` | `{full}` | Хранилище очищено |

---

## События избранного — `Lampa.Favorite.listener`

| Событие | Данные | Описание |
|---|---|---|
| `add` | `{where, card}` | Карточка добавлена в категорию |
| `added` | `{where, card}` | После сохранения добавления |
| `remove` | `{where, card}` | Карточка удалена из категории |

`where` — название категории: `'like'`, `'wath'`, `'history'`, `'book'` и т.д.

---

[← Жизненный цикл](02-lifecycle.md) · [Содержание](README.md) · **Далее: [Хранилище и сеть →](04-storage-network.md)**
