let html = `<div class="about">
    <div>#{about_text}</div>


    <div class="about__contacts">
        <div>
            <small>#{about_channel}</small><br>
            @lampa_channel
        </div>

        <div>
            <small>#{about_group}</small><br>
            @lampa_group
        </div>

        <div>
            <small>#{about_version}</small><br>
            <span class="version_app"></span>
        </div>

        <div class="hide platform_android">
            <small>#{about_version} Android</small><br>
            <span class="version_android"></span>
        </div>
    </div>

    <div class="about__contacts">
        <div>
            <small>#{about_donate}</small><br>
            www.boosty.to/lampatv
        </div>
    </div>
</div>`

export default html