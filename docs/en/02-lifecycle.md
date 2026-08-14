[← Getting Started](01-getting-started.md) · [Index](README.md) · **Next: [Events →](03-events.md)**

---

# Lifecycle

## Plugin Lifecycle Stages

```
1. Script injected
   └─ Browser executes the IIFE.
      window.Lampa already exists (populated before app boot).

2. Guard check
   └─ if (!window.my_plugin_ready) — prevents double execution.

3. appready check
   └─ If window.appready is true → call init() immediately.
      Otherwise → subscribe to Lampa.Listener 'app:ready'.

4. init()
   └─ Register templates, lang strings, components, manifest,
      settings, menu items, global event listeners.

5. User opens your screen
   └─ Lampa.Activity.push({ component: 'my_screen', ... })
      → Component.create(object) is called
      → component.create() must return the root DOM element.

6. component.start()
   └─ Called when the screen becomes the active/focused view.

7. component.stop()
   └─ Called when another screen slides on top (component is
      still alive in the stack, just not focused).

8. component.destroy()   ← CRITICAL
   └─ Called when the activity is popped from the stack.
      Cancel network requests. Remove event listeners. Clean DOM.
```

---

## Component Class Contract

The activity system calls these methods at the appropriate times. All are optional except `create()` and `render()`.

```js
function MyComponent(object) {
    // object = everything passed to Activity.push()
    // object.component, object.url, object.title, object.page,
    // + any custom keys you added (movie, search, etc.)

    let network = new Lampa.Reguest()
    let scroll  = new Lampa.Scroll({ mask: true, over: true })
    let html    = Lampa.Template.get('my_template', {})
    let inited  = false

    // ── create() ─────────────────────────────────────────────────────
    // Called once. Must return a DOM element synchronously.
    // Use this.activity.loader(true) to show the built-in spinner.
    this.create = function() {
        this.activity.loader(true)
        inited = true

        network.get(buildUrl(object), (data) => {
            if (!inited) return // guard against late responses after destroy
            this.activity.loader(false)
            renderData(data)
        }, this.empty.bind(this))

        return this.render()
    }

    // ── start() ──────────────────────────────────────────────────────
    // Called every time this screen gains focus (after create, and
    // after returning from a screen that was pushed on top).
    this.start = function() {
        // Re-set keyboard controller if needed
    }

    // ── stop() ───────────────────────────────────────────────────────
    // Called when another screen is pushed on top. The component
    // stays in memory — do not destroy resources here.
    this.stop = function() {}

    // ── destroy() ────────────────────────────────────────────────────
    // Called when the user navigates back past this screen.
    // MUST clean up everything to prevent memory leaks.
    this.destroy = function() {
        inited = false
        network.clear()
        scroll.destroy()
        html.remove()
    }

    // ── render() ─────────────────────────────────────────────────────
    // Returns the root DOM element. Called by the system — do not
    // call it yourself from create(), just return this.render().
    this.render = function() {
        return scroll.render()
    }

    // ── empty() ──────────────────────────────────────────────────────
    // Called when the data source returns no results or errors.
    // Typically show an empty-state template.
    this.empty = function() {
        this.activity.loader(false)
        this.activity.empty()
    }

    // ── Internal helpers ─────────────────────────────────────────────
    function buildUrl(object) {
        return 'https://api.example.com/search?q=' + encodeURIComponent(object.search || '')
    }

    function renderData(data) {
        // populate scroll with items
    }
}
```

---

## `this.activity` Reference

Inside a component, `this.activity` provides access to the activity slot that hosts your component:

| Method | Description |
|---|---|
| `this.activity.loader(bool)` | Show / hide the loading spinner |
| `this.activity.empty()` | Show the built-in "nothing found" empty state |
| `this.activity.replace(params)` | Update the current activity's data without a new history entry |
| `this.activity.toggle()` | Toggle active state |

---

## The `inited` Flag Pattern

Network requests are asynchronous. When the user navigates away before a response arrives, the callback fires into a destroyed component. Always guard with a boolean flag:

```js
let inited = false

this.create = function() {
    inited = true
    network.get(url, (data) => {
        if (!inited) return  // component was destroyed, ignore response
        renderData(data)
    })
    return this.render()
}

this.destroy = function() {
    inited = false  // future callbacks will bail immediately
    network.clear() // also cancel in-flight XHR
}
```

---

[← Getting Started](01-getting-started.md) · [Index](README.md) · **Next: [Events →](03-events.md)**
