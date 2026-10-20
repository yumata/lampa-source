let html = `<div class="extensions__item extensions__item--recomend selector layer--visible layer--render">
    <div class="extensions__item-imagebox">
        <img class="extensions__item-image" />
    </div>
    <div class="extensions__item-body">
        <div class="extensions__item-author"></div>
        <div class="extensions__item-name"></div>
        <div class="extensions__item-descr"></div>
        <div class="extensions__item-footer">
            <div class="extensions__item-installs hide">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 20H20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                </svg>
                <span></span>
            </div>
            <div class="extensions__item-included hide"></div>
            <div class="extensions__item-check hide"></div>
            <div class="extensions__item-code hide success"></div>
            <div class="extensions__item-status hide"></div>
            <div class="extensions__item-disabled hide">#{player_disabled}</div>
            <div class="extensions__item-price hide"></div>
        </div>
    </div>
</div>`

export default html