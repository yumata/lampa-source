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
            <li>Запрос на пинг вернул неверный формат</li>
            <li>Ответ от TorServer: <code>{echo}</code></li>
        </ul>
    </div>

    <div>
        <div>Что делать?</div>
        <ul>
            <li>Убедитесь что у вас стоит версия Matrix</li>
        </ul>
    </div>

    <div>
        <div>Как проверить?</div>
        <ul>
            <li>Откройте браузер и зайдите по адресу <code>{ip}/echo</code></li>
            <li>Убедитесь что в ответе есть наличие кода <code>MatriX</code></li>
        </ul>
    </div>
</div>`

export default html