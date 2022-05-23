let html = `<div class="torrent-checklist">
    <div class="torrent-checklist__descr">Не удалось подключиться к TorrServe. Давайте быстро пройдёмся по списку возможных проблем и всё проверим.</div>

    <div class="torrent-checklist__progress-steps">Выполнено 0 из 0</div>
    <div class="torrent-checklist__progress-bar">
        <div style="width: 0"></div>
    </div>

    <div class="torrent-checklist__content">
        <div class="torrent-checklist__steps">
            <ul class="torrent-checklist__list">
                <li>Запущен ли TorrServe</li>
                <li>Динамический IP-адрес</li>
                <li>Протокол и порт</li>
                <li>Блокировка антивирусами</li>
                <li>Проверьте на доступность</li>
                <li>Все равно не работает</li>
            </ul>
        </div>

        <div class="torrent-checklist__info">
            <div class="hide">Убедитесь, что вы запустили TorrServe на устройстве, где он установлен.</div>
            <div class="hide">Частая ошибка, изменился IP-адрес устройства с TorrServe. Убедитесь, что IP-адрес, который вы ввели - {ip}, совпадает с адресом устройства, на котором установлен TorrServe.</div>
            <div class="hide">Для подключения к TorrServe, необходимо указать протокол http:// в начале и порт :8090 в конце адреса. Убедитесь, что после IP-адреса указан порт, ваш текущий адрес - {ip}</div>
            <div class="hide">Частое явление, антивирус или брандмауэр может блокировать доступ по IP-адресу, попробуйте отключить антивирус и брандмауэр.</div>
            <div class="hide">На любом другом устройстве в этой же сети, откройте в браузере адрес {ip} и проверьте, доступен ли веб-интерфейс TorrServe.</div>
            <div class="hide">Если после всех проверок всё равно возникает ошибка подключения, попробуйте перезагрузить TorrServe и интернет-адаптер.</div>
            <div class="hide">Если проблема не устранена, пишите в Telegram-группу @lampa_group с текстом (Lampa не подключается к TorrServe после всех проверок, текущий адрес {ip})</div>
        </div>
    </div>

    <div class="torrent-checklist__footer">
        <div class="simple-button selector">Начать проверку</div><div class="torrent-checklist__next-step"></div>
    </div>
</div>`

export default html