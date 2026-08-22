[← Дебаг](12-debug.md) · [Содержание](README.md)

---

# Controller и TV-навигация

> Источник: `src/core/controller.js`, `src/core/keypad.js`

## Как это работает

В Lampa фокусом управляет **Controller** — именованный регион, который владеет пультом/клавиатурой в текущий момент. Активным может быть только один контроллер. При открытии экрана вы регистрируете свой контроллер под именем и вызываете `Controller.toggle(name)`, чтобы захватить фокус.

Стрелки → `Keypad` → `Controller.move(direction)` → обработчик активного контроллера → `Navigator.move(direction)` → следующий `.selector`-элемент получает `hover:focus`.

---

## Класс `.selector`

Любой элемент с классом `selector` автоматически становится доступным для навигации. `MutationObserver` следит за DOM — достаточно просто добавить элемент с этим классом.

```js
let item = $('<div class="selector">Нажми меня</div>')

item.on('hover:focus', () => {
    // Стрелка пульта перевела фокус на этот элемент
})

item.on('hover:enter', () => {
    // Пользователь нажал OK / Enter
})

item.on('hover:long', () => {
    // Долгое удержание OK — 800 мс
})

item.on('hover:hover', () => {
    // Наведение мыши (только на ПК/браузере)
})

item.on('hover:touch', () => {
    // Touch start (мобильные/сенсорные устройства)
})
```

---

## Регистрация контроллера

Регистрируйте в `start()`, повторно регистрируйте после возврата с дочернего экрана:

```js
this.start = function() {
    Lampa.Controller.add('content', {
        // Вызывается при Controller.toggle('content')
        toggle: () => {
            // Сообщить Navigator'у, какие элементы фокусируемы
            Lampa.Controller.collectionSet(html)
            // Начальный фокус: последний запомненный или первый в списке
            Lampa.Controller.collectionFocus(last || false, html)
        },

        left: () => {
            if (Navigator.canmove('left')) Navigator.move('left')
            else Lampa.Controller.toggle('menu')  // уйти в боковое меню
        },
        right: () => { Navigator.move('right') },
        up: () => {
            if (Navigator.canmove('up')) Navigator.move('up')
            // иначе: ничего, или переключиться в регион шапки
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

## API Controller

| Метод | Описание |
|---|---|
| `Controller.add(name, handlers)` | Зарегистрировать именованный контроллер с обработчиками направлений |
| `Controller.toggle(name)` | Активировать именованный контроллер (захватить фокус) |
| `Controller.enabled()` | Возвращает `{ name, controller }` активного контроллера |
| `Controller.collectionSet(html)` | Установить пул `.selector`-элементов для Navigator |
| `Controller.collectionFocus(target, html)` | Перевести фокус на `target` или на первый элемент, если falsy |
| `Controller.collectionAppend(elements)` | Добавить элементы в пул Navigator |
| `Controller.focus(element)` | Напрямую сфокусироваться на конкретном элементе |
| `Controller.back()` | Вызвать обработчик `back` активного контроллера |
| `Controller.trigger(name)` | Вызвать любой именованный обработчик активного контроллера |
| `Controller.clear()` | Очистить пул Navigator |
| `Controller.toContent()` | Закрыть все оверлеи и вернуться к контенту |

---

## Имена обработчиков

Объект, передаваемый в `Controller.add()`, может содержать следующие ключи:

| Ключ | Срабатывает при |
|---|---|
| `toggle` | `Controller.toggle(name)` — когда ваш контроллер становится активным |
| `up` | Стрелка вверх |
| `down` | Стрелка вниз |
| `left` | Стрелка влево |
| `right` | Стрелка вправо |
| `back` | Кнопка «Назад» / Escape |
| `enter` | Кнопка OK / Enter (только при необходимости кастомной логики) |
| `long` | Долгое нажатие OK (800 мс) |
| `playpause` | Пробел / медиакнопка Play-Pause |
| `play` | Медиакнопка Play |
| `stop` | Медиакнопка Stop |
| `rewindBack` | Перемотка назад |
| `rewindForward` | Перемотка вперёд |
| `pause` | Медиакнопка Pause |
| `info` | Кнопка Info (keycode 457) |
| `gone` | Вызывается, когда другой контроллер перехватывает фокус |

---

## Сырые события клавиш через Keypad

Для глобальных хоткеев, работающих независимо от активного контроллера:

```js
// Именованные события направлений — срабатывают ДО обработки Controller'ом
Lampa.Keypad.listener.follow('left',  (e) => { /* стрелка влево */ })
Lampa.Keypad.listener.follow('right', (e) => { /* стрелка вправо */ })
Lampa.Keypad.listener.follow('up',    (e) => { /* стрелка вверх */ })
Lampa.Keypad.listener.follow('down',  (e) => { /* стрелка вниз */ })
Lampa.Keypad.listener.follow('enter', (e) => { /* OK нажат */ })
Lampa.Keypad.listener.follow('back',  (e) => { /* кнопка назад */ })

// Сырой keydown — любая клавиша, любая платформа
Lampa.Keypad.listener.follow('keydown', (e) => {
    console.log('код клавиши:', e.code)
})
```

> Всегда удаляйте слушатели Keypad в `destroy()` или `Player:destroy` — они глобальные и не привязаны к компоненту.

---

## Коды клавиш пульта

| Кнопка | Коды |
|---|---|
| ← Влево | `37`, `4` (Samsung Orsay) |
| ↑ Вверх | `38`, `29460` (Samsung Orsay) |
| → Вправо | `39`, `5` (Samsung Orsay) |
| ↓ Вниз | `40`, `29461` (Samsung Orsay) |
| OK / Enter | `13`, `29443` (Samsung Orsay), `65385` (Samsung Tizen) |
| Назад | `8` (браузер), `27` (Esc), `461` (LG), `10009` (Samsung), `88` (Samsung Orsay) |
| Page Up | `33` (LG), `427` (Samsung) |
| Page Down | `34` (LG), `428` (Samsung) |
| Play/Pause | `32` (пробел), `179`, `10252` (Samsung Tizen) |
| Play | `415`, `71` (Samsung Orsay) |
| Stop | `413`, `70` (Samsung Orsay) |
| Перемотка ← | `412`, `69` (Samsung Orsay), `177` |
| Перемотка → | `418`, `417`, `72` (Samsung Orsay), `176` |
| Pause | `19`, `74` (Samsung Orsay) |
| Info | `457` |
| Настройки | `10133` |

---

## Полный пример компонента

```js
function MyListComponent(object) {
    let scroll = new Lampa.Scroll({ mask: true, over: true })
    let last   = false

    // Создать элементы списка
    ;['Элемент А', 'Элемент Б', 'Элемент В'].forEach(title => {
        let el = $('<div class="selector">' + title + '</div>')

        el.on('hover:focus', () => {
            last = el   // запомнить для восстановления фокуса
        })

        el.on('hover:enter', () => {
            Lampa.Noty.show('Выбрано: ' + title)
        })

        el.on('hover:long', () => {
            Lampa.Noty.show('Долгое нажатие: ' + title)
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

[← Дебаг](12-debug.md) · [Содержание](README.md)
