# Migration Guide: 2.4.7 → 3.0.0

В версии 3.0.0 было переписано ядро и изменено API.  Некоторая часть элементов перешло на модульную структуру.


#### Проверка версии
Используйте для проверки версии лампы 3.0 и выше:
```js
if(Lampa.Manifest.app_digital >= 300){
    ...
}
```

---

## Модульные классы
Это позволяет гибко настраивать поведение и внешний вид классов. Помимо этого, некоторые классы устарели и будут удалены в будущих версиях. Устаревшие классы: `Lampa.Card` `Lampa.InteractionMain` `Lampa.InteractionCategory` `Lampa.InteractionLine`

### Пример перехода на модульную структуру
Было:
```js
let Main = new Lampa.InteractionMain(object)

Main.create = function(){
    this.activity.loader(true)

    let next = Api.main(object,this.build.bind(this),this.empty.bind(this))

    if(typeof next == 'function') this.next = next

    return this.render()
}
```
Стало:
```js
let Main = Lampa.Maker.make('Main',{
    title: '...',
    results: [...],
}, (module)=>module.toggle(module.MASK.base, 'Callback'))

// или

let Main = Lampa.Maker.make('Main',{
    title: '...',
    results: [...],
}, (module)=>module.only('Create'))

// или

let data = {
    title: '...',
    results: [...],
    params: {
        module: Lampa.Maker.module('Main').only('Create')
    }
}

let classMain = Lampa.Maker.get('Main')

let Main = new classMain(data)

// далее подписка на события

Main.use({
    onCreate: function(){
        Api.main(object,this.build.bind(this),this.empty.bind(this))
    }
})
```

### Lampa.Maker
Специальный класс для создания модульных классов. Основные функции:

`Lampa.Maker.make('Main', data, (module)=>...)` — создает экземпляр класса `Main` с переданными данными и модулями, которые нужно подключить. Функция в третьем параметре получает объект `module`, с помощью которого можно подключать модули.

`Lampa.Maker.get('Main')` — возвращает класс `Main`, который можно использовать для создания экземпляра.

`Lampa.Maker.module('Main')` — возвращает экземпляр класса `Lampa.MaskHelper` для класса `Main`. Финкции класса `MaskHelper` можно посмотреть в `src/utils/mask.js`

`Lampa.Maker.list()` — возвращает список всех доступных классов.

`Lampa.Maker.module('Main').moduleNames` — возвращает список всех доступных модулей для класса `Main`

`Lampa.Maker.module('Main').MASK.base` — возвращает числовое значение для базового набора модулей класса `Main`. Это те модули, которые используются по умолчанию.

`Lampa.Maker.map('Main')` - возвращает объект с картой модулей для класса `Main`. Модуль в карте можно заменить на другой. Например, `Lampa.Maker.map('Main').Create = {onCreateAndAppend: function(){...}}` или заменить метод внутри модуля `Lampa.Maker.map('Main').Create.onCreateAndAppend = function(){...}`

### Пример создания компонента Main
```js
function component(object){
    let comp = Lampa.Maker.make('Main', object)

    comp.use({
        onCreate: function(){
            this.build([
                {
                    title: '...',
                    results: [...],
                },
                ...
            ])
        },
        onInstance: function(item, data){
            item.use({
                onMore: Router.call.bind(Router, 'category_full', data),
                onInstance: function(card, data){
                    card.use({
                        onEnter: Router.call.bind(Router, 'full', data),
                        onFocus: function(){
                            Background.change(Utils.cardImgBackground(data))
                        }
                    })
                }
            })
        }
    })

    return comp
}
```

Что тут происходит:
1. Создается экземпляр класса `Main` с переданными данными object.
2. С помощью метода `use` добавляются обработчики событий для класса `Main`.
3. В обработчике `onCreate` вызывается API метода `build`, который строит структуру из переданных данных.
4. В обработчике `onInstance` возвращается каждый созданный элемент `Line`, для которого также добавляются обработчики событий.
5. Для каждого элемента `Line` в обработчике `onInstance` возвращается каждый элемент `Card`, для которого также добавляются обработчики событий.



Структура будет выглядеть так:
```
Main
 ├── Line
 │    ├── Card
 │    ├── Card
 │    └── ...
 ├── Line
 │    ├── Card
 │    ├── Card
 │    └── ...
 └── ...
```
Стоит отметить, что обработчики событий можно добавлять на любом уровне вложенности и любое количество обработчиков.

### Пример создания класса Card
Допустим мы хотим создать упрошенную карточку с заголовком и обработчиком нажатия:
```js
let card = Lampa.Maker.make('Card', {
    title: '...',
}, (module)=>module.only('Create', 'Callback'))

card.use({
    onFocus: function(){
        Background.change(Utils.cardImgBackground(this.data))
    },
    onEnter: function(){
        Router.call('full', this.data)
    }
})
```

