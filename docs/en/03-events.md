[← Lifecycle](02-lifecycle.md) · [Index](README.md) · **Next: [Storage & Network →](04-storage-network.md)**

---

# Events System

## How It Works

The event system is based on `Subscribe()` — a lightweight pub/sub factory. Every module that emits events exposes its own `listener` instance. You subscribe with `.follow(type, fn)` and unsubscribe with `.remove(type, fn)`.

```js
// Subscribe
Lampa.Player.listener.follow('start', onPlayerStart)

// Unsubscribe (always do this in destroy())
Lampa.Player.listener.remove('start', onPlayerStart)

// Subscribe to multiple event types at once
Lampa.PlayerVideo.listener.follow('play,pause', onPlaybackChange)
```

> **Always store your handler in a named variable** so you can pass the same reference to `.remove()`. Anonymous functions cannot be removed.

---

## Creating Your Own Event Bus

For internal plugin communication between modules, create a private bus:

```js
let bus = Lampa.Subscribe()

// In one module
bus.follow('data_loaded', (data) => { renderList(data) })

// In another module
bus.send('data_loaded', { items: result })

// Check if a listener is registered
bus.has('data_loaded', myHandler) // → true / false
```

---

## Global App Events — `Lampa.Listener`

These are the events fired on the single application-wide bus.

### `app`

Fired at key points in the application boot sequence.

```js
Lampa.Listener.follow('app', (e) => {
    if (e.type == 'start') {
        // App boot sequence has begun.
        // Most modules are NOT ready yet.
    }
    if (e.type == 'ready') {
        // App fully loaded — all Lampa.* APIs are safe to use.
    }
})
```

### `activity`

Fired by the navigation system on every screen transition.

```js
Lampa.Listener.follow('activity', (e) => {
    // e.type      — 'create' | 'init' | 'start' | 'destroy' | 'archive'
    // e.component — string name of the component (e.g. 'full', 'main')
    // e.object    — the activity data object

    if (e.type == 'destroy' && e.component == 'full') {
        // User left the card detail screen
    }
})
```

### `full`

Events from the card detail page (the full-info screen).

```js
Lampa.Listener.follow('full', (e) => {
    // Various card-detail lifecycle events
})
```

### `torrent` / `torrent_file`

```js
Lampa.Listener.follow('torrent', (e) => {
    // Torrent search and management events
})

Lampa.Listener.follow('torrent_file', (e) => {
    // e.type == 'list_open'  — torrent file list opened
    // e.type == 'list_close' — torrent file list closed
    // e.type == 'render'     — e.item (jQuery), e.element (file data), e.items[]
})
```

### `line`

Fired by content rows (horizontal scroll lines of cards).

```js
Lampa.Listener.follow('line', (e) => {
    // Content row events
})
```

### `resize_start` / `resize_end`

```js
Lampa.Listener.follow('resize_start', () => { /* window resize began */ })
Lampa.Listener.follow('resize_end',   () => { /* window resize settled */ })
```

### `request_before` / `request_error` / `request_secuses`

Fired by the global network layer around requests that show a loading indicator.

---

## Player Events — `Lampa.Player.listener`

### `create`

Fired before the player opens. You can abort the launch.

```js
Lampa.Player.listener.follow('create', (data) => {
    // data.data   — full playback data object
    // data.abort  — call this function to cancel the player launch
    if (shouldBlock(data.data)) data.abort()
})
```

### `start`

Fired when the player has opened and is about to load the video.

```js
Lampa.Player.listener.follow('start', (data) => {
    // data.url          — stream URL
    // data.title        — display title
    // data.movie        — card object (id, title, original_title, …)
    // data.torrent_hash — hash string if playing from torrent
    // data.id           — file index in torrent
})
```

### `ready`

Fired when the video element has been created and the stream is loading.

```js
Lampa.Player.listener.follow('ready', (data) => {
    // Same shape as 'start' data
})
```

### `destroy`

Fired when the player closes. **Remove all PlayerVideo listeners here.**

```js
Lampa.Player.listener.follow('destroy', () => {
    // Clean up everything registered during 'start'
})
```

### `external`

Fired when a file is about to open in an external player app.

```js
Lampa.Player.listener.follow('external', (data) => {
    // data.url — the URL being passed to the external player
})
```

---

## PlayerVideo Events — `Lampa.PlayerVideo.listener`

> **Important:** The PlayerVideo module is recreated on every player open. Subscribe inside a `Player:start` handler, and always remove inside a `Player:destroy` handler.

| Event | Payload | Description |
|---|---|---|
| `canplay` | `{}` | Video ready to play |
| `timeupdate` | `{duration, current}` | Playback position (seconds) |
| `ended` | `{}` | Video finished |
| `error` | `{error: string, fatal: bool}` | Playback error |
| `play` | `{}` | Playback resumed |
| `pause` | `{}` | Playback paused |
| `rewind` | `{}` | Seek operation performed |
| `tracks` | `{tracks: AudioTrackList}` | Audio tracks available |
| `subs` | `{subs: TextTrackList}` | Subtitle tracks available |
| `levels` | `{levels: [], current: string}` | HLS quality levels |
| `progress` | `{down: string}` | Buffer download progress |
| `loadeddata` | `{}` | Media metadata loaded |
| `videosize` | `{width, height}` | Video dimensions known |
| `translate` | `{where, translate}` | HLS manifest track names |
| `reset_continue` | `{}` | Continue-watching timecode reset |

```js
Lampa.Player.listener.follow('start', (data) => {
    function onEnded() {
        console.log('Video finished')
        Lampa.PlayerVideo.listener.remove('ended', onEnded)
    }

    function onDestroy() {
        Lampa.PlayerVideo.listener.remove('ended', onEnded)
        Lampa.Player.listener.remove('destroy', onDestroy)
    }

    Lampa.PlayerVideo.listener.follow('ended',   onEnded)
    Lampa.Player.listener.follow('destroy', onDestroy)
})
```

---

## Storage Events — `Lampa.Storage.listener`

| Event | Payload | Description |
|---|---|---|
| `change` | `{name, value}` | A key was written with `Storage.set()` |
| `add` | `{name, value}` | A value was appended with `Storage.add()` |
| `clear` | `{full}` | Storage was cleared |

```js
Lampa.Storage.listener.follow('change', (e) => {
    if (e.name == 'myplugin_token') refreshToken(e.value)
})
```

---

## Favorite Events — `Lampa.Favorite.listener`

| Event | Payload | Description |
|---|---|---|
| `add` | `{where, card}` | Card added to a category |
| `added` | `{where, card}` | After the add was persisted |
| `remove` | `{where, card}` | Card removed from a category |

`where` is the category name: `'like'`, `'wath'`, `'history'`, `'book'`, etc.

---

[← Lifecycle](02-lifecycle.md) · [Index](README.md) · **Next: [Storage & Network →](04-storage-network.md)**
