let html = `<div>
    <div class="settings-param selector" data-type="toggle" data-name="tmdb_lang">
        <div class="settings-param__name">TMDB</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_tmdb_lang}</div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="poster_size">
        <div class="settings-param__name">#{settings_rest_tmdb_posters}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="proxy_tmdb_auto">
        <div class="settings-param__name">#{settings_rest_tmdb_prox_auto}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="toggle" data-name="proxy_tmdb" data-children="proxy">
        <div class="settings-param__name">#{settings_rest_tmdb_prox}</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-parent="proxy" data-type="input" data-name="tmdb_proxy_api" placeholder="#{settings_rest_tmdb_example} api.proxy.com">
        <div class="settings-param__name">Api</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_tmdb_api_descr}</div>
    </div>

    <div class="settings-param selector" data-parent="proxy" data-type="input" data-name="tmdb_proxy_image" placeholder="#{settings_rest_tmdb_example} image.proxy.com">
        <div class="settings-param__name">Image</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{settings_rest_tmdb_image_descr}</div>
    </div>
</div>`

export default html