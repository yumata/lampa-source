let html = `<div class="friend-profile layer--width">
    <div class="friend-profile__left">
        <div class="friend-profile__left-body">
            <div class="friend-profile__panel friend-profile__user">
                <div class="friend-profile__avatar"><img src="./img/img_load.svg" /></div>
                <div class="friend-profile__user-body">
                    <div class="friend-profile__name"></div>
                    <div class="friend-profile__since"></div>
                </div>
            </div>
            <div class="friend-profile__panel friend-profile__watching hide">
                <div class="friend-profile__panel-title"><svg><use xlink:href="#sprite-player-play"></use></svg><span>#{friends_now_watching}</span></div>
                <div class="friend-profile__movie selector">
                    <div class="friend-profile__movie-img"><img /></div>
                    <div class="friend-profile__movie-body">
                        <div class="friend-profile__movie-title"></div>
                        <div class="friend-profile__movie-meta"></div>
                    </div>
                </div>
            </div>
            <div class="friend-profile__panel friend-profile__opened hide">
                <div class="friend-profile__panel-title"><svg><use xlink:href="#sprite-lock"></use></svg><span>#{friends_opened}</span></div>
                <div class="friend-profile__tags"></div>
            </div>
        </div>
    </div>
    <div class="friend-profile__right">
        <div class="friend-profile__head">
            <div class="friend-profile__mini">
                <div class="friend-profile__avatar friend-profile__mini-avatar"><img src="./img/img_load.svg" /></div>
                <div class="friend-profile__user-body">
                    <div class="friend-profile__name"></div>
                    <div class="friend-profile__since friend-profile__mini-status"></div>
                </div>
            </div>
            <div class="navigation-tabs friend-profile__tabs"></div>
        </div>
        <div class="friend-profile__body">
            <div class="friend-profile__content"></div>
        </div>
    </div>
</div>`

export default html
