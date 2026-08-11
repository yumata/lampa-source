[← Хранилище и сеть](04-storage-network.md) · [Содержание](README.md) · **Далее: [UI-компоненты →](06-ui-components.md)**

---

# Шаблоны и локализация

## Шаблоны

Шаблоны — это именованные HTML-строки, регистрируемые при инициализации и получаемые как DOM-клоны в нужный момент. Система обрабатывает два типа плейсхолдеров:

| Плейсхолдер | Заменяется |
|---|---|
| `{key}` | Данными из объекта, переданного в `Template.get()` |
| `#{lang_key}` | Переводом через `Lang.translate()` для текущего языка |

### Регистрация шаблонов

```js
// Всегда регистрируйте во время init(), а не на верхнем уровне скрипта
Lampa.Template.add('my_card', `
    <div class="my-card selector">
        <div class="my-card__poster">
            <img class="my-card__img" src="./img/img_load.svg">
        </div>
        <div class="my-card__title">{title}</div>
        <div class="my-card__year">{year}</div>
        <div class="my-card__label">#{my_new_label}</div>
    </div>
`)
```

### Получение шаблонов

```js
// Возвращает jQuery-обёртку над DOM-клоном с подставленными данными
let el = Lampa.Template.get('my_card', {
    title: 'Во все тяжкие',
    year:  '2008'
})

// Возвращает сырую HTML-строку (для вставки внутрь другой строки)
let str = Lampa.Template.get('my_card', { title: 'Озарк' }, true)

// Добавить в контейнер
scroll.append(el)
```

### Внедрение CSS

Внедряйте CSS плагина, регистрируя шаблон `<style>` и добавляя его в `document.body` один раз во время `init()`:

```js
Lampa.Template.add('my_plugin_css', `
    <style>
        .my-card {
            background: #1b1e27;
            border-radius: 6px;
            padding: 0.5em;
        }
        .my-card__title {
            font-size: 0.9em;
            color: #fff;
        }
    </style>
`)

// Вызвать один раз во время init()
$('body').append(Lampa.Template.get('my_plugin_css', {}, true))
```

> При сборке внутри исходников приложения используйте `@@include('../plugins/my-plugin/css/style.css')` внутри строки шаблона. Gulp-сборка встраивает CSS-файл во время компиляции. Для внешних плагинов вставляйте CSS напрямую строкой.

---

## Локализация

### Добавление переводов

Вызывайте `Lampa.Lang.add()` со словарём языковых ключей. **Всегда включайте как минимум `ru` и `en`.** Приложение падает обратно на `ru`, если язык пользователя не найден.

```js
Lampa.Lang.add({
    my_watch: {
        ru: 'Смотреть',
        en: 'Watch',
        uk: 'Дивитись',
        zh: '观看',
        bg: 'Гледай',
        fr: 'Regarder',
        de: 'Ansehen'
    },
    my_error_connect: {
        ru: 'Ошибка подключения',
        en: 'Connection error',
        uk: 'Помилка з\'єднання'
    },
    my_settings_title: {
        ru: 'Настройки плагина',
        en: 'Plugin Settings'
    }
})
```

### Использование переводов

```js
// В JavaScript-коде
let label = Lampa.Lang.translate('my_watch')

// В шаблонах через плейсхолдер #{…}
Lampa.Template.add('my_btn', `<button>#{my_watch}</button>`)

// В именах полей настроек (SettingsApi)
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: { name: 'my_option', type: 'trigger', default: false },
    field: { name: Lampa.Lang.translate('my_settings_title') }
})
```

### Поддерживаемые локали

Приложение поставляется со встроенными `ru` и `en`. Дополнительные локали загружаются из внешних `.js`-файлов и могут отсутствовать в некоторых деплоях. Всегда предоставляйте `ru` и `en` как минимум. Наиболее распространённые дополнительные локали в существующих плагинах: `uk`, `zh`, `bg`, `fr`, `de`, `pl`, `he`, `cs`, `ro`, `pt`.

---

[← Хранилище и сеть](04-storage-network.md) · [Содержание](README.md) · **Далее: [UI-компоненты →](06-ui-components.md)**
