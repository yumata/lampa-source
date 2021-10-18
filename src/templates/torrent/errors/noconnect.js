let html = `<div class="error">
    <div class="error__ico"></div>
    <div class="error__body">
        <div class="error__title">{title}</div>
        <div class="error__text">{text}</div>
    </div>
</div>

<div class="torrent-error noconnect">
    <div>
        <div>Причины</div>
        <ul>
            <li>Используется адрес: <code>{ip}</code></li>
            <li class="nocorect">Текущий адрес <code>{ip}</code> является неверным!</li>
            <li>Текущий ответ: <code>{echo}</code></li>
        </ul>
    </div>

    <div>
        <div>Как правильно?</div>
        <ul>
            <li>Используйте адрес: <code>192.168.0.ххх:8090</code></li>
            <li>Используйте версию Matrix</li>
        </ul>
    </div>

    <div>
        <div>Как проверить?</div>
        <ul>
            <li>На этом же устройстве, откройте браузер и зайдите по адресу <code>{ip}/echo</code></li>
            <li>Если же браузер не ответит, проверьте запущен ли TorrServe, или перезагрузите его.</li>
            <li>Если же браузер ответил, убедитесь что в ответе есть строка <code>MatriX</code></li>
        </ul>
    </div>
</div>`

export default html