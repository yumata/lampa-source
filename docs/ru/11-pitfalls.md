[← Интеграция плеера](10-player.md) · [Содержание](README.md) · **Далее: [Дебаг →](12-debug.md)**

---

# Подводные камни

## 1. Отсутствие защиты от двойной загрузки

❌ **Неправильно** — каждая загрузка плагина регистрирует шаблоны и компоненты заново:

```js
(function() {
    Lampa.Template.add('my_screen', '...')
    Lampa.Component.add('my_screen', MyScreen)
    // ...
})()
```

✅ **Правильно** — флаг гарантирует однократное выполнение:

```js
(function() {
    'use strict'

    if (window.my_plugin_ready) return
    window.my_plugin_ready = true

    Lampa.Template.add('my_screen', '...')
    Lampa.Component.add('my_screen', MyScreen)
    // ...
})()
```

---

## 2. Обращение к UI до готовности приложения

❌ **Неправильно** — DOM меню не существует при выполнении скрипта:

```js
(function() {
    // Слишком рано — меню не построено
    $('.menu .menu__list').eq(0).append(myButton)
})()
```

✅ **Правильно** — подождать событие `app:ready`:

```js
function init() {
    $('.menu .menu__list').eq(0).append(myButton)
}

if (window.appready) init()
else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') init() })
```

---

## 3. Утечки слушателей PlayerVideo

❌ **Неправильно** — подписка в `init()` накапливается при каждом открытии плеера:

```js
function init() {
    Lampa.PlayerVideo.listener.follow('timeupdate', onTimeUpdate)
    // После 10 открытий плеера — 10 вызовов onTimeUpdate за тик!
}
```

✅ **Правильно** — подписываться только внутри `Player:start` и удалять в `Player:destroy`:

```js
function init() {
    Lampa.Player.listener.follow('start', () => {
        Lampa.PlayerVideo.listener.follow('timeupdate', onTimeUpdate)

        function onDestroy() {
            Lampa.PlayerVideo.listener.remove('timeupdate', onTimeUpdate)
            Lampa.Player.listener.remove('destroy', onDestroy)
        }
        Lampa.Player.listener.follow('destroy', onDestroy)
    })
}
```

---

## 4. Асинхронные коллбэки после destroy

❌ **Неправильно** — коллбэк может вызваться после уничтожения компонента:

```js
function MyComponent(object) {
    let net = new Lampa.Reguest()

    this.create = function() {
        net.get(url, (data) => {
            // Ошибка, если компонент уже уничтожен
            renderItems(data)
        })
    }

    this.destroy = function() { net.clear() }
}
```

✅ **Правильно** — флаг `inited` защищает от поздних коллбэков:

```js
function MyComponent(object) {
    let net    = new Lampa.Reguest()
    let inited = false

    this.create = function() {
        inited = true
        net.get(url, (data) => {
            if (!inited) return   // компонент уже уничтожен
            renderItems(data)
        })
    }

    this.destroy = function() { inited = false; net.clear() }
}
```

---

## 5. Нативные DOM-события вместо jQuery

❌ **Неправильно** — нативные события не обрабатываются системой фокуса Lampa:

```js
element.addEventListener('click', handler)
```

✅ **Правильно** — использовать jQuery-события Lampa:

```js
// Для интерактивных элементов (класс selector)
$(element).on('hover:enter', handler)   // подтверждение выбора
$(element).on('hover:focus', handler)   // элемент в фокусе
$(element).on('hover:blur',  handler)   // элемент потерял фокус
```

---

## 6. Коллизии ключей хранилища

❌ **Неправильно** — общие ключи могут конфликтовать с другими плагинами:

```js
Lampa.Storage.set('token',   myToken)
Lampa.Storage.set('enabled', true)
Lampa.Storage.set('server',  url)
```

✅ **Правильно** — префикс в виде пространства имён плагина:

```js
Lampa.Storage.set('myplugin_token',   myToken)
Lampa.Storage.set('myplugin_enabled', true)
Lampa.Storage.set('myplugin_server',  url)
```

---

## 7. Перезапись `window.lampa_settings`

❌ **Неправильно** — уничтожает настройки других плагинов:

```js
window.lampa_settings = {
    component: 'my_plugin',
    name:      'Мой плагин'
}
```

✅ **Правильно** — всегда использовать `SettingsApi.addComponent()`:

```js
Lampa.SettingsApi.addComponent({
    component: 'my_plugin',
    name:      'Мой плагин',
    icon:      ''
})
```

---

## 8. CSS вне `init()`

❌ **Неправильно** — CSS-шаблон добавляется в body до полной загрузки DOM:

```js
(function() {
    Lampa.Template.add('my_css', '<style>.my-card { … }</style>')
    $('body').append(Lampa.Template.get('my_css', {}, true))  // body ещё не готов
})()
```

✅ **Правильно** — добавлять CSS в `init()` после `appready`:

```js
function init() {
    Lampa.Template.add('my_css', '<style>.my-card { … }</style>')
    $('body').append(Lampa.Template.get('my_css', {}, true))
    // ... остальная инициализация
}

if (window.appready) init()
else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') init() })
```

---

[← Интеграция плеера](10-player.md) · [Содержание](README.md) · **Далее: [Дебаг →](12-debug.md)**
