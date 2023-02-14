let html = `<div>
    <div class="settings-param selector is--player" data-type="toggle" data-name="player">
        <div class="settings-param__name">#{settings_player_type}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_type_descr}</div>
    </div>
    
    <div class="settings-param selector is--android" data-type="button" data-name="reset_player" data-static="true">
        <div class="settings-param__name">#{settings_player_reset}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_reset_descr}</div>
    </div>

    <div class="settings-param selector is--nw" data-type="input" data-name="player_nw_path" placeholder="">
        <div class="settings-param__name">#{settings_player_path}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_player_path_descr}</div>
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
    
    <div class="is--has_subs">
        <div class="settings-param-title"><span>#{settings_player_subs}</span></div>

        <div class="settings-param selector" data-type="toggle" data-name="subtitles_start">
            <div class="settings-param__name">#{settings_player_subs_use}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_player_subs_use_descr}</div>
        </div>

        <div class="settings-param selector" data-type="select" data-name="subtitles_size">
            <div class="settings-param__name">#{settings_player_subs_size}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_player_subs_size_descr}</div>
        </div>
        
        <div class="settings-param selector" data-type="toggle" data-name="subtitles_stroke">
            <div class="settings-param__name">#{settings_player_subs_stroke_use}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_player_subs_stroke_use_descr}</div>
        </div>
        
        <div class="settings-param selector" data-type="toggle" data-name="subtitles_backdrop">
            <div class="settings-param__name">#{settings_player_subs_backdrop_use}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{settings_player_subs_backdrop_use_descr}</div>
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
