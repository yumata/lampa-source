let html = `<div class="extensions__item selector layer--visible layer--render">
    <div class="extensions__item-author"></div>
    <div class="extensions__item-name"></div>
    <div class="extensions__item-descr"></div>
    <div class="extensions__item-footer">
        <div class="extensions__item-error hide"></div>
        <div class="extensions__item-included hide"></div>
        <div class="extensions__item-check hide"></div>
        <div class="extensions__item-proto hide">
            <svg width="21" height="30" viewBox="0 0 21 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10.5" cy="8.5" r="7" stroke="currentColor" stroke-width="3"/>
                <rect y="9" width="21" height="21" rx="4" fill="currentColor"/>
            </svg>
        </div>
        <div class="extensions__item-code hide success"></div>
        <div class="extensions__item-status hide"></div>
        <div class="extensions__item-disabled hide">#{player_disabled}</div>
    </div>
</div>`

export default html