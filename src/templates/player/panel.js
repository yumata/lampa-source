let html = `<div class="player-panel">

    <div class="player-panel__body">
        <div class="player-panel__apex">
            <div class="player-panel__apex-top-side"></div>
            <div class="player-panel__apex-left-side"></div>
            <div class="player-panel__apex-right-side"></div>
            <div class="player-panel__apex-bottom-side"></div>
        </div>

        <div class="player-panel__line player-panel__line-one">
            <div class="player-panel__timenow"></div>
            <div class="player-panel__timeend"></div>
        </div>

        <div class="player-panel__timeline selector">
            <div class="player-panel__peding"></div>
            <div class="player-panel__position"><div></div></div>
            <div class="player-panel__timeline-segments"></div>
            <div class="player-panel__time hide"></div>
            <div class="player-panel__time-touch-zone hide"></div>
        </div>

        <div class="player-panel__iptv">
            <div class="player-panel-iptv">
                <div class="player-panel-iptv__channel"></div>
                <div class="player-panel-iptv__arrow-up">
                    <svg width="32" height="19" viewBox="0 0 32 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.17163 17.4122L15.9606 3.62323L29.7496 17.4122" stroke="white" stroke-width="4"/>
                    </svg>                
                </div>
                <div class="player-panel-iptv__position">001</div>
                <div class="player-panel-iptv__arrow-down">
                    <svg width="32" height="19" viewBox="0 0 32 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.17163 1.98059L15.9606 15.7696L29.7496 1.98059" stroke="white" stroke-width="4"/>
                    </svg>                
                </div>
            </div>
        </div>

        <div class="player-panel__line player-panel__line-two">
            <div class="player-panel__left">
                <div class="player-panel__box-buttons player-panel__playlist-buttons hide">
                    <div class="player-panel__playlist button selector">
                        <svg><use xlink:href="#sprite-player-playlist"></use></svg>
                        <div class="tooltip">#{player_playlist}</div>
                    </div>
                    <div class="player-panel__next button selector">
                        <svg><use xlink:href="#sprite-player-next"></use></svg>
                        <div class="tooltip">#{torrent_error_next}</div>
                    </div>
                </div>
            </div>
            <div class="player-panel__center">
                <div class="player-panel__playpause button selector">
                    <div>
                        <svg><use xlink:href="#sprite-player-play"></use></svg>
                    </div>
                    <div>
                        <svg><use xlink:href="#sprite-player-pause"></use></svg>
                    </div>
                </div>
            </div>
            <div class="player-panel__right player-panel__tv-visible">
                <div class="player-panel__box-buttons">
                    <div class="player-panel__quality button selector">auto</div>
                </div>
                <div class="player-panel__box-buttons">
                    <div class="player-panel__flow button selector hide">
                        <svg><use xlink:href="#sprite-player-flow"></use></svg>
                        <div class="tooltip">#{player_flow}</div>
                    </div>
                    <div class="player-panel__subs button selector hide">
                        <svg><use xlink:href="#sprite-player-subtitles"></use></svg>
                        <div class="tooltip">#{player_subs}</div>
                    </div>
                    <div class="player-panel__tracks button selector hide">
                        <svg><use xlink:href="#sprite-player-voice"></use></svg>
                        <div class="tooltip">#{player_tracks}</div>
                    </div>
                </div>
                <div class="player-panel__box-buttons">
                    <div class="player-panel__settings button selector">
                        <svg><use xlink:href="#sprite-player-settings"></use></svg>
                        <div class="tooltip">#{title_settings}</div>
                    </div>
                    <div class="player-panel__pip button selector">
                        <svg><use xlink:href="#sprite-player-pip"></use></svg>
                        <div class="tooltip">#{player_pip}</div>
                    </div>
                    <div class="player-panel__volume button selector">
                        <svg><use xlink:href="#sprite-player-volume"></use></svg>
                        <div class="tooltip">#{player_volume}</div>
                        <div class="player-panel__volume-drop">
                            <input type="range" orient="vertical" class="player-panel__volume-range" max="1" min="0" step="0.01" />
                        </div>
                    </div>
                    <div class="player-panel__fullscreen button selector">
                        <svg><use xlink:href="#sprite-player-fullscreen"></use></svg>
                        <div class="tooltip">#{player_size_cover_title}</div>
                    </div>
                </div>
            </div>
            <div class="player-panel__right player-panel__mobile-visible">
                <div class="player-panel__box-buttons">
                    <div class="player-panel__mobile-more button selector">
                        <svg><use xlink:href="#sprite-dots"></use></svg>
                    </div>
                    <div class="player-panel__fullscreen button selector">
                        <svg><use xlink:href="#sprite-player-fullscreen"></use></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`

export default html
