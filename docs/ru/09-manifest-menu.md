[← API настроек](08-settings.md) · [Содержание](README.md) · **Далее: [Интеграция плеера →](10-player.md)**

---

# Манифест и меню

## Manifest.plugins — контекстное меню карточки

Регистрация в `Manifest.plugins` добавляет действия в контекстное меню карточки (длинное нажатие или кнопка «ещё»).

```js
Lampa.Manifest.plugins = {
    type: 'video',                  // всегда 'video' для плагинов медиаконтента

    // Вызывается при рендере контекстного меню карточки
    // Добавьте свой пункт, вызвав list.push({ title, 'icon', 'separator' })
    onContextMenu: function(card) {
        return { title: 'Смотреть в моём плагине' }
    },

    // Вызывается при выборе вашего пункта в контекстном меню
    // card — полный объект данных карточки
    onContextLauch: function(card) {
        Lampa.Activity.push({
            url:       '',
            title:     card.title || card.name,
            component: 'my_player_screen',
            movie:     card,
            page:      1
        })
    }
}
```

> **Примечание:** Сеттер `Manifest.plugins` **добавляет** ваш объект во внутренний массив — не перезаписывает его. Несколько плагинов могут безопасно регистрировать свои пункты.

---

## Структура объекта card

Когда вызывается `onContextLauch(card)` или `onContextMenu(card)`, объект `card` содержит:

| Поле | Тип | Описание |
|---|---|---|
| `id` | number | ID TMDB |
| `title` | string | Название на языке интерфейса |
| `original_title` | string | Оригинальное название |
| `name` | string | Название сериала (TV-шоу) |
| `original_name` | string | Оригинальное название сериала |
| `overview` | string | Описание |
| `vote_average` | number | Рейтинг (0–10) |
| `release_date` | string | Дата выхода (ГГГГ-ММ-ДД) |
| `first_air_date` | string | Дата первого эфира (TV) |
| `backdrop_path` | string | Путь к изображению (TMDB) |
| `poster_path` | string | Путь к постеру (TMDB) |
| `genres` | array | Жанры: `[{id, name}]` |
| `imdb_id` | string | ID IMDB — может отсутствовать или быть пустым |
| `media_type` | string | `'movie'` или `'tv'` |
| `number_of_seasons` | number | Только для сериалов |

> **`imdb_id`**: Не является гарантированным. Всегда проверяйте перед использованием. Если нужен, сделайте отдельный запрос к API TMDB `/movie/{id}`.

---

## Пункт бокового меню

Для добавления пункта в основное боковое меню вставляйте элемент DOM напрямую:

```js
function addMenuItem() {
    // Структура меню — <ul class="menu__list"> внутри <nav class="menu">
    let btn = $('<li class="menu__item selector">' +
        '<div class="menu__ico"><svg>…</svg></div>' +
        '<div class="menu__text">Мой плагин</div>' +
    '</li>')

    btn.on('hover:enter', () => {
        Lampa.Activity.push({
            url:       '',
            title:     'Мой плагин',
            component: 'my_screen',
            page:      1
        })
    })

    // Eq(0) — верхний список; eq(1) — нижний список (настройки, аккаунт)
    $('.menu .menu__list').eq(0).append(btn)
}
```

> Вызывайте `addMenuItem()` после `appready`, иначе DOM меню ещё не существует.

---

## Несколько плагинов в одном файле

Сеттер `Manifest.plugins` вызывается один раз на объект. Если вам нужно добавить несколько источников из одного плагина, присваивайте несколько раз:

```js
Lampa.Manifest.plugins = {
    type: 'video',
    onContextMenu:  (card) => ({ title: 'Плагин — Источник А' }),
    onContextLauch: (card) => lauchSourceA(card)
}

Lampa.Manifest.plugins = {
    type: 'video',
    onContextMenu:  (card) => ({ title: 'Плагин — Источник Б' }),
    onContextLauch: (card) => lauchSourceB(card)
}
```

---

## Полный пример точки входа

```js
(function() {
    'use strict'

    if (window.my_plugin_ready) return
    window.my_plugin_ready = true

    Lampa.Template.add('my_screen', `
        <div class="my-screen">
            <div class="my-screen__content"></div>
        </div>
    `)

    function MyScreen(object) {
        let html = Lampa.Template.get('my_screen', {})

        this.create  = function() { return this.render() }
        this.start   = function() {}
        this.stop    = function() {}
        this.destroy = function() { html.remove() }
        this.render  = function() { return html }
        this.empty   = function() {}
    }

    function init() {
        Lampa.Component.add('my_screen', MyScreen)

        Lampa.Manifest.plugins = {
            type: 'video',
            onContextMenu:  (card) => ({ title: 'Открыть в Моём плагине' }),
            onContextLauch: (card) => {
                Lampa.Activity.push({
                    url: '', title: card.title || card.name,
                    component: 'my_screen', movie: card, page: 1
                })
            }
        }

        let btn = $('<li class="menu__item selector"><div class="menu__text">Мой плагин</div></li>')
        btn.on('hover:enter', () => Lampa.Activity.push({
            url: '', title: 'Мой плагин', component: 'my_screen', page: 1
        }))
        $('.menu .menu__list').eq(0).append(btn)
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') init() })
})()
```

---

[← API настроек](08-settings.md) · [Содержание](README.md) · **Далее: [Интеграция плеера →](10-player.md)**
