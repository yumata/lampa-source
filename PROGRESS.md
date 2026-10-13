# Прогресс

## 2026-10-13 — Тайм-коды: привязка к id карточки
Сделано:
- `Timeline.link(card, season, episode)` — ключ карточки (`tv_1399`, `movie_550`, для не tmdb/cub источников с префиксом источника).
- Запись тайм-кода хранит `card`, `season`, `episode`; в памяти индекс `card|season|episode -> hash`
  (строится в `read()`, обновляется в `update()`).
- `Timeline.view(hash, link)`: если по хешу записи нет, берет прогресс из записи с той же карточкой/серией,
  дальше прогресс пишется под новым хешем. Старая запись не удаляется.
- Ядро и плагины передают `link` в `Timeline.view`.
- Сервер CUB сохраняет `card/season/episode` в `timeline/update`.

Измененные файлы:
- `src/interaction/timeline.js`
- `src/interaction/card.js`, `src/interaction/card/module/watched.js`, `src/interaction/episode/episode.js`, `src/interaction/torrent.js`
- `plugins/online/{filmix,videocdn,collaps,rezka,cdnmovies,kinobase}.js`, `plugins/online_prestige/component.js`
- `D:\github\cub\api\timeline.js`, `D:\github\cub\doc\data\timeline\post_update.txt`

Осталось:
- Проверка пользователем.
- Пересобрать документацию cub (`doc/build`), если нужно.
- Сторонние плагины, которые вызывают `Lampa.Timeline.view(hash)` без `link`, работают по-старому (только по хешу).
