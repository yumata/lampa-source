[← Система событий](03-events.md) · [Содержание](README.md) · **Далее: [Шаблоны и локализация →](05-templates-lang.md)**

---

# Хранилище и сеть

## Storage (хранилище)

Модуль Storage оборачивает `localStorage` слоем кэша IndexedDB для надёжности. Все значения автоматически сериализуются через JSON.

### Чтение и запись

```js
// Чтение значения — возвращает defaultValue, если ключ отсутствует
let token = Lampa.Storage.get('myplugin_token', '')

// Запись значения
Lampa.Storage.set('myplugin_token', 'abc123')

// Чтение как значения настройки (учитывает переопределения Params / SettingsApi)
// Используйте для ключей, зарегистрированных через SettingsApi.addParam()
let quality = Lampa.Storage.field('myplugin_quality') // 'high'
```

### Операции с массивами

```js
// Добавить значение в массив по ключу (создаёт массив, если его нет)
Lampa.Storage.add('myplugin_history', { id: 123, title: 'Фильм' })

// Удалить конкретный элемент из массива (по ссылочному равенству)
Lampa.Storage.remove('myplugin_history', itemObject)
```

### Кэшируемые объекты

`Storage.cache()` читает сохранённый объект и автоматически обрезает его до `maxSize` записей при следующей записи:

```js
// Прочитать (или инициализировать) объект кэша
let cache = Lampa.Storage.cache('myplugin_results', 200, {})

// Использовать как обычный объект
cache['movie-123'] = { title: 'Во все тяжкие', rating: 9.5 }

// Сохранить — внутри обрезает до 200 записей (удаляет старые)
Lampa.Storage.set('myplugin_results', cache)
```

### Соглашение по именованию

> **Используйте префикс** в виде пространства имён плагина для каждого ключа, чтобы избежать коллизий с приложением или другими плагинами.
>
> ✅ `myplugin_token`, `myplugin_server_url`, `myplugin_quality`  
> ❌ `token`, `url`, `quality`

---

## HTTP / Сеть

`Lampa.Reguest` — обёртка над jQuery-ajax, интегрированная с индикатором загрузки и системой прокси/зеркал.

### Создание экземпляра

**Всегда создавайте новый экземпляр для каждого компонента**, чтобы вызвать `network.clear()` в `destroy()`:

```js
function MyComponent(object) {
    let network = new Lampa.Reguest()
    network.timeout(1000 * 15)  // 15 с (по умолчанию 30 с)

    this.destroy = function() {
        network.clear()  // отменяет все незавершённые XHR этого компонента
    }
}
```

### Методы

#### `get(url, onSuccess, onError, postData?)`

Показывает оверлей загрузки приложения. Отменяет предыдущий вызов `get()` на том же экземпляре.

```js
network.get(
    'https://api.example.com/movies',
    (data) => { console.log('получено', data) },
    (error) => { console.error('ошибка', error) }
)

// POST-запрос
network.get(url, onSuccess, onError, { query: 'batman' })
```

#### `silent(url, onSuccess, onError, postData?, params?)`

Без оверлея загрузки — для фоновых запросов. Не отменяет предыдущие вызовы.

```js
network.silent(
    'https://api.example.com/check',
    (data) => { updateStatus(data) },
    () => {},             // обработчик ошибки
    null,                 // без POST-данных
    { timeout: 5000 }     // опциональное переопределение параметров
)
```

#### `quiet(url, onSuccess, onError, postData?)`

Без оверлея, без сохранения ссылки (нельзя вызвать `again()`). Для «выстрел и забыл».

```js
network.quiet(url, onSuccess, onError)
```

#### `last(url, onSuccess, onError, postData?)`

Отменяет предыдущий вызов и запускает новый. Идеально для поиска по мере ввода.

```js
input.on('input', () => {
    network.last(
        apiUrl + '?q=' + encodeURIComponent(input.val()),
        renderResults,
        showError
    )
})
```

#### `native(url, onSuccess, onError, postData?, params?)`

Возвращает сырую строку ответа вместо распарсенного JSON. Передайте `dataType: 'text'` в params.

```js
network.native(
    'https://example.com/manifest.m3u8',
    (rawText) => { parseM3U(rawText) },
    onError,
    null,
    { dataType: 'text' }
)
```

### Обработка ошибок

```js
network.get(url,
    (data) => { /* успех */ },
    (jqXHR, exception) => {
        let message = network.errorDecode(jqXHR, exception)
        let code    = network.errorCode(jqXHR)
        let json    = network.errorJSON(jqXHR)

        Lampa.Noty.show('Ошибка: ' + message, { style: 'error' })
    }
)
```

### Прочие методы

```js
network.clear()     // отменить все незавершённые запросы экземпляра
network.again()     // повторить последний запрос
network.latest()    // вернуть объект jQuery XHR последнего запроса
```

---

[← Система событий](03-events.md) · [Содержание](README.md) · **Далее: [Шаблоны и локализация →](05-templates-lang.md)**
