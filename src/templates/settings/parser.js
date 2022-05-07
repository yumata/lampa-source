let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="parser_use">
        <div class="settings-param__name">Использовать парсер</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Тем самым, вы соглашаетесь принять на себя всю отвественность за использование публичных ссылок для просмотра торрент и онлайн контента.</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="parser_torrent_type">
        <div class="settings-param__name">Тип парсера для торрентов</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>Jackett</span></div>

    <div class="settings-param selector" data-type="input" data-name="jackett_url" placeholder="Например: 192.168.х">
        <div class="settings-param__name">Ссылка</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Укажите ссылку на скрипт Jackett</div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="jackett_key" placeholder="Например: sa0sk83d..">
        <div class="settings-param__name">Api ключ</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Находится в Jackett</div>
    </div>

    <div class="settings-param-title is--torllok"><span>Torlook</span></div> 

    <div class="settings-param selector is--torllok" data-type="toggle" data-name="torlook_parse_type">
        <div class="settings-param__name">Метод парсинга сайта TorLook</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector is--torllok" data-type="input" data-name="parser_website_url" placeholder="Например: scraperapi.com">
        <div class="settings-param__name">Ссылка на парсер сайтов</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Зарегистрируйтесь на сайте scraperapi.com, прописать ссылку api.scraperapi.com?api_key=...&url={q}<br>В {q} будет поставлятся сайт w41.torlook.info</div>
    </div>

    <div class="settings-param-title"><span>Еще</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="parse_lang">
        <div class="settings-param__name">Поиск</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">На каком языке производить поиск?</div>
    </div>
    <div class="settings-param selector" data-type="toggle" data-name="parse_in_search">
        <div class="settings-param__name">Парсер в поиске</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Показывать результаты в поиске?</div>
    </div>
</div>`

export default html