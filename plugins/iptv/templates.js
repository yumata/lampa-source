function init(){
    Lampa.Template.add('cub_iptv_content', `
        <div class="iptv-content">
            <div class="iptv-content__menu"></div>
            <div class="iptv-content__channels"></div>
            <div class="iptv-content__details"></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_menu', `
        <div class="iptv-menu">
            <div class="iptv-menu__body">
                <div class="iptv-menu__head">
                    <div class="iptv-menu__title"></div>
                    <div class="iptv-menu__search selector">
                        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>
                            <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
                        </svg>
                    </div>
                </div>
                <div class="iptv-menu__list"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('iptv_menu_mobile_button_search', `
        <div class="iptv-menu__search-mobile selector">
            <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>
                <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
            </svg>
        </div>
    `)

    Lampa.Template.add('cub_iptv_channels', `
        <div class="iptv-channels">
            
        </div>
    `)

    Lampa.Template.add('cub_iptv_details', `
        <div class="iptv-details layer--wheight">
            <div class="iptv-details__play"></div>
            <div class="iptv-details__title"></div>

            <div class="iptv-details__program">

            </div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_details_empty', `
        <div class="iptv-details-epmty endless endless-up">
            <div><span></span><span style="width: 60%"></span></div>
            <div><span></span><span style="width: 70%"></span></div>
            <div><span></span><span style="width: 40%"></span></div>
            <div><span></span><span style="width: 55%"></span></div>
            <div><span></span><span style="width: 30%"></span></div>
            <div><span></span><span style="width: 55%"></span></div>
            <div><span></span><span style="width: 30%"></span></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_playlist_item', `
        <div class="iptv-playlist-item selector layer--visible layer--render">
            <div class="iptv-playlist-item__body">
                <div class="iptv-playlist-item__name">
                    <div class="iptv-playlist-item__name-ico"><span></span></div>
                    <div class="iptv-playlist-item__name-text">est</div>
                </div>
                <div class="iptv-playlist-item__url"></div>
            </div>

            <div class="iptv-playlist-item__footer hide">
                <div class="iptv-playlist-item__details details-left"></div>
                <div class="iptv-playlist-item__details details-right"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_list', `
        <div class="iptv-list layer--wheight">
            <div class="iptv-list__ico">
                <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>
                    <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="iptv-list__title"></div>
            <div class="iptv-list__text"></div>
            <div class="iptv-list__items"></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_list_empty', `
        <div class="iptv-list-empty selector">
            <div class="iptv-list-empty__text"></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_param_lock', `
        <div class="iptv-param-lock">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 401.998 401.998" xml:space="preserve"><path d="M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z" fill="currentColor"></path></svg>
        </div>
    `)

    Lampa.Template.add('cub_iptv_icon_favorite', `
        <svg width="65" height="87" viewBox="0 0 65 87" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M36.1884 47.9221L32.5 42.6448L28.8116 47.9221L5.40983 81.4046C5.33938 81.5054 5.28461 81.5509 5.25807 81.5702C5.23028 81.5904 5.2049 81.6024 5.17705 81.611C5.11471 81.6301 4.99693 81.6414 4.84985 81.5951C4.70278 81.5488 4.61273 81.472 4.57257 81.4207C4.55463 81.3977 4.54075 81.3733 4.52953 81.3408C4.51882 81.3098 4.5 81.2411 4.5 81.1182V13C4.5 8.30558 8.30558 4.5 13 4.5H52C56.6944 4.5 60.5 8.30558 60.5 13V81.1182C60.5 81.2411 60.4812 81.3098 60.4705 81.3408C60.4593 81.3733 60.4454 81.3977 60.4274 81.4207C60.3873 81.472 60.2972 81.5488 60.1502 81.5951C60.0031 81.6414 59.8853 81.6301 59.8229 81.611C59.7951 81.6024 59.7697 81.5904 59.7419 81.5702C59.7154 81.5509 59.6606 81.5054 59.5902 81.4046L36.1884 47.9221Z" stroke="currentColor" stroke-width="9"/>
            <path class="active-layer" d="M0 13C0 5.8203 5.8203 0 13 0H52C59.1797 0 65 5.8203 65 13V81.1182C65 86.0086 58.7033 87.9909 55.9018 83.9825L32.5 50.5L9.09823 83.9825C6.29666 87.9909 0 86.0086 0 81.1182V13Z" fill="currentColor"/>
        </svg>
    `)

    Lampa.Template.add('cub_iptv_icon_lock', `
        <svg width="420" height="512" viewBox="0 0 420 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M384.532 232.729C394.233 232.729 402.472 236.121 409.262 242.91C416.053 249.698 419.457 257.941 419.452 267.636V477.092C419.452 486.786 416.053 495.033 409.271 501.822C402.48 508.608 394.242 512 384.541 512H35.4568C25.7632 512 17.5189 508.604 10.7304 501.822C3.9432 495.033 0.54895 486.786 0.54895 477.092V267.64C0.54895 257.937 3.94192 249.693 10.7304 242.91C17.5189 236.121 25.7632 232.729 35.4568 232.729H47.0915V162.907C47.0915 118.301 63.0871 80.0023 95.0886 48.0009C127.085 16.0007 165.388 0 209.999 0C254.61 0 292.906 16.0007 324.905 48.0021C356.907 80.0023 372.902 118.302 372.902 162.907V232.729H384.532ZM116.91 162.907V232.729H303.088V162.907C303.088 137.212 293.996 115.269 275.82 97.092C257.635 78.9095 235.703 69.8221 210.003 69.8221C184.304 69.8221 162.367 78.9108 144.183 97.092C126.002 115.271 116.91 137.212 116.91 162.907ZM62 293C53.7157 293 47 299.716 47 308V445C47 453.284 53.7157 460 62 460H358C366.284 460 373 453.284 373 445V308C373 299.716 366.284 293 358 293H62Z" fill="currentColor"/>
        <rect class="active-layer" x="33" y="275" width="354" height="203" rx="15" fill="currentColor"/>
        </svg>
    `)

    Lampa.Template.add('cub_iptv_icon_fav', `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
            <path fill="currentColor" d="M391.416,0H120.584c-17.778,0-32.242,14.464-32.242,32.242v460.413c0,7.016,3.798,13.477,9.924,16.895
            c2.934,1.638,6.178,2.45,9.421,2.45c3.534,0,7.055-0.961,10.169-2.882l138.182-85.312l138.163,84.693
            c5.971,3.669,13.458,3.817,19.564,0.387c6.107-3.418,9.892-9.872,9.892-16.875V32.242C423.657,14.464,409.194,0,391.416,0z
            M384.967,457.453l-118.85-72.86c-6.229-3.817-14.07-3.798-20.28,0.032l-118.805,73.35V38.69h257.935V457.453z"></path>
        </svg>
    `)

    Lampa.Template.add('cub_iptv_icon_all', `
        <svg height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="currentColor" stroke-width="3"></rect>
            <rect x="6" y="7" width="25" height="3" fill="currentColor"></rect>
            <rect x="6" y="13" width="13" height="3" fill="currentColor"></rect>
            <rect x="6" y="19" width="19" height="3" fill="currentColor"></rect>
        </svg>
    `)

    Lampa.Template.add('cub_iptv_icon_group', `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
            <path fill="currentColor" d="M478.354,146.286H33.646c-12.12,0-21.943,9.823-21.943,21.943v321.829c0,12.12,9.823,21.943,21.943,21.943h444.709
                c12.12,0,21.943-9.823,21.943-21.943V168.229C500.297,156.109,490.474,146.286,478.354,146.286z M456.411,468.114H55.589V190.171
                h400.823V468.114z"></path>
            <path fill="currentColor" d="M441.783,73.143H70.217c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h371.566
                c12.12,0,21.943-9.823,21.943-21.943C463.726,82.966,453.903,73.143,441.783,73.143z"></path>
            <path fill="currentColor" d="M405.211,0H106.789c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h298.423
                c12.12,0,21.943-9.823,21.943-21.943C427.154,9.823,417.331,0,405.211,0z"></path>
        </svg>
    `)

    Lampa.Template.add('cub_iptv_icon_searched', `
        <svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="currentColor" stroke-width="3"></rect>
            <rect x="6" y="7" width="16" height="3" rx="1.5" fill="currentColor"></rect>
            <rect x="6" y="13" width="16" height="3" rx="1.5" fill="currentColor"></rect>
        </svg>
    `)

    Lampa.Template.add('cub_iptv_hud',`
        <div class="iptv-hud">
            <div class="iptv-hud__content">
                <div class="iptv-hud__menu"></div>
                <div class="iptv-hud__program"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('settings_iptv_guide',`<div>
        <div class="settings-param selector" data-type="toggle" data-name="iptv_guide_custom" data-children="use_custom_guide">
            <div class="settings-param__name">#{iptv_param_guide_custom_title}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{iptv_param_guide_custom_descr}</div>
        </div>
        <div data-parent="use_custom_guide">
            <div class="settings-param selector" data-type="input" data-name="iptv_guide_url" placeholder="#{torrent_parser_set_link}">
                <div class="settings-param__name">#{settings_parser_jackett_link}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{iptv_param_guide_url_descr}</div>
            </div>
            <div class="settings-param selector" data-type="select" data-name="iptv_guide_save">
                <div class="settings-param__name">#{iptv_param_guide_save_title}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{iptv_param_guide_save_descr}</div>
            </div>
            <div class="settings-param selector" data-type="select" data-name="iptv_guide_interval">
                <div class="settings-param__name">#{iptv_param_guide_interval_title}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{iptv_param_guide_interval_descr}</div>
            </div>
            <div class="settings-param selector" data-type="toggle" data-name="iptv_guide_update_after_start">
                <div class="settings-param__name">#{iptv_param_guide_update_after_start}</div>
                <div class="settings-param__value"></div>
            </div>
            <div class="settings-param selector settings-param--button update-guide-now" data-static="true">
                <div class="settings-param__name">#{iptv_param_guide_update_now}</div>
            </div>
            <div class="settings-param update-guide-status" data-static="true">
                <div class="settings-param__name">#{iptv_guide_status_finish}</div>
                <div class="settings-param__value">#{iptv_guide_status_noupdates}</div>
            </div>
        </div>
    </div>`)

    Lampa.Template.add('cub_iptv_style', `
        <style>
        @@include('../plugins/iptv/css/style.css')
        </style>
    `)
}

export default {
    init
}