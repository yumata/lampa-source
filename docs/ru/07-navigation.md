[← UI-компоненты](06-ui-components.md) · [Содержание](README.md) · **Далее: [API настроек →](08-settings.md)**

---

# Навигация

## Стек Activity

Lampa использует стековую модель навигации. Каждый вызов `Activity.push()` добавляет экран поверх стека. Кнопка «назад» удаляет его. Объект, переданный в `Activity.push()`, становится аргументом конструктора вашего компонента.

### `Activity.push(params)`

```js
Lampa.Activity.push({
    // Обязательные
    url:       '',                 // для истории/URL-состояния; может быть пустой строкой
    title:     'Результаты поиска', // отображается в шапке
    component: 'my_screen',        // должен быть зарегистрирован через Component.add()
    page:      1,                  // текущая страница пагинации

    // Любые дополнительные ключи передаются в конструктор компонента:
    search:    'во все тяжкие',
    source:    'tmdb',
    movie:     cardDataObject,
    clarification: false
})
```

### `Activity.replace(params)`

Обновляет данные **текущей** activity без добавления новой записи в историю. Компонент НЕ пересоздаётся — используйте это для передачи обновлённых параметров в `start()` после изменения фильтра/сортировки.

```js
// Внутри метода компонента:
Lampa.Activity.replace({ page: 2, search: 'новый запрос' })
```

### `Activity.backward()`

Удаляет текущую activity и возвращается к предыдущей.

```js
Lampa.Activity.backward()
```

### `Activity.active()`

Возвращает текущий объект activity на вершине стека.

```js
let current = Lampa.Activity.active()
console.log(current.component, current.title)
```

---

## Регистрация компонентов

Зарегистрируйте класс компонента по имени до вызова `Activity.push()` с этим именем. Делайте это один раз во время `init()`.

```js
function MyListComponent(object) {
    // object.search, object.page, object.title и т.д.
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

// Регистрация во время init()
function init() {
    Lampa.Component.add('my_list',   MyListComponent)
    Lampa.Component.add('my_detail', MyDetailComponent)
}
```

### Проверка регистрации

```js
// Получить зарегистрированный класс по имени
let Cls = Lampa.Component.get('my_list')

// Регистрировать только один раз (например, если manifest.onContextLauch сбрасывает шаблоны)
if (!Lampa.Component.get('my_screen')) {
    Lampa.Component.add('my_screen', MyScreen)
}
```

---

## Router

Router предоставляет именованные маршруты как ярлыки к `Activity.push()`. Применяет стандартные маппинги полей.

```js
// Навигация к встроенным маршрутам
Lampa.Router.call('full', cardData)          // Страница с деталями карточки
Lampa.Router.call('category', categoryData)  // Страница категории/обзора
Lampa.Router.call('actor', personData)       // Профиль актёра
```

---

## Пример многоэкранного плагина

```js
// Плагин с двумя экранами: список → деталь

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
    // object.item — передан из ListScreen
    let html = $('<div>' + object.item.title + '</div>')

    this.create  = function() { return this.render() }
    this.destroy = function() { html.remove() }
    this.render  = function() { return html }
}

function init() {
    Lampa.Component.add('myplugin_list',   ListScreen)
    Lampa.Component.add('myplugin_detail', DetailScreen)

    let btn = $('<li class="menu__item selector"><div class="menu__text">Мой плагин</div></li>')
    btn.on('hover:enter', () => Lampa.Activity.push({
        url: '', title: 'Мой плагин', component: 'myplugin_list', page: 1
    }))
    $('.menu .menu__list').eq(0).append(btn)
}
```

---

[← UI-компоненты](06-ui-components.md) · [Содержание](README.md) · **Далее: [API настроек →](08-settings.md)**
