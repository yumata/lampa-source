[← Index](README.md) · **Next: [Lifecycle →](02-lifecycle.md)**

---

# Overview & File Structure

## What is a Lampa Plugin?

Lampa plugins are standalone JavaScript files injected into the running app via a `<script>` tag. At runtime the app exposes all of its internals through `window.Lampa`, and your plugin interacts exclusively through that namespace — there is no bundler, no import system, no React.

**Plugins can:**

- Add new screens (Activity components) accessible from the main menu
- Add entries to the card context menu ("Watch with…")
- Register settings sections with toggle / select / text input controls
- React to player events to modify playback behaviour
- Inject CSS and custom HTML templates
- Read and write persistent user settings via Storage
- Communicate with external servers via the built-in HTTP wrapper

---

## File Structure

When built into the app source, each plugin lives in its own directory under `plugins/`. The directory name must match the entry-point filename.

```
plugins/
  my-plugin/
    my-plugin.js     ← Rollup entry point (bundled to IIFE)
    css/
      style.css      ← injected via Template at runtime
    component.js     ← split into separate files as needed
    api.js
```

**External plugins** (hosted on a URL and installed by users) follow the same pattern but are distributed as a single compiled file. The app fetches and injects them at startup.

> **Note on `@@include`:** The `@@include('../plugins/name/css/style.css')` syntax is a **build-time** directive processed by `gulp-file-include`. It inlines the CSS file into the compiled plugin JS. At runtime the `<style>` string is already embedded — you just append it to the body via Template.

---

## The Guard Pattern

Plugins can be loaded more than once — on re-install, or if the user adds the same URL twice. Without protection this duplicates menu items, event listeners, and templates.

**Always wrap your plugin in a uniquely-named function and a global flag guard:**

```js
function startMyPlugin() {
    // Prevents double execution on reload / re-install
    window.my_plugin_ready = true

    // … all plugin code …
}

if (!window.my_plugin_ready) startMyPlugin()
```

The global flag name must be unique across all plugins. Use a name derived from your plugin's name.

---

## The `appready` Guard

The app populates `window.Lampa` before the boot sequence, but many modules (Menu, Activity, Settings, Player) are not yet initialised at that point. Touching them before the `app:ready` event causes null-reference errors.

```js
function init() {
    // Safe to use ALL Lampa.* APIs here
    registerTemplates()
    registerComponents()
    addMenuItem()
}

// If the plugin loads after the app has fully started, appready is already true
if (window.appready) init()
else Lampa.Listener.follow('app', function(e) {
    if (e.type == 'ready') init()
})
```

> **Rule:** Never call `Lampa.Activity.push()`, read `.menu__list`, or interact with Settings outside of `init()`.

---

## Minimum Plugin Skeleton

```js
function startMyPlugin() {
    window.my_plugin_ready = true

    // ── Templates ──────────────────────────────────────────────────
    Lampa.Template.add('my_main', `
        <div class="my-plugin">
            <div class="my-plugin__title">{title}</div>
        </div>
    `)

    // ── Localization ───────────────────────────────────────────────
    Lampa.Lang.add({
        my_title: { ru: 'Мой плагин', en: 'My Plugin' }
    })

    // ── Component ──────────────────────────────────────────────────
    function MyComponent(object) {
        let html = Lampa.Template.get('my_main', { title: 'Hello' })

        this.create  = function() { return this.render() }
        this.start   = function() {}
        this.stop    = function() {}
        this.destroy = function() { html.remove() }
        this.render  = function() { return html }
    }

    // ── Register & wire up ─────────────────────────────────────────
    function init() {
        Lampa.Component.add('my_plugin_screen', MyComponent)

        let btn = $('<li class="menu__item selector"><div class="menu__text">' +
                    Lampa.Lang.translate('my_title') + '</div></li>')

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

## Version Compatibility

```js
// Numeric version for comparisons (e.g. 3.2.8 → 328)
if (Lampa.Manifest.app_digital >= 300) {
    // Safe to use v3.0+ APIs (Maker, modular cards, etc.)
}

// String version for display
console.log('App version:', Lampa.Manifest.app_version) // "3.2.8"
```

---

[← Index](README.md) · **Next: [Lifecycle →](02-lifecycle.md)**
