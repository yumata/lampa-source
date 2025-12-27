let html = `<div>
    <div class="settings-param selector" data-static="true">
        <div class="settings-param__name">#{settings_interface_lang}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="light_version">
        <div class="settings-param__name">#{settings_interface_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="interface_size">
        <div class="settings-param__name">#{settings_interface_size}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector is--tv" data-type="toggle" data-name="menu_always">
        <div class="settings-param__name">#{settings_interface_menu_always}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_interface_background}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="background">
        <div class="settings-param__name">#{settings_interface_background_use}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="background_type">
        <div class="settings-param__name">#{settings_interface_background_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="black_style">
        <div class="settings-param__name">#{settings_interface_black_style}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{title_card}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="card_interfice_poster">
        <div class="settings-param__name">#{settings_interface_card_poster}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="card_interfice_cover">
        <div class="settings-param__name">#{settings_interface_card_cover}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="card_interfice_reactions">
        <div class="settings-param__name">#{settings_interface_card_reactions}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_interface_glass}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="glass_style">
        <div class="settings-param__name">#{settings_interface_glass}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_interface_glass_descr}</div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="glass_opacity">
        <div class="settings-param__name">#{settings_interface_glass_opacity}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="is--sound">
        <div class="settings-param-title"><span>#{settings_interface_sound}</span></div>

        <div class="settings-param selector" data-type="toggle" data-name="interface_sound_play">
            <div class="settings-param__name">#{settings_interface_sound_play}</div>
            <div class="settings-param__value"></div>
        </div>

        <div class="settings-param selector" data-type="select" data-name="interface_sound_level">
            <div class="settings-param__name">#{settings_interface_sound_level}</div>
            <div class="settings-param__value"></div>
        </div>
    </div>

    <div class="settings-param-title"><span>#{settings_interface_performance}</span></div>


    <div class="settings-param selector" data-type="toggle" data-name="animation">
        <div class="settings-param__name">#{settings_interface_animation}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_interface_animation_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="advanced_animation">
        <div class="settings-param__name">#{settings_interface_advanced_animation}</div>
        <div class="settings-param__value"></div>
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
</div>`

export default html