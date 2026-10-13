# Задачи

## Тайм-коды: привязка к id карточки
Тайм-код хранится под хешем от оригинального названия. При смене названия прогресс теряется.
Сохранять вместе с тайм-кодом id карточки (+ сезон/серию) и искать по нему, если хеш не найден.

- [x] `src/interaction/timeline.js`: `link()`, индекс по id карточки, fallback в `view()`, мета в `update()`, `watched()`/`watchedEpisode()`
- [x] Ядро: передать `link` в `episode.js`, `card/module/watched.js`, `card.js`, `torrent.js`
- [x] Плагины: `plugins/online/*.js`, `plugins/online_prestige/component.js`
- [x] Сервер `D:\github\cub\api\timeline.js` `update()` + документация `post_update.txt`
- [x] PROGRESS.md / DECISIONS.md
