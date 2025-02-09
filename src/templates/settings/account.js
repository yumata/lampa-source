let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="account_use">
        <div class="settings-param__name">#{settings_cub_sync}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_cub_sync_descr}</div>
    </div>

    <div class="settings-param-title settings--account-user hide"><span>#{settings_cub_account}</span> <span class="settings-param__label hide">Premium</span></div>

    <div class="settings-param selector hide" data-type="select" data-name="cub_domain">
        <div class="settings-param__name">#{settings_cub_domain}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-info hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_logged_in_as}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-profile hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_profile}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-out hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_logout}</div>
    </div>

    <div class="settings-param-title settings--account-signin"><span>#{settings_cub_signin}</span></div>

    <div class="settings-param selector settings--account-signin settings--account-device-add" data-type="button" data-static="true">
        <div class="settings-param__name">#{settings_cub_signin_button}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_cub_status}</span></div>

    <div class="settings-param selector settings--account-status" data-static="true">
        <div class="settings-param__value"></div>
        <div class="settings-param__descr"></div>
    </div>

    <div class="settings-param-title settings--account-user hide"><span>#{more}</span></div>

    <div class="settings-param selector settings--account-user settings--account-user-sync hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_sync_btn}</div>
        <div class="settings-param__value">#{settings_cub_sync_btn_descr}</div>
    </div>

    <div class="settings-param selector settings--account-user settings--account-user-backup hide" data-static="true">
        <div class="settings-param__name">#{settings_cub_backup}</div>
        <div class="settings-param__value">#{settings_cub_backup_descr}</div>
    </div>

    <div class="settings-param-title"><span>CUB Premium</span></div>

    <div class="selectbox-item selector selectbox-item--checkbox settings--account-premium" data-static="true">
        <div class="selectbox-item__title">#{settings_cub_sync_filters}</div>
        <div class="selectbox-item__checkbox"></div>
    </div>
    <div class="selectbox-item selector selectbox-item--checkbox settings--account-premium" data-static="true">
        <div class="selectbox-item__title">#{settings_cub_sync_calendar}</div>
        <div class="selectbox-item__checkbox"></div>
    </div>
    <div class="selectbox-item selector selectbox-item--checkbox settings--account-premium" data-static="true">
        <div class="selectbox-item__title">#{settings_cub_sync_timecodes}</div>
        <div class="selectbox-item__checkbox"></div>
    </div>
    <div class="selectbox-item selector selectbox-item--checkbox settings--account-premium" data-static="true">
        <div class="selectbox-item__title">#{settings_cub_sync_search}</div>
        <div class="selectbox-item__checkbox"></div>
    </div>
</div>`

export default html