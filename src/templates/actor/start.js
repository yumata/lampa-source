let html = `<div class="actor-start">

    <div class="actor-start__body">
        <div class="actor-start__right">
            <div class="actor-start__poster">
                <img src="{img}" class="actor-start__img" />
            </div>
        </div>

        <div class="actor-start__left">
            <div class="actor-start__tags">
                <div class="actor-start__tag">
                    <img src="./img/icons/pulse.svg" /> <div>{birthday}</div>
                </div>
            </div>
            
            <div class="actor-start__name">{name}</div>
            <div class="actor-start__place">{place}</div>

            <div class="actor-start__descr">{descr}</div>


            
        </div>
    </div>

    <div class="full-start__buttons hide">
        <div class="full-start__button selector">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                <g>
                    <g>
                        <path fill="currentColor" d="M436.742,180.742c-41.497,0-75.258,33.761-75.258,75.258s33.755,75.258,75.258,75.258
                            C478.239,331.258,512,297.503,512,256C512,214.503,478.239,180.742,436.742,180.742z M436.742,294.246
                            c-21.091,0-38.246-17.155-38.246-38.246s17.155-38.246,38.246-38.246s38.246,17.155,38.246,38.246
                            S457.833,294.246,436.742,294.246z"/>
                    </g>
                </g>
                <g>
                    <g>
                        <path fill="currentColor" d="M256,180.742c-41.497,0-75.258,33.761-75.258,75.258s33.761,75.258,75.258,75.258c41.503,0,75.258-33.755,75.258-75.258
                            C331.258,214.503,297.503,180.742,256,180.742z M256,294.246c-21.091,0-38.246-17.155-38.246-38.246s17.155-38.246,38.246-38.246
                            s38.246,17.155,38.246,38.246S277.091,294.246,256,294.246z"/>
                    </g>
                </g>
                <g>
                    <g>
                        <path fill="currentColor" d="M75.258,180.742C33.761,180.742,0,214.503,0,256c0,41.503,33.761,75.258,75.258,75.258
                            c41.497,0,75.258-33.755,75.258-75.258C150.516,214.503,116.755,180.742,75.258,180.742z M75.258,294.246
                            c-21.091,0-38.246-17.155-38.246-38.246s17.155-38.246,38.246-38.246c21.091,0,38.246,17.155,38.246,38.246
                            S96.342,294.246,75.258,294.246z"/>
                    </g>
                </g>
            </svg>
        </div>

        <div class="full-start__icons">
            <div class="info__icon icon--like"></div>
        </div>
    </div>
</div>`

export default html