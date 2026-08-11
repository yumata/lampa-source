[← Navigation](07-navigation.md) · [Index](README.md) · **Next: [Manifest & Menu →](09-manifest-menu.md)**

---

# Settings API

The Settings API lets you add a dedicated section to the app's Settings screen with your own toggle, select, and text-input controls. Values are automatically persisted in Storage.

---

## 1. Register a Section

```js
Lampa.SettingsApi.addComponent({
    component: 'my_plugin',          // unique ID — do not collide with built-in names
    name:      'My Plugin',          // label shown in the settings list
    icon:      '<svg>…</svg>',       // SVG string (same size/style as built-in icons)
    before:    'interface',          // (optional) insert before this built-in section
    // after: 'player'              // (optional) insert after a section instead
})
```

Built-in section names for `before` / `after`: `interface`, `player`, `parser`, `server`, `more`, `account`, `plugins`, `tmdb`.

---

## 2. Add Parameters

### Toggle (on/off)

```js
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: {
        name:    'myplugin_enabled',   // storage key
        type:    'trigger',
        default: false                 // initial value if not yet stored
    },
    field: {
        name:        'Enable feature',
        description: 'Optional hint shown below the toggle'   // can be omitted
    },
    onChange: (element) => {
        // Called immediately when the user toggles.
        // Read the new value from Storage:
        let enabled = Lampa.Storage.field('myplugin_enabled')
        console.log('enabled:', enabled)
    }
})
```

### Select (dropdown)

```js
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: {
        name:    'myplugin_quality',
        type:    'select',
        values:  {
            low:  'Low (480p)',
            mid:  'Medium (720p)',
            high: 'High (1080p)'
        },
        default: 'mid'
    },
    field: {
        name: 'Video Quality'
    },
    onChange: (element) => {
        let quality = Lampa.Storage.field('myplugin_quality')
        console.log('quality:', quality) // 'low' | 'mid' | 'high'
    }
})
```

### Text Input

```js
Lampa.SettingsApi.addParam({
    component: 'my_plugin',
    param: {
        name:        'myplugin_server',
        type:        'input',
        placeholder: 'https://my-server.com',
        default:     ''
    },
    field: {
        name:        'Server URL',
        description: 'Your private API endpoint'
    },
    onChange: (element) => {
        let url = Lampa.Storage.field('myplugin_server')
        reconnect(url)
    }
})
```

---

## 3. Reading Values

After the user has saved settings, read them anywhere in your plugin:

```js
// For params registered via SettingsApi, use Storage.field()
let enabled = Lampa.Storage.field('myplugin_enabled') // boolean
let quality = Lampa.Storage.field('myplugin_quality') // 'low' | 'mid' | 'high'
let server  = Lampa.Storage.field('myplugin_server')  // string

// Storage.field() returns the stored value OR the param's default
// if the user has never changed it.
```

---

## 4. Removing a Section

If your plugin needs to clean up (e.g. on uninstall):

```js
Lampa.SettingsApi.removeComponent('my_plugin')
Lampa.SettingsApi.removeParams('my_plugin')
```

---

## Full Example

```js
function init() {
    Lampa.Lang.add({
        myplugin_settings:  { ru: 'Настройки плагина', en: 'Plugin Settings' },
        myplugin_enabled:   { ru: 'Включить плагин',   en: 'Enable plugin' },
        myplugin_quality:   { ru: 'Качество видео',    en: 'Video quality' },
        myplugin_server:    { ru: 'Адрес сервера',     en: 'Server address' },
    })

    Lampa.SettingsApi.addComponent({
        component: 'my_plugin',
        name:      Lampa.Lang.translate('myplugin_settings'),
        icon:      '<svg width="44" height="44" viewBox="0 0 44 44">…</svg>'
    })

    Lampa.SettingsApi.addParam({
        component: 'my_plugin',
        param: { name: 'myplugin_enabled', type: 'trigger', default: true },
        field: { name: Lampa.Lang.translate('myplugin_enabled') }
    })

    Lampa.SettingsApi.addParam({
        component: 'my_plugin',
        param: { name: 'myplugin_quality', type: 'select',
                 values: { low: '480p', mid: '720p', high: '1080p' }, default: 'mid' },
        field: { name: Lampa.Lang.translate('myplugin_quality') }
    })

    Lampa.SettingsApi.addParam({
        component: 'my_plugin',
        param: { name: 'myplugin_server', type: 'input',
                 placeholder: 'https://…', default: '' },
        field: { name: Lampa.Lang.translate('myplugin_server') }
    })
}
```

---

[← Navigation](07-navigation.md) · [Index](README.md) · **Next: [Manifest & Menu →](09-manifest-menu.md)**
