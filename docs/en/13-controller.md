[← Debug](12-debug.md) · [Index](README.md)

---

# Controller & TV Navigation

> Source: `src/core/controller.js`, `src/core/keypad.js`

## How it works

Lampa manages focus through a **Controller** — a named region that owns the remote/keyboard at any given moment. Only one controller is active at a time. When you push a screen, you register your controller under a name and call `Controller.toggle(name)` to claim focus.

Arrow keys → `Keypad` → `Controller.move(direction)` → active controller's handler → `Navigator.move(direction)` → next `.selector` element gets `hover:focus`.

---

## The `.selector` class

Any element with the `selector` class is automatically discoverable by the navigation system. A `MutationObserver` watches the DOM — adding `.selector` elements is enough.

```js
let item = $('<div class="selector">Press me</div>')

item.on('hover:focus', () => {
    // Arrow key moved focus onto this element
})

item.on('hover:enter', () => {
    // User pressed OK / Enter
})

item.on('hover:long', () => {
    // Long-press OK held for 800 ms
})

item.on('hover:hover', () => {
    // Mouse hover (desktop/browser only)
})

item.on('hover:touch', () => {
    // Touch start (mobile/touch devices)
})
```

---

## Registering a controller

Register in `start()`, re-register after returning from a child screen:

```js
this.start = function() {
    Lampa.Controller.add('content', {
        // Called when Controller.toggle('content') fires
        toggle: () => {
            // Tell Navigator which elements are focusable
            Lampa.Controller.collectionSet(html)
            // Set initial focus: last remembered element or first in list
            Lampa.Controller.collectionFocus(last || false, html)
        },

        left: () => {
            if (Navigator.canmove('left')) Navigator.move('left')
            else Lampa.Controller.toggle('menu')  // leave to sidebar
        },
        right: () => { Navigator.move('right') },
        up: () => {
            if (Navigator.canmove('up')) Navigator.move('up')
            // else: do nothing, or switch to a header region
        },
        down: () => {
            if (Navigator.canmove('down')) Navigator.move('down')
        },

        back: () => {
            Lampa.Activity.backward()
        }
    })

    Lampa.Controller.toggle('content')
}
```

---

## Controller API

| Method | Description |
|---|---|
| `Controller.add(name, handlers)` | Register a named controller with direction handlers |
| `Controller.toggle(name)` | Activate a named controller (claims focus) |
| `Controller.enabled()` | Returns `{ name, controller }` of the active controller |
| `Controller.collectionSet(html)` | Set the pool of `.selector` elements for Navigator |
| `Controller.collectionFocus(target, html)` | Move focus to `target`, or first element if falsy |
| `Controller.collectionAppend(elements)` | Add more elements to the Navigator pool |
| `Controller.focus(element)` | Focus a specific element directly |
| `Controller.back()` | Call the active controller's `back` handler |
| `Controller.trigger(name)` | Call any named handler on the active controller |
| `Controller.clear()` | Clear the Navigator pool |
| `Controller.toContent()` | Close all overlays and return to content |

---

## Handler names

The object passed to `Controller.add()` can have these keys:

| Key | Triggered by |
|---|---|
| `toggle` | `Controller.toggle(name)` — called when your controller becomes active |
| `up` | Arrow Up |
| `down` | Arrow Down |
| `left` | Arrow Left |
| `right` | Arrow Right |
| `back` | Back / Escape button |
| `enter` | OK / Enter button (use only if you need custom enter logic) |
| `long` | Long-press OK (800 ms) |
| `playpause` | Space / Play-Pause media key |
| `play` | Play media key |
| `stop` | Stop media key |
| `rewindBack` | Rewind backward media key |
| `rewindForward` | Rewind forward media key |
| `pause` | Pause media key |
| `info` | Info button (keycode 457) |
| `gone` | Called when another controller claims focus away from yours |

---

## Raw key events via Keypad

For global hotkeys that work regardless of which controller is active:

```js
// Named direction events — fired before Controller processes them
Lampa.Keypad.listener.follow('left',  (e) => { /* arrow left */ })
Lampa.Keypad.listener.follow('right', (e) => { /* arrow right */ })
Lampa.Keypad.listener.follow('up',    (e) => { /* arrow up */ })
Lampa.Keypad.listener.follow('down',  (e) => { /* arrow down */ })
Lampa.Keypad.listener.follow('enter', (e) => { /* OK confirmed */ })
Lampa.Keypad.listener.follow('back',  (e) => { /* back button */ })

// Raw keydown — any key, any platform
Lampa.Keypad.listener.follow('keydown', (e) => {
    console.log('key code:', e.code)
})
```

> Always remove Keypad listeners in `destroy()` or `Player:destroy` — they are global and not scoped to a component.

---

## Remote control key codes

| Button | Key codes |
|---|---|
| ← Left | `37`, `4` (Samsung Orsay) |
| ↑ Up | `38`, `29460` (Samsung Orsay) |
| → Right | `39`, `5` (Samsung Orsay) |
| ↓ Down | `40`, `29461` (Samsung Orsay) |
| OK / Enter | `13`, `29443` (Samsung Orsay), `65385` (Samsung Tizen) |
| Back | `8` (browser), `27` (Esc), `461` (LG), `10009` (Samsung), `88` (Samsung Orsay) |
| Page Up | `33` (LG), `427` (Samsung) |
| Page Down | `34` (LG), `428` (Samsung) |
| Play/Pause | `32` (Space), `179`, `10252` (Samsung Tizen) |
| Play | `415`, `71` (Samsung Orsay) |
| Stop | `413`, `70` (Samsung Orsay) |
| Rewind ← | `412`, `69` (Samsung Orsay), `177` |
| Rewind → | `418`, `417`, `72` (Samsung Orsay), `176` |
| Pause | `19`, `74` (Samsung Orsay) |
| Info | `457` |
| Settings | `10133` |

---

## Full component example

```js
function MyListComponent(object) {
    let scroll = new Lampa.Scroll({ mask: true, over: true })
    let last   = false

    // Build list items
    ;['Item A', 'Item B', 'Item C'].forEach(title => {
        let el = $('<div class="selector">' + title + '</div>')

        el.on('hover:focus', () => {
            last = el   // remember last focused for back-navigation
        })

        el.on('hover:enter', () => {
            Lampa.Noty.show('Selected: ' + title)
        })

        el.on('hover:long', () => {
            Lampa.Noty.show('Long press: ' + title)
        })

        scroll.append(el)
    })

    this.create = function() { return this.render() }

    this.start = function() {
        Lampa.Controller.add('content', {
            toggle: () => {
                Lampa.Controller.collectionSet(scroll.render())
                Lampa.Controller.collectionFocus(last || false, scroll.render())
            },
            left:  () => { Lampa.Controller.toggle('menu') },
            right: () => { Navigator.move('right') },
            up:    () => {
                if (Navigator.canmove('up')) Navigator.move('up')
            },
            down:  () => {
                if (Navigator.canmove('down')) Navigator.move('down')
            },
            back:  () => { Lampa.Activity.backward() }
        })

        Lampa.Controller.toggle('content')
    }

    this.stop    = function() {}
    this.destroy = function() { scroll.destroy() }
    this.render  = function() { return scroll.render() }
}
```

---

[← Debug](12-debug.md) · [Index](README.md)
