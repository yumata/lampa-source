[← UI Components](06-ui-components.md) · [Index](README.md) · **Next: [Settings API →](08-settings.md)**

---

# Navigation

## Activity Stack

Lampa uses a stack-based navigation model. Each call to `Activity.push()` adds a screen on top of the stack. The back button pops it. The `object` you pass becomes the constructor argument for your component.

### `Activity.push(params)`

```js
Lampa.Activity.push({
    // Required
    url:       '',               // used for history/URL state; can be empty string
    title:     'Search Results', // shown in the head bar
    component: 'my_screen',      // must be registered with Component.add()
    page:      1,                // current pagination page

    // Any additional keys are passed through to your component constructor:
    search:    'breaking bad',
    source:    'tmdb',
    movie:     cardDataObject,
    clarification: false
})
```

### `Activity.replace(params)`

Updates the **current** activity's data without adding a new history entry. The component is NOT re-created — use this to pass updated parameters to `start()` after a filter/sort change.

```js
// Inside a component method:
Lampa.Activity.replace({ search: newQuery, clarification: true })
```

### `Activity.backward()`

Removes the current activity and returns to the previous one.

```js
Lampa.Activity.backward()
```

### `Activity.active()`

Returns the current top-of-stack activity object.

```js
let current = Lampa.Activity.active()
console.log(current.component, current.title)
```

---

## Component Registration

Register your component class by name before calling `Activity.push()` with that name. Do this once during `init()`.

```js
function MyListComponent(object) {
    // object.search, object.page, object.title, etc.
    let html = Lampa.Template.get('my_list', {})

    this.create  = function() { return this.render() }
    this.start   = function() {}
    this.stop    = function() {}
    this.destroy = function() { html.remove() }
    this.render  = function() { return html }
}

function MyDetailComponent(object) {
    // …
}

// Register during init()
function init() {
    Lampa.Component.add('my_list',   MyListComponent)
    Lampa.Component.add('my_detail', MyDetailComponent)
}
```

### Checking Registration

```js
// Get a registered class by name
let Cls = Lampa.Component.get('my_list')

// Add only once (e.g. if manifest.onContextLauch resets templates)
if (!Lampa.Component.get('my_screen')) {
    Lampa.Component.add('my_screen', MyScreen)
}
```

---

## Router

The Router provides named routes as shortcuts to `Activity.push()`. It applies default field mappings so you don't have to repeat them.

```js
// Navigate to built-in routes
Lampa.Router.call('full', cardData)           // Card detail page
Lampa.Router.call('category', categoryData)   // Category/browse page
Lampa.Router.call('actor', personData)        // Actor profile

// The Router also calls Activity.push() under the hood,
// so you can use Activity.push() directly for custom components.
```

---

## Multi-Screen Plugin Example

```js
// Two-screen plugin: list → detail

function ListScreen(object) {
    let scroll = new Lampa.Scroll({ mask: true, over: true })
    let net    = new Lampa.Reguest()
    let inited = false

    this.create = function() {
        inited = true
        this.activity.loader(true)

        net.get('https://api.example.com/items', (data) => {
            if (!inited) return
            this.activity.loader(false)

            data.items.forEach(item => {
                let el = $('<div class="selector">' + item.title + '</div>')

                el.on('hover:enter', () => {
                    Lampa.Activity.push({
                        url:       '',
                        title:     item.title,
                        component: 'myplugin_detail',
                        item:      item,
                        page:      1
                    })
                })

                scroll.append(el)
            })
        }, this.empty.bind(this))

        return this.render()
    }

    this.destroy = function() { inited = false; net.clear(); scroll.destroy() }
    this.render  = function() { return scroll.render() }
    this.empty   = function() { this.activity.loader(false); this.activity.empty() }
}

function DetailScreen(object) {
    // object.item — passed from ListScreen
    let html = $('<div>' + object.item.title + '</div>')

    this.create  = function() { return this.render() }
    this.destroy = function() { html.remove() }
    this.render  = function() { return html }
}

function init() {
    Lampa.Component.add('myplugin_list',   ListScreen)
    Lampa.Component.add('myplugin_detail', DetailScreen)

    let btn = $('<li class="menu__item selector"><div class="menu__text">My Plugin</div></li>')
    btn.on('hover:enter', () => Lampa.Activity.push({
        url: '', title: 'My Plugin', component: 'myplugin_list', page: 1
    }))
    $('.menu .menu__list').eq(0).append(btn)
}
```

---

[← UI Components](06-ui-components.md) · [Index](README.md) · **Next: [Settings API →](08-settings.md)**
