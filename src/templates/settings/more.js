let html = `<div>
    <div class="settings-param selector" data-type="select" data-name="start_page">
        <div class="settings-param__name">#{settings_rest_start}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_start_descr}</div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="source">
        <div class="settings-param__name">#{settings_rest_source_use}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_source_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="protocol">
        <div class="settings-param__name">#{settings_rest_protocol_use}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_protocol_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="request_caching">
        <div class="settings-param__name">#{settings_request_caching_use}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_request_caching_descr}</div>
    </div>

    <div class="settings-param-title"><span>#{settings_rest_screensaver}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="screensaver">
        <div class="settings-param__name">#{settings_rest_screensaver_use}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="screensaver_type">
        <div class="settings-param__name">#{settings_rest_screensaver_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="screensaver_time">
        <div class="settings-param__name">#{settings_rest_screensaver_time}</div>
        <div class="settings-param__value"></div>
    </div>

    
    <div class="settings-param-title"><span>#{more}</span></div>

    <div class="settings-param selector" data-type="select" data-name="pages_save_total">
        <div class="settings-param__name">#{settings_rest_pages}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_pages_descr}</div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="time_offset">
        <div class="settings-param__name">#{settings_rest_time}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="navigation_type">
        <div class="settings-param__name">#{settings_rest_navigation}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="keyboard_type">
        <div class="settings-param__name">#{settings_rest_keyboard}</div>
        <div class="settings-param__value"></div>
    </div>


    <div class="settings-param selector" data-type="toggle" data-name="card_quality">
        <div class="settings-param__name">#{settings_rest_card_quality}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_card_quality_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="card_episodes">
        <div class="settings-param__name">#{settings_rest_card_episodes}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_card_episodes_descr}</div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="device_name" placeholder="#{settings_rest_device_placeholder}">
        <div class="settings-param__name">#{settings_rest_device}</div>
        <div class="settings-param__value"></div>
    </div>
</div>`

export default html