В `module` мы подключаем только два модуля: `Create` и `Callback`. Модуль `Create` отвечает за создание карточки, а `Callback` за обработку событий. В обработчике `use` мы добавляем два события: `onFocus` и `onEnter`.

Мы можем добавить еще обработчики:
```js
card.use({
    onEnter: function(){
        ...
    }
})
```

Но в этом случае сработает два вызова `onEnter`. Чтобы этого избежать, можно использовать метод `only`:
```js
card.use({
    onlyEnter: function(){
        // Этот обработчик будет приоритетнее обычного onEnter и сработает только он 
    }
})
```
---

## Структура ответов API
В ответах можно также использовать параметр `params` для передачи дополнительных настроек классов. Поля `card_wide`, `card_small`, `card_broad`, `card_collection`, `card_category`, `card_events`, `cardClass`, `nomore`, `type`, больше не используются.

Было:
```js
{
    title: '...',
    results: [],
    page: 1,
    total_pages: 10,
    total_results: 200,

    // Было
    card_collection: true,
    cardClass: function(){...},
    nomore: true,
}
```
Теперь исользуется единое поле `params`, в том числе и в `results`:
```js
{
    title: '...',
    results: [
        {
            title: '...',
            params: {
                ...
            }
        }
    ],
    page: 1,
    total_pages: 10,
    total_results: 200,

    params: {
        ...
    }
}
```

### Параметр `params`
Это поле используется во всех классах на модульной основе. Вот основные параметры:  

`module` — числовое значение, определяющее какие модули использовать для класса.  
`emit` — подписка на события модуля.  
`createInstance` — создание экземпляра кастомного класса.  

Структура:
```
params
 ├── module
 ├── emit
 ├── createInstance
 └── module_params
      ├── items
      ├── style
      └── ...
```

### Передача параметров в модулю
В `params` можно передавать параметры для модулей. Название параметра называется так же, как и модуль. Если модуль называется `Items`, то параметры для него нужно передавать в `items`.
```js
{
    title: '...',
    results: [
        {
            title: '...',
            params: {
                // параметры для модуля Items
                items: {
                    mapping: 'line',
                    align_left: false,
                    view: 7
                }
            }
        }
    ],

    params: {
        ...
    }
}
```

### Пример с карточками
Представим что в ответе нам нужно показать коллекцию фильмов в виде широких карточек. Раньше мы бы использовали `card_wide: true`, теперь нужно использовать `params`:
```js
{
    title: '...',
    results: [
        {
            title: '...',
            params: {
                // style - модулю Style мы передаем параметры
                style: {
                    // используем стиль wide
                    name: 'wide', 
                }
            }
        }
    ],

    // Параметры для класса Line
    params: {
        ...
    }
}
```

### Пример с `createInstance` и `emit`
Допустим нам вместо карточки `Card` нужно использовать другой класс, тут поможет параметр `createInstance`:
```js
{
    title: '...',
    results: [
        {
            title: '...',
            params: {
                // создаем экземпляр класса CardParser
                createInstance: (item_data)=> Lampa.Maker.make('CardParser', item_data) 
            }
        },
        {
            title: '...',
            params: {
                // создаем экземпляр класса Episode с модулями Line и Callback
                createInstance: (item_data)=> Lampa.Maker.make('Episode', item_data, (module)=>module.only('Line','Callback')),

                // подписываемся на события
                emit: { 
                    
                    onFocus: function(){
                        ...
                    },
                    // приоритетный обработчик события onEnter
                    onlyEnter: function(){
                        ...
                    }
                }
            }
        }
    ],

    // параметры для класса Line
    icon_svg: Template.string('icon_fire'),
    icon_bgcolor: '#fff',
    icon_color: '#fd4518',

    params: {
        // включаем модуль Icon для класса Line
        module: Lampa.Maker.module('Line').toggle('Icon') 
    }
}
```

---

## Исправления необходимые при переходе

В компонентах где используется класс `Empty` нужно заменить строку:
```js
// было
let empty = new Lampa.Empty()
this.start = empty.start

// стало
let empty = new Lampa.Empty()
this.start = empty.start.bind(empty)
```

### Lampa.Favorite
В классе `Lampa.Favorite` больше не нужно вызывать метод `init`, вместо этого нужно вызвать метод `read`.
```js
// было
Lampa.Favorite.init()
// стало
Lampa.Favorite.read()
// для совместимости с предыдущими версиями можно оставить инициализацию
Lampa.Favorite.init()
```

### Добавление источника в ответы API
Отныне в ответы API нужно добавлять источник данных. Для этого используется метод `Utils.addSource(data, source)`, где `data` — ответ API, `source` — строковое значение источника, например, `tmdb`, `cub` и т.д.

