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
            <li>TorServer не смог скачать торрент файл</li>
            <li>Ответ от TorServer: {echo}</li>
            <li>Ссылка: <code>{url}</code></li>
        </ul>
    </div>

    <div class="is--jackett">
        <div>Что делать?</div>
        <ul>
            <li>Проверьте правильно ли вы настроили Jackett</li>
            <li>Приватные источники могут не выдавать ссылку на файл</li>
            <li>Убедитесь что Jackett тоже может скачать файл</li>
        </ul>
    </div>

    <div class="is--torlook">
        <div>Что делать?</div>
        <ul>
            <li>Написать в нашу телеграм группу: @lampa_group</li>
            <li>Укажите какой фильм, какая раздача и по возможности фото этой разадачи</li>
        </ul>
    </div>
</div>`

export default html