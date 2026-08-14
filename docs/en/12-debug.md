[← Pitfalls](11-pitfalls.md) · [Index](README.md) · **Next: [Controller & TV Navigation →](13-controller.md)**

---

# Debug & Logging

## Logging Convention

The entire app uses a consistent `console.log('ModuleName', 'message', data)` pattern. Follow it so your output is easy to filter in DevTools:

```js
console.log('MyPlugin', 'init')
console.log('MyPlugin', 'response:', data)
console.log('MyPlugin', 'user:', Lampa.Account.logged() ? 'logged in' : 'guest')
console.warn('MyPlugin', 'retry after error:', reason)
console.error('MyPlugin', 'fatal:', e.message, e.stack)
```

In DevTools Console, filter by `MyPlugin` to see only your output. The app itself logs startup sequence under prefixes like `App`, `Storage`, `Plugins`, `Account`, etc.

---

## Useful Runtime Diagnostics

```js
// App version (string and numeric)
console.log('MyPlugin', 'app_version:', Lampa.Manifest.app_version)
console.log('MyPlugin', 'app_digital:', Lampa.Manifest.app_digital) // 328 for v3.2.8

// Current platform
console.log('MyPlugin', 'platform:', Lampa.Storage.get('platform', 'noname'))

// Detected screen type
console.log('MyPlugin', 'is tv:',     Lampa.Platform.screen('tv'))
console.log('MyPlugin', 'is mobile:', Lampa.Platform.screen('mobile'))
console.log('MyPlugin', 'is desktop:', Lampa.Platform.desktop())

// Account state
console.log('MyPlugin', 'logged:', Lampa.Account.logged())

// All loaded plugins
console.log('MyPlugin', 'loaded plugins:', Lampa.Plugins.loaded())

// Registered manifest plugins
console.log('MyPlugin', 'manifest plugins:', Lampa.Manifest.plugins)
```

---

## Development Builds (Source Mode)

When working inside the app's source tree:

```bash
# Standard dev build — watch + BrowserSync at http://localhost:3000
npm run start

# Debug build — identical but includes inline sourcemaps
npm run debug
```

With `npm run debug`, DevTools shows your original source files and breakpoints work correctly. Without it, the compiled IIFE is hard to debug.

---

## Testing Locally

1. Run `npm run start` and open `http://localhost:3000` in a desktop browser.
2. The `browser` platform is detected automatically — all Lampa UI is available.
3. Open DevTools (F12). The Console shows the full module init log on every page load.
4. To load your external plugin URL: go to **Settings → Extensions** and add the URL.
5. To test a plugin built into the source tree, place it under `plugins/` and let the watch task rebuild.

### Breakpoints in the IIFE

If you can't use debug builds, you can add a `debugger` statement in your source and the browser will pause even inside a minified IIFE:

```js
function startMyPlugin() {
    window.my_plugin_ready = true
    debugger // DevTools will pause here
    // …
}
```

---

## Version Guards

Use version checks to safely adopt newer APIs while remaining compatible with older app versions:

```js
if (Lampa.Manifest.app_digital >= 300) {
    // v3.0+ APIs: Lampa.Maker, modular Card architecture
    Lampa.Maker.make('Main', data, callback)
} else {
    // Legacy fallback
    let comp = new Lampa.InteractionMain(object)
}
```

---

## Startup Timing Reference

Understanding when each system is available:

| Phase | Available |
|---|---|
| Plugin script injected | `window.Lampa.*` (all classes/modules) |
| Plugin script injected | `Lampa.Storage`, `Lampa.Lang`, `Lampa.Template` (safe to call) |
| `app:start` event | Boot sequence began — most modules still initialising |
| `app:ready` event | **Everything is safe** — UI, Activity, Settings, Menu, Player |
| `Player:start` event | Player opened — `Lampa.PlayerVideo.*` now valid |
| `Player:destroy` event | Player closed — remove all PlayerVideo listeners |

---

[← Pitfalls](11-pitfalls.md) · [Index](README.md) · **Next: [Controller & TV Navigation →](13-controller.md)**
