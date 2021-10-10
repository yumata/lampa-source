let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="torrserver_use_link">
        <div class="settings-param__name">Использовать ссылку</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>Ссылки</span></div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_url" placeholder="Например: 192.168.х">
        <div class="settings-param__name">Основная ссылка</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Укажите основную ссылку на скрипт TorrServer</div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_url_two" placeholder="Например: 192.168.х">
        <div class="settings-param__name">Дополнительная ссылка</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Укажите дополнительную ссылку на скрипт TorrServer</div>
    </div>
    
    <div class="settings-param-title"><span>Дополнительно</span></div>

    <div class="settings-param selector is--torr_use" data-type="toggle" data-name="internal_torrclient">
        <div class="settings-param__name">Встроенный клиент</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Использовать встроенный JS клиент TorrServe, иначе запускается системный</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="torrserver_savedb">
        <div class="settings-param__name">Сохранить в базу</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Торрент будет добавлен в базу TorrServer</div>
    </div>
    
    <div class="settings-param selector" data-type="toggle" data-name="torrserver_preload">
        <div class="settings-param__name">Использовать буфер пред.загрузки</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Дожидаться заполнения буфера предварительной загрузки TorrServer перед проигрыванием</div>
    </div>

    <div class="settings-param-title"><span>Авторизация</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="torrserver_auth">
        <div class="settings-param__name">Вход по паролю</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_login" placeholder="Не указан">
        <div class="settings-param__name">Логин</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_password" placeholder="Не указан">
        <div class="settings-param__name">Пароль</div>
        <div class="settings-param__value"></div>
    </div>
</div>`

export default html