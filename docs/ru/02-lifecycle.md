[← Начало работы](01-getting-started.md) · [Содержание](README.md) · **Далее: [Система событий →](03-events.md)**

---

# Жизненный цикл

## Стадии жизненного цикла плагина

```
1. Скрипт внедрён
   └─ Браузер выполняет IIFE.
      window.Lampa уже существует (заполнено до загрузки приложения).

2. Проверка защиты
   └─ if (!window.my_plugin_ready) — предотвращает двойное выполнение.

3. Проверка appready
   └─ Если window.appready == true → вызвать init() немедленно.
      Иначе → подписаться на Lampa.Listener 'app:ready'.

4. init()
   └─ Регистрация шаблонов, строк локализации, компонентов,
      манифеста, настроек, пунктов меню, глобальных слушателей.

5. Пользователь открывает ваш экран
   └─ Lampa.Activity.push({ component: 'my_screen', ... })
      → Component.create(object)
      → component.create() должен синхронно вернуть DOM-элемент.

6. component.start()
   └─ Вызывается, когда экран становится активным / в фокусе.

7. component.stop()
   └─ Вызывается, когда поверх открывается другой экран
      (компонент остаётся живым в стеке, просто не в фокусе).

8. component.destroy()   ← КРИТИЧНО
   └─ Вызывается, когда activity убирается из стека.
      Отменить сетевые запросы. Удалить слушателей событий. Очистить DOM.
```

---

## Контракт класса компонента

Система activity вызывает эти методы в нужное время. Все необязательны, кроме `create()` и `render()`.

```js
function MyComponent(object) {
    // object = всё, что было передано в Activity.push()
    // object.component, object.url, object.title, object.page,
    // + любые пользовательские ключи (movie, search и т.д.)

    let network = new Lampa.Reguest()
    let scroll  = new Lampa.Scroll({ mask: true, over: true })
    let html    = Lampa.Template.get('my_template', {})
    let inited  = false

    // ── create() ─────────────────────────────────────────────────────
    // Вызывается один раз. Должен синхронно вернуть DOM-элемент.
    // Используйте this.activity.loader(true) для показа спиннера.
    this.create = function() {
        this.activity.loader(true)
        inited = true

        network.get(buildUrl(object), (data) => {
            if (!inited) return // защита от позднего ответа после destroy
            this.activity.loader(false)
            renderData(data)
        }, this.empty.bind(this))

        return this.render()
    }

    // ── start() ──────────────────────────────────────────────────────
    // Вызывается каждый раз, когда экран получает фокус (после create
    // и после возврата с экрана, открытого поверх).
    this.start = function() {}

    // ── stop() ───────────────────────────────────────────────────────
    // Вызывается, когда поверх открывается другой экран.
    // Компонент остаётся в памяти — не освобождайте ресурсы здесь.
    this.stop = function() {}

    // ── destroy() ────────────────────────────────────────────────────
    // Вызывается при навигации назад мимо этого экрана.
    // ОБЯЗАТЕЛЬНО очистите всё, чтобы избежать утечек памяти.
    this.destroy = function() {
        inited = false
        network.clear()
        scroll.destroy()
        html.remove()
    }

    // ── render() ─────────────────────────────────────────────────────
    // Возвращает корневой DOM-элемент. Вызывается системой —
    // не вызывайте напрямую из create(), просто верните this.render().
    this.render = function() {
        return scroll.render()
    }

    // ── empty() ──────────────────────────────────────────────────────
    // Вызывается, когда источник данных не вернул результатов или ошибка.
    // Обычно показывает шаблон пустого состояния.
    this.empty = function() {
        this.activity.loader(false)
        this.activity.empty()
    }

    function buildUrl(object) {
        return 'https://api.example.com/search?q=' + encodeURIComponent(object.search || '')
    }

    function renderData(data) {
        // заполнить scroll элементами
    }
}
```

---

## Справочник `this.activity`

Внутри компонента `this.activity` предоставляет доступ к слоту activity:

| Метод | Описание |
|---|---|
| `this.activity.loader(bool)` | Показать / скрыть спиннер загрузки |
| `this.activity.empty()` | Показать встроенное состояние «ничего не найдено» |
| `this.activity.replace(params)` | Обновить данные текущей activity без новой записи в истории |
| `this.activity.toggle()` | Переключить состояние активности |

---

## Паттерн флага `inited`

Сетевые запросы асинхронны. Когда пользователь уходит с экрана до прихода ответа, колбэк выполняется в уже уничтоженном компоненте. Всегда защищайтесь булевым флагом:

```js
let inited = false

this.create = function() {
    inited = true
    network.get(url, (data) => {
        if (!inited) return  // компонент уничтожен, игнорируем ответ
        renderData(data)
    })
    return this.render()
}

this.destroy = function() {
    inited = false  // будущие колбэки сразу выходят
    network.clear() // отменяем текущий XHR
}
```

---

[← Начало работы](01-getting-started.md) · [Содержание](README.md) · **Далее: [Система событий →](03-events.md)**
