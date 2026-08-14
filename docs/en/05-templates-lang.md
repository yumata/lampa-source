[← Storage & Network](04-storage-network.md) · [Index](README.md) · **Next: [UI Components →](06-ui-components.md)**

---

# Templates & Localization

## Templates

Templates are named HTML strings registered at init time and retrieved as DOM clones at use time. The system handles two placeholder types:

| Placeholder | Resolved by |
|---|---|
| `{key}` | Data object passed to `Template.get()` |
| `#{lang_key}` | Current language via `Lang.translate()` |

### Registering Templates

```js
// Always register during init(), not at script top level
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

### Retrieving Templates

```js
// Returns a jQuery-wrapped DOM clone with data interpolated
let el = Lampa.Template.get('my_card', {
    title: 'Breaking Bad',
    year:  '2008'
})

// Returns a raw HTML string (for appending inside another string)
let str = Lampa.Template.get('my_card', { title: 'Ozark' }, true)

// Append to a container
scroll.append(el)
```

### CSS Injection

Inject plugin CSS by registering a `<style>` template and appending it to `document.body` once during init:

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

// Call once during init()
$('body').append(Lampa.Template.get('my_plugin_css', {}, true))
```

> When building inside the app source, use `@@include('../plugins/my-plugin/css/style.css')` inside the template string. The Gulp build inlines the CSS file at compile time. For external plugins, embed the CSS directly as a string.

---

## Localization

### Adding Translations

Call `Lampa.Lang.add()` with a dictionary of locale keys. **Always include at least `ru` and `en`.** The app falls back to `ru` if the user's locale is not found.

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

### Using Translations

```js
// In JavaScript code
let label = Lampa.Lang.translate('my_watch')

// In templates via #{…} placeholder
Lampa.Template.add('my_btn', `<button>#{my_watch}</button>`)

// In settings field names (SettingsApi)
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: { name: 'my_option', type: 'trigger', default: false },
    field: { name: Lampa.Lang.translate('my_settings_title') }
})
```

### Supported Locales

The app ships with built-in `ru` and `en`. Additional locales are loaded from external `.js` files and may not be present in all deployments. Always provide `ru` and `en` as a minimum. The most common additional locales used by existing plugins: `uk`, `zh`, `bg`, `fr`, `de`, `pl`, `he`, `cs`, `ro`, `pt`.

---

[← Storage & Network](04-storage-network.md) · [Index](README.md) · **Next: [UI Components →](06-ui-components.md)**
