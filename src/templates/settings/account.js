let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="account_use">
        <div class="settings-param__name">#{settings_cub_sync}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_cub_sync_descr}</div>
    </div>

    <div class="settings-param-title settings--account-user hide"><span>#{settings_cub_account}</span></div>

    <div class="settings-param selector settings--account-user settings--account-user-info hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_logged_in_as}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-profile hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_profile}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-sync hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_sync_btn}</div>
        <div class="settings-param__value">#{settings_cub_sync_btn_descr}</div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-backup hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_backup}</div>
        <div class="settings-param__value">#{settings_cub_backup_descr}</div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-out hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_logout}</div>
    </div>

    <div class="settings-param-title settings--account-signin"><span>#{settings_cub_signin}</span></div>

    <div class="settings-param selector settings--account-signin" data-type="input" data-name="account_email" placeholder="#{settings_cub_not_specified}">
        <div class="settings-param__name">Email</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-signin" data-type="input" data-string="true" data-name="account_password" placeholder="#{settings_cub_not_specified}">
        <div class="settings-param__name">#{settings_cub_password}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_cub_status}</span></div>

    <div class="settings-param selector settings--account-status" data-static="true">
        <div class="settings-param__value"></div>
        <div class="settings-param__descr"></div>
    </div>
</div>`

export default html