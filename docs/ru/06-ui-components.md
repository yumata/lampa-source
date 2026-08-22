[← Шаблоны и локализация](05-templates-lang.md) · [Содержание](README.md) · **Далее: [Навигация →](07-navigation.md)**

---

# UI-компоненты

## Noty — всплывающее уведомление

Небольшое неблокирующее уведомление, которое появляется снизу экрана и исчезает автоматически.

```js
// Простое сообщение (по умолчанию 3 с)
Lampa.Noty.show('Файл сохранён')

// Произвольная продолжительность
Lampa.Noty.show('Загрузка завершена', { time: 5000 })

// Стиль ошибки
Lampa.Noty.show('Ошибка подключения', { style: 'error', time: 6000 })
```

> Используйте Noty только для краткой обратной связи. Для сообщений, требующих решения от пользователя, используйте Select или Modal.

---

## Select — выпадающий список (bottom-sheet)

Прокручиваемый список вариантов, выезжающий снизу экрана. Используется для контекстных меню, выбора источника, качества и т.д.

```js
Lampa.Select.show({
    title: 'Выберите источник',

    items: [
        { title: 'Вариант А', subtitle: 'Дополнительный текст' },
        { title: 'Разделитель', separator: true },   // визуальный разделитель
        { title: 'Вариант Б' },
        { title: 'Скрытый',   hide: true }           // не отображается в списке
    ],

    onSelect: (item) => {
        Lampa.Select.close()
        console.log('выбрано:', item.title)
    },

    onBack: () => {
        // Вызывается при отмене — восстановить фокус контроллера
        Lampa.Controller.toggle('content')
    }
})

// Закрыть программно
Lampa.Select.close()
```

> **Управление фокусом:** После `onBack` всегда вызывайте `Lampa.Controller.toggle('content')` (или тот контроллер, который был активен ранее), чтобы корректно вернуть фокус клавиатуры/пульта.

---

## Modal — модальное окно

Центрированный оверлей с заголовком, прокручиваемой областью контента и опциональными кнопками действий.

```js
Lampa.Modal.open({
    title: 'Информация о дорожках',

    // Любой jQuery-элемент или HTML-строка
    html: $('<div><p>Видео: 1920×1080, H.264</p><p>Аудио: AC3 5.1</p></div>'),

    // 'small' | 'medium' | 'large' | 'full'
    size: 'medium',

    // Выравнивание контента: 'top' (по умолчанию) | 'center'
    align: 'top',

    // Включить маску прокрутки
    mask: true,

    // Кнопки снизу модального окна
    buttons: [
        {
            name: 'OK',
            onSelect: () => Lampa.Modal.close()
        },
        {
            name: 'Отмена',
            onSelect: () => Lampa.Modal.close()
        }
    ],

    // Вызывается при нажатии кнопки «назад»/Escape
    onBack: () => {
        Lampa.Modal.close()
        Lampa.Controller.toggle('content')
    }
})

// Обновить заголовок после открытия
Lampa.Modal.title('Новый заголовок')

// Закрыть программно
Lampa.Modal.close()
```

---

## Scroll — прокручиваемый контейнер

Используйте `Lampa.Scroll` для оборачивания любого списка фокусируемых элементов с поддержкой навигации пультом:

```js
let scroll = new Lampa.Scroll({ mask: true, over: true })

// Добавить элементы в тело прокрутки
scroll.append(itemElement)

// Очистить все элементы
scroll.clear()

// Прокрутить к конкретному элементу
scroll.update($(element), true)

// Вычесть высоту элемента из верхнего отступа
scroll.minus($('.files__left'))

// Сбросить позицию прокрутки вверх
scroll.reset()

// Уничтожить (вызывать в component.destroy)
scroll.destroy()

// Корневой DOM-элемент для возврата из component.render()
scroll.render()
```

---

## Controller — управление фокусом

Controller управляет тем, какой регион UI (меню, контент, настройки, модал, плеер) держит фокус клавиатуры/пульта.

```js
// Переключить фокус на именованный регион
Lampa.Controller.toggle('content')
Lampa.Controller.toggle('menu')
Lampa.Controller.toggle('modal')
Lampa.Controller.toggle('player')

// Получить текущий активный регион
let active = Lampa.Controller.enabled()  // { name: 'content', … }

// Навигация программно
Lampa.Controller.toContent()
Lampa.Controller.back()
```

> При открытии Select или Modal контроллер переключается автоматически. Когда вы закрываете их в `onBack`, всегда восстанавливайте фокус на предыдущем контроллере.

---

[← Шаблоны и локализация](05-templates-lang.md) · [Содержание](README.md) · **Далее: [Навигация →](07-navigation.md)**