```js
// было
oncomplite(data)

// стало
oncomplite(Lampa.Utils.addSource(data, 'tmdb'))

// или вручную для каждого элемента
data.results.forEach((item)=>{
    item.source = 'tmdb'
})
oncomplite(data)
```

... допешу позже что я еще исправлял :)

## Новые функции и методы
Новые функции и методы, которые можно использовать в своих компонентах, обязательно проверка версии лампы 3.0 и выше.

### Lampa.Maker
Вышеописанные функции `Lampa.Maker.make`, `Lampa.Maker.get`, `Lampa.Maker.module` и их использование.

### Lampa.MaskHelper
Класс для работы с масками, может вам пригодится. Функционал описан в `src/utils/mask.js`

### Lampa.Modal
Добавлен метод `Lampa.Modal.opened()`, который возвращает true, если открыто модальное окно.

### Lampa.Network
Добавлен глобальный класс `Lampa.Network`, который можно использовать для сетевых запросов. Функционал описан в `src/utils/reguest.js`

### Lampa.ContentRows
Глобальный класс для работы с основными рядами контента. Например, чтобы добавить ряд на главный экран или в категорию, пример:

```js
Lampa.ContentRows.add({
    index: 1,
    screen: ['main', 'category'],
    call: (params, screen)=>{
        // возвращаем функцию с коллбеком
        return function(call){
            call({
                results: [...],
                title: '...',
            })
        }
    }
})
```

`index` — позиция ряда, чем меньше число, тем выше ряд.  
`screen` — на каких экранах показывать ряд, может быть `main`, `category`  
`call` — функция, которая вызывается для получения данных ряда. Функция должна вернуть другую функцию с коллбеком, в который нужно передать объект с полями `results`, `title` и другими, которые описаны выше в разделе "Структура ответов API".

Старый метод `onMain: (data)=>{}` который используется в манифесте плагина, теперь не работает. Но вы можете его оставить для совместимости, конфликтов с `Lampa.ContentRows` не будет.

### Lampa.Platform
`Lampa.Platform.tvbox()` - метод который возвращает true, если устройство является ТВ-боксом.  
`Lampa.Platform.mouse()` - если устройство с мышью или включена мышь.

### Lampa.Head
`Lampa.Head.addaddElement(element, action)` - добавляет элемент в шапку.
```js
let elem = Lampa.Head.addaddElement(document.createElement('div'), ()=>{
    // вызывается при нажатии на элемент
})
elem.addClass('my_class')
```
`Lampa.Head.addIcon(svg_icon, action)` - добавляет иконку в шапку.
```js
let icon = Lampa.Head.addIcon('<svg....>', ()=>{
    // вызывается при нажатии на иконку
})
icon.addClass('my_class')
```

### Lampa.Menu
`Lampa.Menu.addaddElement(element, action)` - добавляет элемент в меню.
```js
let elem = Lampa.Menu.addaddElement(document.createElement('div'), ()=>{
    // вызывается при нажатии на элемент
})
elem.addClass('my_class')
```
`Lampa.Menu.addButton(svg_icon, title, action)` - добавляет кнопку в меню.
```js
let button = Lampa.Menu.addButton('<svg....>', 'Название' , ()=>{
    // вызывается при нажатии на кнопку
})
button.addClass('my_class')
```

### Добавлено событие state:changed
`Lampa.Listener.on('state:changed', (e)=>{})` - вызывается при изменении состояния лампы, например, при смене профиля, избранного, таймкода и т.д. В объекте `e` есть дополнительные поля:

`e.targer` - тип изменения, доступные типы: `favorite`, `timeline`, `timetable`  
`e.reason` - причина изменения, доступные причины отличаются в зависимости от типа. Например, для `favorite` доступны: `update`, `clear`, `profile`, `read`, `protocol`  

### Lampa.Timer
Глобальный класс для управления таймерами, которые срабатывают только когда приложение активно.

`Lampa.Timer.add(interval, callback, immediate = false)` - добавляет таймер, который будет срабатывать через `interval` миллисекунд. Если `immediate` true, то таймер сработает сразу как только приложение получит фокус.
`Lampa.Timer.remove(callback)` - удаляет таймер по функции обратного вызова.

```js
Lampa.Timer.add(1000 * 60 * 5, ()=>{
    // сработает каждые 5 минут
})
```

### Кеширование запросов
В классе `Lampa.Request` добавлена возможность кеширования запросов. В объекте настроек запроса можно использовать параметр `cache`. Например:
```js
let network = new Lampa.Request()

network.silent('https://...', ()=>{}, ()=>{}, false, {
    cache: {
        life: 30 // время жизни кеша в минутах
    }
})
```
В этом примере ответ запроса будет закеширован на 30 минут. Если в течении 30 минут будет выполнен такой же запрос, то ответ вернется из кеша, а не будет сделан новый сетевой запрос. Кеш хранится в `indexedDB`, назване ключа кеша формируется из `URL + POST данных + выбранный язык TMDB`