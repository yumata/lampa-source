let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="torrserver_use_link">
        <div class="settings-param__name">#{settings_server_link}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_server_links}</span></div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_url" placeholder="#{settings_server_placeholder}">
        <div class="settings-param__name">#{settings_server_link_one}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_server_link_one_descr}</div>
        <div class="settings-param__status"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_url_two" placeholder="#{settings_server_placeholder}">
        <div class="settings-param__name">#{settings_server_link_two}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_server_link_two_descr}</div>
        <div class="settings-param__status"></div>
    </div>
    
    <div class="settings-param-title"><span>#{settings_server_additionally}</span></div>

    <div class="settings-param selector is--android" data-type="toggle" data-name="internal_torrclient">
        <div class="settings-param__name">#{settings_server_client}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_server_client_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="torrserver_savedb">
        <div class="settings-param__name">#{settings_server_base}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_server_base_descr}</div>
    </div>
    
    <div class="settings-param selector" data-type="toggle" data-name="torrserver_preload">
        <div class="settings-param__name">#{settings_server_preload}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_server_preload_descr}</div>
    </div>

    <div class="settings-param-title"><span>#{settings_server_auth}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="torrserver_auth">
        <div class="settings-param__name">#{settings_server_password_use}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_login" placeholder="#{settings_server_not_specified}">
        <div class="settings-param__name">#{settings_server_login}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="torrserver_password" data-string="true" placeholder="#{settings_server_not_specified}">
        <div class="settings-param__name">#{settings_server_password}</div>
        <div class="settings-param__value"></div>
    </div>
</div>`

export default html