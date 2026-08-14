[← Подводные камни](11-pitfalls.md) · [Содержание](README.md) · **Далее: [Controller и TV-навигация →](13-controller.md)**

---

# Дебаг и тестирование

## Соглашение по логированию

Используйте пространство имён плагина в качестве префикса — это упрощает фильтрацию в консоли разработчика:

```js
// В начале плагина
const LOG_PREFIX = '[MyPlugin]'

// Далее по всему коду
console.log(LOG_PREFIX, 'инициализирован')
console.log(LOG_PREFIX, 'данные загружены:', data)
console.warn(LOG_PREFIX, 'сервер недоступен, переключаемся на резерв')
console.error(LOG_PREFIX, 'критическая ошибка:', err)
```

В DevTools введите в фильтр консоли `[MyPlugin]`, чтобы видеть только сообщения своего плагина.

---

## Диагностика во время выполнения

Следующие проверки помогают при отладке прямо в DevTools:

| Задача | Команда консоли |
|---|---|
| Убедиться, что приложение готово | `window.appready` |
| Проверить флаг двойной загрузки | `window.my_plugin_ready` |
| Проверить текущую activity | `Lampa.Activity.active()` |
| Прочитать значение настройки | `Lampa.Storage.field('my_plugin_key')` |
| Прочитать сырое значение хранилища | `Lampa.Storage.get('my_plugin_key', null)` |
| Посмотреть версию приложения | `Lampa.Manifest.app_version` |
| Список зарегистрированных компонентов | `Lampa.Component.get('my_screen')` |
| Проверить авторизацию аккаунта | `Lampa.Account.logged()` |

---

## Дев-сборка

Для разработки в рамках исходников приложения используйте дев-режим:

```bash
# Запуск с отслеживанием файлов + горячая перезагрузка
npm run debug

# BrowserSync на http://localhost:3000
# Rollup пересобирает при изменении src/
# Gulp копирует результат в build/web/
```

---

## Локальное тестирование внешнего плагина

Разрабатывая плагин как отдельный `.js`-файл, есть два способа его загрузить:

**Способ 1 — Настройки приложения:**
1. Откройте Lampa в браузере
2. Перейдите в Настройки → Плагины
3. Вставьте URL вашего локального сервера (`http://localhost:8080/my-plugin.js`)
4. Приложение загрузит и выполнит файл

**Способ 2 — Напрямую в консоли (для быстрых итераций):**
```js
// Вставить в DevTools Console
let s = document.createElement('script')
s.src = 'http://localhost:8080/my-plugin.js?' + Date.now()  // bust кэш
document.head.appendChild(s)
```

**Локальный сервер:**
```bash
# Python 3
python3 -m http.server 8080 --bind 127.0.0.1

# Node.js
npx serve . --listen 8080 --cors
```

---

## Точки останова и inspector

Используйте оператор `debugger` в точке, которую хотите исследовать. DevTools автоматически остановится здесь при открытой вкладке Sources:

```js
Lampa.Player.listener.follow('start', (data) => {
    debugger   // инспектор откроется с data в области видимости
    myHandler(data)
})
```

---

## Защита от версий

Если плагин требует определённых возможностей приложения, проверяйте версию при запуске:

```js
function init() {
    let version = Lampa.Manifest.app_version  // например, '1.9.5'
    let parts   = version ? version.split('.').map(Number) : [0, 0, 0]
    let minor   = parts[1] || 0

    if (minor < 8) {
        Lampa.Noty.show('[MyPlugin] требуется Lampa v1.8.0 или выше', { style: 'error' })
        return
    }

    // Продолжить инициализацию…
}
```

---

## Хронология запуска

| Этап | Состояние |
|---|---|
| Скрипт плагина выполнен | DOM загружен, `window.Lampa` отсутствует |
| `app:start` | `window.Lampa` частично инициализирован |
| `app:ready` | Все API безопасны; меню построено |
| `activity:create` | Первый экран создаётся |
| `activity:start` | Первый экран отображён пользователю |

> **Правило:** Никогда не обращайтесь к `Lampa.*` API и не работайте с DOM на верхнем уровне IIFE. Всегда выполняйте такой код внутри `init()`, защищённой `appready`-гардом.

---

[← Подводные камни](11-pitfalls.md) · [Содержание](README.md) · **Далее: [Controller и TV-навигация →](13-controller.md)**
