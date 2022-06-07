let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="account_use">
        <div class="settings-param__name">Синхронизация</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Синхронизация с сервисом CUB: синхронизация ваших закладок, истории просмотров, меток и тайм-кодов. Сайт: https://cub.watch</div>
    </div>

    <div class="settings-param-title settings--account-user hide"><span>Аккаунт</span></div>

    <div class="settings-param selector settings--account-user settings--account-user-info hide" data-static="true">
        <div class="settings-param__name">Вошли как</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-profile hide" data-static="true">
        <div class="settings-param__name">Профиль</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-sync hide" data-static="true">
        <div class="settings-param__name">Синхронизировать</div>
        <div class="settings-param__value">Сохранить локальные закладки в аккаунт CUB</div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-backup hide" data-static="true">
        <div class="settings-param__name">Бэкап</div>
        <div class="settings-param__value">Сохранить или загрузить бэкап данных</div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-out hide" data-static="true">
        <div class="settings-param__name">Выйти из аккаунта</div>
    </div>

    <div class="settings-param-title settings--account-signin"><span>Авторизация</span></div>

    <div class="settings-param selector settings--account-signin" data-type="input" data-name="account_email" placeholder="Не указан">
        <div class="settings-param__name">Email</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-signin" data-type="input" data-string="true" data-name="account_password" placeholder="Не указан">
        <div class="settings-param__name">Пароль</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>Статус</span></div>

    <div class="settings-param selector settings--account-status" data-static="true">
        <div class="settings-param__value"></div>
        <div class="settings-param__descr"></div>
    </div>
</div>`

export default html