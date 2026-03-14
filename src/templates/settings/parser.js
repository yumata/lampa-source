let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="parser_use" data-children="parser">
        <div class="settings-param__name">#{settings_parser_use}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_parser_use_descr}</div>
    </div>
    <div data-parent="parser">
        <div class="settings-param selector" data-type="toggle" data-name="parser_torrent_type" data-children="type">
            <div class="settings-param__name">#{settings_parser_type}</div>
            <div class="settings-param__value"></div>
        </div>

        <div class="settings-param selector" data-type="toggle" data-name="parser_use_link">
            <div class="settings-param__name">#{settings_server_link}</div>
            <div class="settings-param__value"></div>
        </div>

        <div data-parent="type" data-visible-value="jackett" class="hide">
            <div class="settings-param-title"><span>Jackett</span></div>

            <div class="settings-param-title"><span>#{settings_param_link_use_one}</span></div>

            <div class="settings-param selector" data-type="input" data-name="jackett_url" placeholder="#{settings_parser_jackett_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_link}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_jackett_link_descr}</div>
            </div>

            <div class="settings-param selector" data-type="input" data-name="jackett_key" data-string="true" placeholder="#{settings_parser_jackett_key_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_key}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_jackett_key_descr}</div>
            </div>

            <div class="settings-param-title"><span>#{settings_param_link_use_two}</span></div>

            <div class="settings-param selector" data-type="input" data-name="jackett_url_two" placeholder="#{settings_parser_jackett_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_link}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_jackett_link_descr}</div>
            </div>

            <div class="settings-param selector" data-type="input" data-name="jackett_key_two" data-string="true" placeholder="#{settings_parser_jackett_key_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_key}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_jackett_key_descr}</div>
            </div>

            <div class="settings-param selector" data-type="toggle" data-name="jackett_interview">
                <div class="settings-param__name">#{settings_parser_jackett_interview}</div>
                <div class="settings-param__value"></div>
            </div>
        </div>
        
        <div data-parent="type" data-visible-value="prowlarr" class="hide">
            <div class="settings-param-title"><span>Prowlarr</span></div>

            <div class="settings-param-title"><span>#{settings_param_link_use_one}</span></div>

            <div class="settings-param selector" data-type="input" data-name="prowlarr_url" placeholder="#{settings_parser_jackett_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_link}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_prowlarr_link_descr}</div>
            </div>

            <div class="settings-param selector" data-type="input" data-name="prowlarr_key" data-string="true" placeholder="#{settings_parser_jackett_key_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_key}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_prowlarr_key_descr}</div>
            </div>

            <div class="settings-param-title"><span>#{settings_param_link_use_two}</span></div>

            <div class="settings-param selector" data-type="input" data-name="prowlarr_url_two" placeholder="#{settings_parser_jackett_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_link}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_prowlarr_link_descr}</div>
            </div>

            <div class="settings-param selector" data-type="input" data-name="prowlarr_key_two" data-string="true" placeholder="#{settings_parser_jackett_key_placeholder}">
                <div class="settings-param__name">#{settings_parser_jackett_key}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parser_prowlarr_key_descr}</div>
            </div>
        </div>

        <div class="settings-param-title"><span>#{more}</span></div>

        <div class="settings-param selector" data-type="select" data-name="parse_lang">
            <div class="settings-param__name">#{settings_parser_search}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_parser_search_descr}</div>
        </div>
        <div class="settings-param selector" data-type="toggle" data-name="parse_timeout">
            <div class="settings-param__name">#{settings_parser_timeout_title}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_parser_timeout_descr}</div>
        </div>
        <div class="settings-param selector" data-type="toggle" data-name="parse_in_search">
            <div class="settings-param__name">#{settings_parser_in_search}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_parser_in_search_descr}</div>
        </div>
    </div>
</div>`

export default html
