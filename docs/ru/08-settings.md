[← Навигация](07-navigation.md) · [Содержание](README.md) · **Далее: [Манифест и меню →](09-manifest-menu.md)**

---

# API настроек

`Lampa.SettingsApi` позволяет плагину добавлять свои опции в системный экран «Настройки».

## Регистрация раздела

Зарегистрируйте именованный раздел с заголовком и иконкой. Вызывайте один раз в `init()`.

```js
Lampa.SettingsApi.addComponent({
    component: 'my_plugin',           // уникальный идентификатор раздела
    name:      'Настройки плагина',   // заголовок в меню настроек
    icon:      '<svg>…</svg>'         // строка с SVG-иконкой (или пустая строка)
})
```

---

## Добавление параметров

Каждый параметр принадлежит именованному компоненту и имеет имя, тип и значение по умолчанию.

### Тип `trigger` (переключатель)

```js
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: {
        name:    'my_plugin_enabled',   // ключ хранилища
        type:    'trigger',
        default: false
    },
    field: {
        name: 'Включить плагин',
        description: 'Показывать кнопку «Плагин» в меню карточки'
    },
    // Опциональный коллбэк при изменении значения
    onChange: (value) => {
        console.log('enabled changed to', value)
    }
})
```

### Тип `select` (список вариантов)

```js
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: {
        name:    'my_plugin_quality',
        type:    'select',
        values:  '480,720,1080',     // строка с вариантами через запятую
        default: '720'
    },
    field: {
        name: 'Качество по умолчанию'
    },
    onChange: (value) => {
        console.log('quality changed to', value)
    }
})
```

### Тип `input` (текстовое поле)

```js
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: {
        name:    'my_plugin_server_url',
        type:    'input',
        default: 'http://192.168.1.1:9117'
    },
    field: {
        name:        'Адрес сервера',
        description: 'URL вашего балансировщика/прокси'
    },
    onChange: (value) => {
        reconnect(value)
    }
})
```

---

## Чтение значений настроек

Читайте значение параметра через `Storage.field()` — он учитывает значение по умолчанию, заданное в `addParam`.

```js
let enabled = Lampa.Storage.field('my_plugin_enabled')   // true | false
let quality  = Lampa.Storage.field('my_plugin_quality')  // '480' | '720' | '1080'
let url      = Lampa.Storage.field('my_plugin_server_url')
```

---

## Удаление раздела

Вызывайте, если плагин деактивируется или должен скрыть свои настройки:

```js
Lampa.SettingsApi.removeComponent('my_plugin')
```

---

## Полный пример

```js
(function() {
    'use strict'

    if (window.my_plugin_ready) return
    window.my_plugin_ready = true

    function init() {
        // Регистрировать настройки
        Lampa.SettingsApi.addComponent({
            component: 'my_plugin',
            name:      'Мой плагин',
            icon:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>'
        })

        Lampa.SettingsApi.addParam({
            component: 'my_plugin',
            param: { name: 'my_plugin_enabled', type: 'trigger', default: true },
            field: { name: 'Включить плагин', description: 'Встроить плагин в интерфейс' }
        })

        Lampa.SettingsApi.addParam({
            component: 'my_plugin',
            param: {
                name:    'my_plugin_source',
                type:    'select',
                values:  'auto,Источник А,Источник Б',
                default: 'auto'
            },
            field: { name: 'Предпочитаемый источник' }
        })

        Lampa.SettingsApi.addParam({
            component: 'my_plugin',
            param: { name: 'my_plugin_token', type: 'input', default: '' },
            field: {
                name:        'API-токен',
                description: 'Получить на сайте example.com'
            }
        })
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') init() })
})()
```

---

[← Навигация](07-navigation.md) · [Содержание](README.md) · **Далее: [Манифест и меню →](09-manifest-menu.md)**
