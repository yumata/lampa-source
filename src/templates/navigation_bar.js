let html = `<div class="navigation-bar">
    <div class="navigation-bar__body">
        <div class="navigation-bar__item" data-action="back">
            <div class="navigation-bar__icon">
                <svg><use xlink:href="#sprite-backward"></use></svg>
            </div>
            <div class="navigation-bar__label">#{back}</div>
        </div>

        <div class="navigation-bar__item" data-action="main">
            <div class="navigation-bar__icon">
               <svg><use xlink:href="#sprite-home"></use></svg>
            </div>
            <div class="navigation-bar__label">#{title_main}</div>
        </div>

        <div class="navigation-bar__item" data-action="search">
            <div class="navigation-bar__icon">
                <svg><use xlink:href="#sprite-search"></use></svg>
            </div>
            <div class="navigation-bar__label">#{search}</div>
        </div>

        <div class="navigation-bar__item" data-action="settings">
            <div class="navigation-bar__icon">
                <svg><use xlink:href="#sprite-settings"></use></svg>
            </div>
            <div class="navigation-bar__label">#{menu_settings}</div>
        </div>
    </div>
</div>`

export default html
