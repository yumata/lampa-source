[← Manifest & Menu](09-manifest-menu.md) · [Index](README.md) · **Next: [Pitfalls →](11-pitfalls.md)**

---

# Player Integration

## Standard Player Plugin Pattern

Subscribe to `Player:start`, do your work, and clean up everything inside `Player:destroy`.

```js
Lampa.Player.listener.follow('start', (data) => {
    // data.url          — stream URL
    // data.title        — display title
    // data.movie        — card object
    // data.torrent_hash — hash string (if playing from torrent)
    // data.id           — file index within torrent

    let inited = true

    // ── PlayerVideo handlers ────────────────────────────────────────

    function onCanPlay() {
        if (!inited) return
        // Video element is ready. Safe to read PlayerVideo.video()
        let videoEl = Lampa.PlayerVideo.video()
        console.log('duration:', videoEl.duration)

        Lampa.PlayerVideo.listener.remove('canplay', onCanPlay)
    }

    function onTimeUpdate(e) {
        if (!inited) return
        console.log('position:', e.current, '/', e.duration)
    }

    function onEnded() {
        if (!inited) return
        console.log('video finished')
    }

    function onError(e) {
        console.error('playback error:', e.error, 'fatal:', e.fatal)
    }

    // ── Destroy handler — MUST remove all PlayerVideo listeners ─────

    function onDestroy() {
        inited = false

        Lampa.PlayerVideo.listener.remove('canplay',    onCanPlay)
        Lampa.PlayerVideo.listener.remove('timeupdate', onTimeUpdate)
        Lampa.PlayerVideo.listener.remove('ended',      onEnded)
        Lampa.PlayerVideo.listener.remove('error',      onError)
        Lampa.Player.listener.remove('destroy',         onDestroy)
    }

    // ── Subscribe ───────────────────────────────────────────────────

    Lampa.PlayerVideo.listener.follow('canplay',    onCanPlay)
    Lampa.PlayerVideo.listener.follow('timeupdate', onTimeUpdate)
    Lampa.PlayerVideo.listener.follow('ended',      onEnded)
    Lampa.PlayerVideo.listener.follow('error',      onError)
    Lampa.Player.listener.follow('destroy',         onDestroy)
})
```

---

## Intercepting Player Launch

Use the `create` event to inspect or cancel a playback request before it starts:

```js
Lampa.Player.listener.follow('create', (data) => {
    // data.data  — the full playback data object
    // data.abort — call this to cancel the player launch

    if (isBlocked(data.data.movie)) {
        data.abort()
        Lampa.Noty.show('This content is not available', { style: 'error' })
    }
})
```

---

## Overriding Audio Tracks and Subtitles

Plugins can replace the player panel's track and subtitle lists with enriched metadata (e.g. human-readable language names fetched from ffprobe).

```js
// Inside a 'start' handler, after fetching track metadata:

let enrichedTracks = [
    {
        index:    0,
        language: 'rus',
        label:    'Russian (Dolby Atmos)',
        selected: true,
        // The 'enabled' setter switches the actual HTML5 AudioTrack
        get enabled() {},
        set enabled(v) {
            let tracks = Lampa.PlayerVideo.video().audioTracks
            for (let i = 0; i < tracks.length; i++) tracks[i].enabled = false
            if (tracks[0]) { tracks[0].enabled = true; tracks[0].selected = true }
        }
    },
    {
        index:    1,
        language: 'eng',
        label:    'English',
        selected: false,
        get enabled() {},
        set enabled(v) { /* … */ }
    }
]

Lampa.PlayerPanel.setTracks(enrichedTracks)

// Same pattern for subtitles
Lampa.PlayerPanel.setSubs(enrichedSubs)
```

---

## WebOS-Specific Track Events

On WebOS the browser fires separate events for track lists:

```js
Lampa.PlayerVideo.listener.follow('webos_tracks', (data) => {
    // data.tracks — WebOS-specific audio track array
})

Lampa.PlayerVideo.listener.follow('webos_subs', (data) => {
    // data.subs — WebOS-specific subtitle track array
})
```

---

## Torrent-Aware Player Plugins

When the player opens a torrent file, `data.torrent_hash` and `data.id` are set:

```js
Lampa.Player.listener.follow('start', (data) => {
    if (!data.torrent_hash) return  // not a torrent, skip

    console.log('torrent hash:', data.torrent_hash)
    console.log('file index:',  data.id)
    console.log('url:',         data.url)

    // Fetch external metadata (e.g. ffprobe) using the torrent hash
})
```

---

## Torrent File List Events

When the user opens the torrent file browser (before selecting a file to play):

```js
let listOpen = false

Lampa.Listener.follow('torrent_file', (data) => {
    if (data.type == 'list_open')  listOpen = true
    if (data.type == 'list_close') listOpen = false

    if (data.type == 'render' && listOpen) {
        // data.item    — the jQuery row element just rendered
        // data.element — the file data object
        // data.items   — all file items in the list

        // Example: inject info after each row
        if (data.items.length === 1) {
            fetchAndInjectMetadata(data)
        }
    }
})
```

---

[← Manifest & Menu](09-manifest-menu.md) · [Index](README.md) · **Next: [Pitfalls →](11-pitfalls.md)**
