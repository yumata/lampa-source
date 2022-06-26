let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="parser_use">
        <div class="settings-param__name">#{settings_parser_use}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_use_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="parser_torrent_type">
        <div class="settings-param__name">#{settings_parser_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param-title"><span>Jackett</span></div>

    <div class="settings-param selector" data-type="input" data-name="jackett_url" placeholder="#{settings_parser_jackett_placeholder}">
        <div class="settings-param__name">#{settings_parser_jackett_link}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_jackett_link_descr}</div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="jackett_key" placeholder="#{settings_parser_jackett_key_placeholder}">
        <div class="settings-param__name">#{settings_parser_jackett_key}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_jackett_key_descr}</div>
    </div>

    <div class="settings-param-title is--torllok"><span>Torlook</span></div> 

    <div class="settings-param selector is--torllok" data-type="toggle" data-name="torlook_parse_type">
        <div class="settings-param__name">#{settings_parser_torlook_type}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector is--torllok" data-type="input" data-name="parser_website_url" placeholder="#{settings_parser_scraperapi_placeholder}">
        <div class="settings-param__name">#{settings_parser_scraperapi_link}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_scraperapi_descr}</div>
    </div>

    <div class="settings-param-title"><span>#{more}</span></div>

    <div class="settings-param selector" data-type="toggle" data-name="parse_lang">
        <div class="settings-param__name">#{settings_parser_search}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_search_descr}</div>
    </div>
    <div class="settings-param selector" data-type="toggle" data-name="parse_in_search">
        <div class="settings-param__name">#{settings_parser_in_search}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_in_search_descr}</div>
    </div>
</div>`

export default html
