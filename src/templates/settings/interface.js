let html = `<div>
    <div class="settings-param selector" data-static="true">
        <div class="settings-param__name">#{settings_interface_lang}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="light_version">
        <div class="settings-param__name">#{settings_interface_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="interface_size">
        <div class="settings-param__name">#{settings_interface_size}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_interface_background}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="background">
        <div class="settings-param__name">#{settings_interface_background_use}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="background_type">
        <div class="settings-param__name">#{settings_interface_background_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_interface_performance}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="animation">
        <div class="settings-param__name">#{settings_interface_animation}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_interface_animation_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="mask">
        <div class="settings-param__name">#{settings_interface_attenuation}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_interface_attenuation_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="scroll_type">
        <div class="settings-param__name">#{settings_interface_scroll}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="card_views_type">
        <div class="settings-param__name">#{settings_interface_view_card}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_interface_view_card_descr}</div>
    </div>

</div>`

export default html