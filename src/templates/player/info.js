let html = `<div class="player-info">
    <div class="player-info__body">
        <div class="player-info__title"></div>
        <div class="player-info__line">
            <div class="player-info__name"></div>
            <div class="player-info__time"><span class="time--clock"></span></div>
            <div class="player-info__time-end"><span></span></div>
        </div>

        <div class="player-info__values">
            <div class="value--size">
                <span>#{loading}...</span>
            </div>
            <div class="value--name"><span></span></div>
            <div class="value--stat">
                <span></span>
            </div>
            <div class="value--speed">
                <span></span>
            </div>
            <div class="value--pieces"></div>
        </div>

        <div class="player-info__error hide"></div>
    </div>
</div>`

export default html