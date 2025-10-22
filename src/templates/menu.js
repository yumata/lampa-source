let html = `<div class="menu">

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="main">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-home"></use></svg>
                </div>
                <div class="menu__text">#{menu_main}</div>
            </li>

            <li class="menu__item selector" data-action="feed">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-feed"></use></svg>
                </div>
                <div class="menu__text">#{menu_feed}</div>
            </li>

            <li class="menu__item selector" data-action="movie">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-movie"></use></svg>
                </div>
                <div class="menu__text">#{menu_movies}</div>
            </li>

            <li class="menu__item selector" data-action="tv">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-tv"></use></svg>
                </div>
                <div class="menu__text">#{menu_tv}</div>
            </li>

            <li class="menu__item selector" data-action="myperson">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-person"></use></svg>
                </div>
                <div class="menu__text">#{title_persons}</div>
            </li>

            <li class="menu__item selector" data-action="catalog">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-catalog"></use></svg>
                </div>
                <div class="menu__text">#{menu_catalog}</div>
            </li>

            <li class="menu__item selector" data-action="filter">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-filter"></use></svg>
                </div>
                <div class="menu__text">#{menu_filter}</div>
            </li>

            <li class="menu__item selector" data-action="relise">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-hd"></use></svg>
                </div>
                <div class="menu__text">#{menu_relises}</div>
            </li>

            <li class="menu__item selector" data-action="anime">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-anime"></use></svg>
                </div>
                <div class="menu__text">#{menu_anime}</div>
            </li>
        
            <li class="menu__item selector" data-action="favorite">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-favorite"></use></svg>
                </div>
                <div class="menu__text">#{settings_input_links}</div>
            </li>

            <li class="menu__item selector" data-action="history">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-folder"></use></svg>
                </div>
                <div class="menu__text">#{menu_history}</div>
            </li>

            <li class="menu__item selector" data-action="subscribes">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-subscribes"></use></svg>
                </div>
                <div class="menu__text">#{title_subscribes}</div>
            </li>

            <li class="menu__item selector" data-action="timetable">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-calendar"></use></svg>
                </div>
                <div class="menu__text">#{menu_timeline}</div>
            </li>

            <li class="menu__item selector" data-action="mytorrents">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-torrent"></use></svg>
                </div>
                <div class="menu__text">#{menu_torrents}</div>
            </li>
        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case nosort">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="settings">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-settings"></use></svg>
                </div>
                <div class="menu__text">#{menu_settings}</div>
            </li>

            <li class="menu__item selector" data-action="about">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-info"></use></svg>
                </div>
                <div class="menu__text">#{menu_about}</div>
            </li>

            <li class="menu__item selector" data-action="console">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-console"></use></svg>
                </div>
                <div class="menu__text">#{menu_console}</div>
            </li>
        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case nosort">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="edit">
                <div class="menu__ico">
                    <svg><use xlink:href="#sprite-edit"></use></svg>
                </div>
                <div class="menu__text">#{extensions_edit}</div>
            </li>
        </ul>
    </div>
</div>`

export default html