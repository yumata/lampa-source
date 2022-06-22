let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="start_page">
        <div class="settings-param__name">#{settings_rest_start}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_start_descr}</div>
    </div>

    <div class="settings-param-title"><span>#{settings_rest_source}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="source">
        <div class="settings-param__name">#{settings_rest_source_use}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_source_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="tmdb_lang">
        <div class="settings-param__name">TMDB</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_tmdb_lang}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="proxy_tmdb">
        <div class="settings-param__name">#{settings_rest_tmdb_prox}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="poster_size">
        <div class="settings-param__name">#{settings_rest_tmdb_posters}</div>
        <div class="settings-param__value"></div>
    </div> 

    <div class="settings-param-title"><span>#{settings_rest_screensaver}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="screensaver">
        <div class="settings-param__name">#{settings_rest_screensaver_use}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="screensaver_type">
        <div class="settings-param__name">#{settings_rest_screensaver_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>#{settings_rest_helper}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="helper">
        <div class="settings-param__name">#{settings_rest_helper_use}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector helper--start-again" data-static="true">
        <div class="settings-param__name">#{settings_rest_helper_reset}</div>
    </div>
    
    <div class="settings-param-title"><span>#{more}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="pages_save_total">
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

    <div class="settings-param selector" data-type="input" data-name="device_name" placeholder="#{settings_rest_device_placeholder}">
        <div class="settings-param__name">#{settings_rest_device}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector clear-storage" data-static="true">
        <div class="settings-param__name">#{settings_rest_cache}</div>
        <div class="settings-param__value">#{settings_rest_cache_descr}</div>
    </div>
</div>`

export default html