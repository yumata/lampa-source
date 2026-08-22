[← Events](03-events.md) · [Index](README.md) · **Next: [Templates & Localization →](05-templates-lang.md)**

---

# Storage & Network

## Storage

The Storage module wraps `localStorage` with an IndexedDB cache layer for resilience. All values are JSON-serialised automatically.

### Reading & Writing

```js
// Read a value — returns defaultValue if the key is missing
let token = Lampa.Storage.get('myplugin_token', '')

// Write a value
Lampa.Storage.set('myplugin_token', 'abc123')

// Read as a parsed settings value (respects Params / SettingsApi overrides)
// Use this for keys registered via SettingsApi.addParam()
let quality = Lampa.Storage.field('myplugin_quality') // 'high'
```

### Array Operations

```js
// Append a value to a stored array (creates the array if it doesn't exist)
Lampa.Storage.add('myplugin_history', { id: 123, title: 'Movie' })

// Remove a specific item from a stored array (by reference equality)
Lampa.Storage.remove('myplugin_history', itemObject)
```

### Cached Objects

`Storage.cache()` reads a stored object and automatically trims it to `maxSize` entries when you write it back:

```js
// Read (or initialise) a cache object
let cache = Lampa.Storage.cache('myplugin_results', 200, {})

// Use it like a plain object
cache['movie-123'] = { title: 'Breaking Bad', rating: 9.5 }

// Persist — internally trims to 200 entries (oldest dropped first)
Lampa.Storage.set('myplugin_results', cache)
```

### Naming Convention

> **Prefix every key** with a plugin-specific namespace to avoid collisions with the app or other plugins.
>
> ✅ `myplugin_token`, `myplugin_server_url`, `myplugin_quality`
> ❌ `token`, `url`, `quality`

### Storage Events

```js
Lampa.Storage.listener.follow('change', (e) => {
    // e.name  — the key that changed
    // e.value — the new value
})
```

---

## HTTP / Network

`Lampa.Reguest` is a jQuery-ajax wrapper that integrates with the app's loading indicator and proxy/mirror system.

### Instantiation

**Always create a new instance per component** so you can call `network.clear()` in `destroy()`:

```js
function MyComponent(object) {
    let network = new Lampa.Reguest()
    network.timeout(1000 * 15)  // 15 s (default is 30 s)

    this.destroy = function() {
        network.clear()  // cancels all pending XHR for this component
    }
}
```

### Methods

#### `get(url, onSuccess, onError, postData?)`

Shows the app's loading overlay. Cancels any previous `get()` call on the same instance.

```js
network.get(
    'https://api.example.com/movies',
    (data) => { console.log('got', data) },
    (error) => { console.error('fail', error) }
)

// POST request
network.get(url, onSuccess, onError, { query: 'batman' })
```

#### `silent(url, onSuccess, onError, postData?, params?)`

No loading overlay — use for background requests. Does not cancel previous calls.

```js
network.silent(
    'https://api.example.com/check',
    (data) => { updateStatus(data) },
    () => {},           // error handler
    null,               // no POST data
    { timeout: 5000 }   // optional params override
)
```

#### `quiet(url, onSuccess, onError, postData?)`

No loading overlay, does not store a reference (cannot `again()`). For fire-and-forget calls.

```js
network.quiet(url, onSuccess, onError)
```

#### `last(url, onSuccess, onError, postData?)`

Cancels the previous call and starts a new one. Ideal for search-as-you-type.

```js
input.on('input', () => {
    network.last(
        apiUrl + '?q=' + encodeURIComponent(input.val()),
        renderResults,
        showError
    )
})
```

#### `native(url, onSuccess, onError, postData?, params?)`

Returns the raw response string instead of parsed JSON. Pass `dataType: 'text'` in params.

```js
network.native(
    'https://example.com/manifest.m3u8',
    (rawText) => { parseM3U(rawText) },
    onError,
    null,
    { dataType: 'text' }
)
```

### Error Handling

```js
network.get(url,
    (data) => { /* success */ },
    (jqXHR, exception) => {
        let message = network.errorDecode(jqXHR, exception)
        let code    = network.errorCode(jqXHR)
        let json    = network.errorJSON(jqXHR)

        Lampa.Noty.show('Error: ' + message, { style: 'error' })
    }
)
```

### Other Methods

```js
network.clear()     // cancel all pending requests from this instance
network.again()     // repeat the last request
network.latest()    // returns the jQuery XHR object of the last request
```

---

[← Events](03-events.md) · [Index](README.md) · **Next: [Templates & Localization →](05-templates-lang.md)**
