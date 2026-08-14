[← Player Integration](10-player.md) · [Index](README.md) · **Next: [Debug & Logging →](12-debug.md)**

---

# Pitfalls

## 1. Missing Double-Load Guard

**Symptom:** Duplicate menu items, settings appear twice, event listeners fire multiple times.

**Cause:** The plugin file is loaded again on re-install or when the app rebuilds the extension list.

```js
// ❌ Wrong — no guard
function startMyPlugin() { … }
startMyPlugin()

// ✅ Correct
function startMyPlugin() {
    window.my_plugin_ready = true
    // …
}
if (!window.my_plugin_ready) startMyPlugin()
```

---

## 2. Touching the UI Before `appready`

**Symptom:** `TypeError: Cannot read properties of null` on startup, settings don't appear, menu item missing.

**Cause:** Calling `Activity.push()`, reading `.menu__list`, or accessing Settings before the app is ready.

```js
// ❌ Wrong — called at plugin body level
Lampa.Activity.push({ component: 'my_screen', … })

// ✅ Correct
function init() {
    Lampa.Activity.push({ … })
    // register menu, settings, etc.
}

if (window.appready) init()
else Lampa.Listener.follow('app', e => { if (e.type == 'ready') init() })
```

---

## 3. PlayerVideo Listener Leaks

**Symptom:** Callbacks fire multiple times (2×, 4×, 8×…) when the player is opened more than once per session. Memory grows with each playback.

**Cause:** Subscriptions added in `Player:start` are never removed. The PlayerVideo module is recreated on every player open, but old listeners persist.

```js
// ❌ Wrong — subscriptions accumulate
Lampa.Player.listener.follow('start', () => {
    Lampa.PlayerVideo.listener.follow('ended', () => {
        // fires 2× on second video, 3× on third, etc.
    })
})

// ✅ Correct — always remove in destroy
Lampa.Player.listener.follow('start', () => {
    function onEnded() { doSomething() }

    function onDestroy() {
        Lampa.PlayerVideo.listener.remove('ended', onEnded)
        Lampa.Player.listener.remove('destroy', onDestroy)
    }

    Lampa.PlayerVideo.listener.follow('ended', onEnded)
    Lampa.Player.listener.follow('destroy', onDestroy)
})
```

---

## 4. Late Network Callbacks After Destroy

**Symptom:** JavaScript errors like "Cannot set properties of undefined" after navigating away mid-request.

**Cause:** A network response arrives after `destroy()` has been called and cleaned up the DOM.

```js
// ❌ Wrong — no guard
this.create = function() {
    network.get(url, (data) => {
        html.find('.title').text(data.title) // html may already be removed
    })
    return this.render()
}

// ✅ Correct — inited flag + network.clear()
let inited = false

this.create = function() {
    inited = true
    network.get(url, (data) => {
        if (!inited) return
        html.find('.title').text(data.title)
    })
    return this.render()
}

this.destroy = function() {
    inited = false
    network.clear()
    html.remove()
}
```

---

## 5. Using Vanilla DOM Events Instead of jQuery

**Symptom:** `hover:enter` never fires; clicks not registered on TV remotes.

**Cause:** The app's custom events (`hover:enter`, `hover:focus`, `hover:hover`, `hover:touch`) are dispatched only through jQuery. `addEventListener` does not receive them.

```js
// ❌ Wrong
element.addEventListener('hover:enter', handler)

// ✅ Correct
$(element).on('hover:enter', handler)
// or, since most Template.get() calls return jQuery objects already:
el.on('hover:enter', handler)
```

---

## 6. Storage Key Collisions

**Symptom:** A setting changes unexpectedly; another plugin's value gets overwritten.

**Cause:** Both the app and all plugins share the same `localStorage` namespace. Generic keys like `token`, `url`, `quality` are already used.

```js
// ❌ Wrong
Lampa.Storage.set('token', myToken)
Lampa.Storage.set('url', serverUrl)

// ✅ Correct — prefix with your plugin name
Lampa.Storage.set('myplugin_token', myToken)
Lampa.Storage.set('myplugin_server_url', serverUrl)
```

---

## 7. Overwriting `window.lampa_settings`

**Symptom:** Other plugins or app features stop working; features disappear from the UI.

**Cause:** Replacing the entire settings object destroys any configuration set by the app or other plugins.

```js
// ❌ Wrong — destroys all existing settings
window.lampa_settings = { torrents_use: true }

// ✅ Correct — extend without replacing
Lampa.Arrays.extend(window.lampa_settings, { torrents_use: true })
// or assign individual properties:
window.lampa_settings.torrents_use = true
```

---

## 8. CSS Injection Outside `init()`

**Symptom:** Plugin styles are overridden by the app's stylesheet because the `<style>` tag was appended before the app's CSS finished loading.

**Cause:** CSS injected at the top level of the plugin body runs before the app completes setup.

```js
// ❌ Wrong — runs before app styles
$('body').append(Lampa.Template.get('my_css', {}, true))

// ✅ Correct — inside init(), after appready
function init() {
    $('body').append(Lampa.Template.get('my_css', {}, true))
    // rest of setup…
}
```

---

[← Player Integration](10-player.md) · [Index](README.md) · **Next: [Debug & Logging →](12-debug.md)**
