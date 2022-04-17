let html = `<div class="torrent-checklist">
    <div class="torrent-checklist__descr">Не удалось подключится к TorrServe, проблема может быть разной. Давайте быстро пройдемся по списку возможных проблем и все проверим.</div>

    <div class="torrent-checklist__progress-steps">Выполнено 0 из 0</div>
    <div class="torrent-checklist__progress-bar">
        <div style="width: 0"></div>
    </div>

    <div class="torrent-checklist__content">
        <div class="torrent-checklist__steps">
            <ul class="torrent-checklist__list">
                <li>Запущен ли TorrServe</li>
                <li>Динамический IP адрес</li>
                <li>Протокол</li>
                <li>Блокировка антивирусами</li>
                <li>Проверьте на доступность</li>
                <li>Все равно не работает</li>
            </ul>
        </div>

        <div class="torrent-checklist__info">
            <div class="hide">Убедитесь, что вы запустили TorrServe на устройстве где он установлен.</div>
            <div class="hide">Частая ошибка, изменился IP адрес вашего устройства. Убедитесь, что IP адрес который вы ввели {ip}, совпадает с адресом устройства на котором установлен TorrServe</div>
            <div class="hide">Для обращения к TorrServe, необходим протокол :8090 в конце адреса. Убедитесь, что в конце вашего IP адреса прописан протокол, ваш текущий адрес {ip}</div>
            <div class="hide">Частое явление, антивирус или брандмауэр может блокировать доступ по IP адресу, попробуйте отключить антивирус и брандмауэр.</div>
            <div class="hide">На любом другом устройстве, где не установлен TorrServe, откройте в браузере адрес {ip} и проверьте, доступен ли ответ от TorrServe</div>
            <div class="hide">Если после всех проверок все равно не работает, попробуйте перезагрузить TorrServe и интернет адаптер.</div>
            <div class="hide">Если проблема не устранена, пишите в телеграм группу @lampa_group с текстом (Лампа не подключается к TorrServe после всех проверок, текущий адрес {ip})</div>
        </div>
    </div>

    <div class="torrent-checklist__footer">
        <div class="simple-button selector">Начать проверку</div><div class="torrent-checklist__next-step"></div>
    </div>
</div>`

export default html