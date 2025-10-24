let html = `<div class="head">
    <div class="head__body">
        <div class="head__logo-icon">
            <img src="./img/logo-icon.svg" />
        </div>

        <div class="head__menu-icon">
            <svg><use xlink:href="#sprite-menu"></use></svg>
        </div>

        <div class="head__title"></div>
        
        <div class="head__actions">
            <div class="head__action selector hide full--screen">
                <svg><use xlink:href="#sprite-fullscreen"></use></svg>
            </div>
        </div>

        <div class="head__markers">
            <div class="head__markers-item item--socket"></div>
            <div class="head__markers-item item--mirrors"></div>
            <div class="head__markers-item item--request"></div>
        </div>

        <div class="head__time">
            <div class="head__time-now time--clock"></div>
            <div>
                <div class="head__time-date time--full"></div>
                <div class="head__time-week time--week"></div>
            </div>
        </div>
    </div>
</div>`

export default html