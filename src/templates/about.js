let html = `<div class="about">
    <div>#{about_text}</div>


    <div class="overhide">
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
    </div>

    <div class="about__rules">
        <h3>#{termsofuse_t_01}</h3>

        <p>#{termsofuse_t_02}</p>

        <ol>
            <li>
                <h6>#{termsofuse_t_03}</h6>

                <ol>
                    <li><p>#{termsofuse_t_04}</p></li>

                    <li><p>#{termsofuse_t_05}</p></li>

                    <li><p>#{termsofuse_t_06}</p></li>

                    <li><p>#{termsofuse_t_07}</p></li>
                </ol>
                
            </li>

            <li>
                <h6>#{termsofuse_t_08}</h6>

                <ol>
                    <li><p>#{termsofuse_t_09}</p></li>
                    <li><p>#{termsofuse_t_10}</p></li>
                </ol>
            </li>

            <li>
                <h6>#{termsofuse_t_11}</h6>

                <ol>
                    <li><p>#{termsofuse_t_12}</p></li>
                    <li><p>#{termsofuse_t_13}</p></li>
                </ol>
            </li>
        </ol>
    </div>
</div>`

export default html