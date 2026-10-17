[← Templates & Localization](05-templates-lang.md) · [Index](README.md) · **Next: [Navigation →](07-navigation.md)**

---

# UI Components

## Noty — Toast Notification

A small non-blocking notification that appears at the bottom of the screen and disappears automatically.

```js
// Simple message (3 s default)
Lampa.Noty.show('File saved')

// Custom duration
Lampa.Noty.show('Loading complete', { time: 5000 })

// Error style
Lampa.Noty.show('Connection failed', { style: 'error', time: 6000 })
```

> Use Noty for brief feedback only. For messages that require a user decision, use Select or Modal.

---

## Select — Bottom-Sheet Picker

A scrollable list of options that slides up from the bottom of the screen. Used for context menus, source selectors, quality pickers, etc.

```js
Lampa.Select.show({
    title: 'Choose source',

    items: [
        { title: 'Option A', subtitle: 'Secondary text' },
        { title: 'Divider label', separator: true },   // visual section divider
        { title: 'Option B' },
        { title: 'Hidden item', hide: true }            // not shown in list
    ],

    onSelect: (item) => {
        Lampa.Select.close()
        console.log('selected:', item.title)
    },

    onBack: () => {
        // Called on back/cancel — restore controller focus
        Lampa.Controller.toggle('content')
    }
})

// Close programmatically
Lampa.Select.close()
```

> **Focus management:** After `onBack`, always call `Lampa.Controller.toggle('content')` (or whichever controller was active before) to return keyboard focus correctly.

---

## Modal — Overlay Window

A centred overlay with a title, scrollable content area, and optional action buttons.

```js
Lampa.Modal.open({
    title: 'Track Info',

    // Any jQuery element or HTML string
    html: $('<div><p>Video: 1920×1080, H.264</p><p>Audio: AC3 5.1</p></div>'),

    // 'small' | 'medium' | 'large' | 'full'
    size: 'medium',

    // Align content: 'top' (default) | 'center'
    align: 'top',

    // Enable scroll mask
    mask: true,

    // Buttons at the bottom of the modal
    buttons: [
        {
            name: 'OK',
            onSelect: () => Lampa.Modal.close()
        },
        {
            name: 'Cancel',
            onSelect: () => Lampa.Modal.close()
        }
    ],

    // Called on back/escape key
    onBack: () => {
        Lampa.Modal.close()
        Lampa.Controller.toggle('content')
    }
})

// Update the title after opening
Lampa.Modal.title('New Title')

// Close programmatically
Lampa.Modal.close()
```

### Loading Modal

For async operations inside a modal:

```js
Lampa.Modal.open({
    title: 'Processing…',
    html: Lampa.Template.get('modal_loading'),
    size: 'small',
    onBack: () => { network.clear(); Lampa.Modal.close() }
})

// When done:
Lampa.Modal.close()
```

---

## Scroll — Scrollable Container

Use `Lampa.Scroll` to wrap any list of focusable elements and get TV-remote-friendly scrolling:

```js
let scroll = new Lampa.Scroll({ mask: true, over: true })

// Append items to the scroll body
scroll.append(itemElement)

// Clear all items
scroll.clear()

// Scroll to a specific element
scroll.update($(element), true)

// Subtract an element's height from the top offset
scroll.minus($('.files__left'))

// Reset scroll position to top
scroll.reset()

// Destroy (call in component.destroy)
scroll.destroy()

// The root DOM element to return from component.render()
scroll.render()
```

---

## Controller — Focus Management

The Controller manages which UI region (menu, content, settings, modal, player) holds keyboard/remote focus.

```js
// Switch focus to a named region
Lampa.Controller.toggle('content')
Lampa.Controller.toggle('menu')
Lampa.Controller.toggle('modal')
Lampa.Controller.toggle('player')

// Get the currently active region
let active = Lampa.Controller.enabled()  // { name: 'content', … }

// Navigate programmatically
Lampa.Controller.toContent()
Lampa.Controller.back()
```

> After opening Select or Modal, the controller switches automatically. When you close them in `onBack`, always restore focus to the previous controller.

### Nested windows

Modal and Select can be opened on top of already open windows, e.g. from a plugin while another modal or select is open.
The controller keeps a window stack:

- `Modal.open()` over an open modal hides the lower one; `Modal.close()` brings it back together with focus.
- `Select.show()` over an open select remembers the parent. Back returns to the parent with the previously
  focused item; selecting an item closes the whole branch.
- If right after closing a window you call `toggle('content')` (or the controller the window was opened from)
  while the window it was opened from is still open below, focus returns to that window instead. The other windows stay open.
  If the window was not opened from the window below (e.g. a select from the player with a modal underneath), your `toggle` wins.
- `Lampa.Controller.toContent()` and starting a new activity close all windows.
- Three quick Back presses (at most 500 ms apart) while something is open (window, select, console,
  player, search, settings) close everything and return focus to content — even if focus was lost.
- `Modal.closeAll()` / `Select.closeAll()` close everything without calling `onBack`.

You can register your own window in the stack:

```js
let win = Lampa.Controller.windowOpen('my_window')   // before Controller.toggle('my_window')

// on close: focus moves to the window below, if any
Lampa.Controller.windowClose(win)

Lampa.Controller.windowTop() // top window {name, below} or false
```

---

[← Templates & Localization](05-templates-lang.md) · [Index](README.md) · **Next: [Navigation →](07-navigation.md)**
