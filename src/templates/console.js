let html = `<div class="console">
    <div class="console__head">
        <div class="console__head-info">
            <div class="console__title">#{menu_console}</div>
            <div class="console__subtitle">#{console_subtitle} · {app}</div>
        </div>
        <div class="console__stats">
            <div class="console__stat console__stat--errors">
                <div class="console__stat-value">0</div>
                <div class="console__stat-name">#{console_errors}</div>
            </div>
            <div class="console__stat console__stat--warnings">
                <div class="console__stat-value">0</div>
                <div class="console__stat-name">#{console_warnings}</div>
            </div>
            <div class="console__stat console__stat--total">
                <div class="console__stat-value">0</div>
                <div class="console__stat-name">#{console_total}</div>
            </div>
        </div>
    </div>
    <div class="console__content">
        <div class="console__sidebar"></div>
        <div class="console__main">
            <div class="console__buttons">
                <div class="console__button selector" data-action="send">#{console_send}</div>
                <div class="console__button selector" data-action="clear">#{console_clear}</div>
                <div class="console__button selector" data-action="close">#{console_close}</div>
            </div>
            <div class="console__new selector hide"></div>
            <div class="console__body"></div>
        </div>
    </div>
    <div class="console__footer">#{console_hint}</div>
</div>`

export default html
