let html = `<div>
    <div class="settings-param selector is--player" data-type="select" data-name="player">
        <div class="settings-param__name">#{settings_player_type}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_type_descr}</div>
    </div>

    <div class="settings-param selector is--player" data-type="select" data-name="player_iptv">
        <div class="settings-param__name">#{settings_player_iptv_type}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_iptv_type_descr}</div>
    </div>

    <div class="settings-param selector is--player" data-type="select" data-name="player_torrent">
        <div class="settings-param__name">#{settings_player_torrent_type}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_torrent_type_descr}</div>
    </div>

    <div class="settings-param selector is--android" data-type="select" data-name="player_launch_trailers">
        <div class="settings-param__name">#{settings_player_launch_trailers}</div>
        <div class="settings-param__value"></div>
    </div>
    
    <div class="settings-param selector is--android" data-type="button" data-name="reset_player" data-static="true">
        <div class="settings-param__name">#{settings_player_reset}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_reset_descr}</div>
    </div>

    <div class="settings-param selector is--nw" data-type="input" data-name="player_nw_path" placeholder="" data-children="player_type">
        <div class="settings-param__name">#{settings_player_path}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_path_descr}</div>
    </div>
    
    <div data-parent="player_type" data-visible-value-in="vlc" class="hide is--nw">
        <div class="settings-param-title"><span>#{settings_player_vlc_header}</span></div>
    
        <div class="settings-param selector" data-type="input" data-name="vlc_api_password">
            <div class="settings-param__name">#{settings_player_vlc_api_password}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_player_vlc_api_password_descr}</div>
        </div>
        <div class="settings-param selector" data-type="toggle" data-name="vlc_fullscreen">
            <div class="settings-param__name">#{settings_player_vlc_fullscreen}</div>
            <div class="settings-param__value"></div>
        </div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_normalization">
        <div class="settings-param__name">#{settings_player_normalization}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_normalization_descr}</div>
    </div>
    
    <div class="settings-param selector" data-type="toggle" data-name="playlist_next">
        <div class="settings-param__name">#{settings_player_next_episode}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_next_episode_descr}</div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="player_timecode">
        <div class="settings-param__name">#{settings_player_timecode}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_timecode_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_scale_method">
        <div class="settings-param__name">#{settings_player_scale}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_scale_descr}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="player_hls_method">
        <div class="settings-param__name">#{settings_player_hls_title}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_hls_descr}</div>
    </div>

    <div class="settings-param selector" data-type="select" data-name="player_rewind">
        <div class="settings-param__name">#{settings_player_rewind_title}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_rewind_descr}</div>
    </div>
    
    <div class="is--has_subs">
        <div class="settings-param-title"><span>#{settings_player_subs}</span></div>

        <div class="settings-param selector" data-type="toggle" data-name="subtitles_start">
            <div class="settings-param__name">#{settings_player_subs_use}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_player_subs_use_descr}</div>
        </div>
    </div>

    <div class="settings-param-title"><span>#{more}</span></div>

    <div class="settings-param selector" data-type="select" data-name="video_quality_default">
        <div class="settings-param__name">#{settings_player_quality}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_quality_descr}</div>
    </div>
</div>`

export default html
