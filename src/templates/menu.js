let html = `<div class="menu">

    <div class="menu__case">
        <ul class="menu__list">
            
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