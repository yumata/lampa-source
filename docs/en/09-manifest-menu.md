[← Settings API](08-settings.md) · [Index](README.md) · **Next: [Player Integration →](10-player.md)**

---

# Manifest & Menu

## Card Context Menu

Registering a manifest with `type: 'video'` makes your plugin appear in the **long-press context menu** on every media card. This is the standard entry point for streaming/playback plugins.

### Manifest Object

```js
let manifest = {
    type:        'video',           // required to appear in card context menu
    version:     '1.0.0',           // your plugin's version string
    name:        'My Plugin',       // display name in the context menu group header
    description: 'Short description',
    component:   'my_screen',       // optional — the component you'll push

    // Called to get the menu item label. Return an object with name and description.
    onContextMenu: (cardData) => {
        return {
            name:        Lampa.Lang.translate('my_watch'),
            description: ''
        }
    },

    // Called when the user selects your item from the context menu.
    // cardData = the full card object from the API
    onContextLauch: (cardData) => {
        Lampa.Component.add('my_screen', MyComponent)

        Lampa.Activity.push({
            url:       '',
            title:     Lampa.Lang.translate('my_watch'),
            component: 'my_screen',
            movie:     cardData,
            search:    cardData.title,
            search_two: cardData.original_title,
            page:      1
        })
    }
}

// Register — uses a setter that appends to an internal array.
// Multiple plugins can each register their own manifest.
Lampa.Manifest.plugins = manifest
```

### `cardData` Object Shape

The object passed to `onContextLauch` contains the card's API data:

| Field | Type | Description |
|---|---|---|
| `id` | number | TMDB/CUB content ID |
| `title` | string | Localised title |
| `name` | string | Series title (TV only) |
| `original_title` | string | Original (usually English) title |
| `original_name` | string | Original series name (TV only) |
| `imdb_id` | string | IMDb ID — see note below |
| `source` | string | `'tmdb'` or `'cub'` |
| `release_date` | string | `'YYYY-MM-DD'` |
| `first_air_date` | string | First air date (TV only) |
| `vote_average` | number | Rating |
| `poster_path` | string | TMDB poster path |

> **`imdb_id` note:** When `source == 'tmdb'`, the IMDb ID may not be populated in the card object. The app automatically fetches it before calling `onContextLauch` if your manifest is registered via the `Lampa.Manifest.plugins =` setter. You do not need to handle this fetch yourself.

### Multiple Plugins in the Context Menu

Each plugin that registers a manifest with `type: 'video'` gets its own entry under the "Plugins" heading in the card context menu. There is no limit on the number of plugins.

---

## Sidebar Menu Item

Add an item to the main left-side navigation menu.

```js
function addMenuItem() {
    let button = $(`
        <li class="menu__item selector">
            <div class="menu__ico">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <!-- your icon path -->
                    <rect width="44" height="44" rx="6" fill="currentColor" opacity="0.15"/>
                </svg>
            </div>
            <div class="menu__text">${Lampa.Lang.translate('my_title')}</div>
        </li>
    `)

    button.on('hover:enter', () => {
        Lampa.Activity.push({
            url:       '',
            title:     Lampa.Lang.translate('my_title'),
            component: 'my_screen',
            page:      1
        })
    })

    // Append to the first (main) menu list
    $('.menu .menu__list').eq(0).append(button)
}
```

> **Note:** `.eq(0)` selects the primary navigation list. Use `.eq(1)` for the secondary (bottom) menu list if appropriate.

---

## Complete Plugin Entry Point Example

```js
function startMyPlugin() {
    window.my_plugin_ready = true

    Lampa.Lang.add({
        my_title: { ru: 'Мой плагин', en: 'My Plugin' },
        my_watch: { ru: 'Смотреть',   en: 'Watch'     }
    })

    let manifest = {
        type:    'video',
        version: '1.0.0',
        name:    'My Plugin',
        description: 'Stream content from My Source',

        onContextMenu: (card) => ({
            name: Lampa.Lang.translate('my_watch'),
            description: ''
        }),

        onContextLauch: (card) => {
            if (!Lampa.Component.get('my_plugin_screen')) {
                Lampa.Component.add('my_plugin_screen', MyScreen)
            }
            Lampa.Activity.push({
                url:        '',
                title:      Lampa.Lang.translate('my_watch'),
                component:  'my_plugin_screen',
                movie:      card,
                search:     card.title,
                search_two: card.original_title,
                page:       1
            })
        }
    }

    function init() {
        Lampa.Component.add('my_plugin_screen', MyScreen)
        Lampa.Manifest.plugins = manifest

        // Add settings section
        Lampa.SettingsApi.addComponent({
            component: 'my_plugin',
            name:      Lampa.Lang.translate('my_title'),
            icon:      '<svg>…</svg>'
        })

        // Add sidebar menu entry
        let btn = $(`<li class="menu__item selector">
            <div class="menu__ico"><svg>…</svg></div>
            <div class="menu__text">${Lampa.Lang.translate('my_title')}</div>
        </li>`)
        btn.on('hover:enter', () => Lampa.Activity.push({
            url: '', title: Lampa.Lang.translate('my_title'),
            component: 'my_plugin_screen', page: 1
        }))
        $('.menu .menu__list').eq(0).append(btn)
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', e => { if (e.type == 'ready') init() })
}

if (!window.my_plugin_ready) startMyPlugin()
```

---

[← Settings API](08-settings.md) · [Index](README.md) · **Next: [Player Integration →](10-player.md)**
