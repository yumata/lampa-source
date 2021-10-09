let html = `<div>
    <div class="settings-param selector" data-type="input" data-name="torrserver_url" placeholder="Например: 192.168.х">
        <div class="settings-param__name">Ссылка</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Укажите ссылку на скрипт TorrServer</div>
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