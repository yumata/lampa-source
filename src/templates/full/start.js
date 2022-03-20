let html = `<div class="full-start">

    <div class="full-start__body">
        <div class="full-start__right">
            <div class="full-start__poster">
                <img class="full-start__img" />

                <div class="info__rate"><span>{r_themovie}</span></div>
            </div>
        </div>

        <div class="full-start__left">
            <div class="full-start__tags">
                <div class="full-start__tag tag--genres">
                    <img src="./img/icons/pulse.svg" /> <div>{genres}</div>
                </div>
                <div class="full-start__tag tag--time">
                    <img src="./img/icons/time.svg" /> <div>{time}</div>
                </div>
                <div class="full-start__tag hide is--serial">
                    <img src="./img/icons/menu/catalog.svg" /> <div>{seasons}</div>
                </div>
                <div class="full-start__tag hide is--serial">
                    <img src="./img/icons/menu/movie.svg" /> <div>{episodes}</div>
                </div>
                <div class="full-start__tag tag--episode hide">
                    <img src="./img/icons/time.svg" /> <div></div>
                </div>
            </div>

            <div class="full-start__title">{title}</div>
            <div class="full-start__title-original">{original_title}</div>

            <div class="full-start__descr">{descr}</div>
        </div>
    </div>

    <div class="full-start__footer">
        <div class="full-start__title-mobile">{title}</div>

        <div class="full-start__buttons-line">
            <div class="full-start__buttons">
                <div class="full-start__button view--torrent hide">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
                        <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" fill="currentColor"/>
                        <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" fill="currentColor"/>
                    </svg>

                    <span>Торренты</span>
                </div>

                <div class="full-start__button selector view--trailer">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                        <path fill="currentColor" d="M482.909,67.2H29.091C13.05,67.2,0,80.25,0,96.291v319.418C0,431.75,13.05,444.8,29.091,444.8h453.818
                            c16.041,0,29.091-13.05,29.091-29.091V96.291C512,80.25,498.95,67.2,482.909,67.2z M477.091,409.891H34.909V102.109h442.182
                            V409.891z"/>
                        <rect fill="currentColor" x="126.836" y="84.655" width="34.909" height="342.109"/>
                        <rect fill="currentColor" x="350.255" y="84.655" width="34.909" height="342.109"/>
                        <rect fill="currentColor" x="367.709" y="184.145" width="126.836" height="34.909"/>
                        <rect fill="currentColor" x="17.455" y="184.145" width="126.836" height="34.909"/>
                        <rect fill="currentColor" x="367.709" y="292.364" width="126.836" height="34.909"/>
                        <rect fill="currentColor" x="17.455" y="292.364" width="126.836" height="34.909"/>
                    </svg>

                    <span>Трейлеры</span>
                </div>

                

                <div class="full-start__button selector open--menu">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                        <path fill="currentColor" d="M436.742,180.742c-41.497,0-75.258,33.761-75.258,75.258s33.755,75.258,75.258,75.258
                            C478.239,331.258,512,297.503,512,256C512,214.503,478.239,180.742,436.742,180.742z M436.742,294.246
                            c-21.091,0-38.246-17.155-38.246-38.246s17.155-38.246,38.246-38.246s38.246,17.155,38.246,38.246
                            S457.833,294.246,436.742,294.246z"/>
                    
                        <path fill="currentColor" d="M256,180.742c-41.497,0-75.258,33.761-75.258,75.258s33.761,75.258,75.258,75.258c41.503,0,75.258-33.755,75.258-75.258
                            C331.258,214.503,297.503,180.742,256,180.742z M256,294.246c-21.091,0-38.246-17.155-38.246-38.246s17.155-38.246,38.246-38.246
                            s38.246,17.155,38.246,38.246S277.091,294.246,256,294.246z"/>
                    
                        <path fill="currentColor" d="M75.258,180.742C33.761,180.742,0,214.503,0,256c0,41.503,33.761,75.258,75.258,75.258
                            c41.497,0,75.258-33.755,75.258-75.258C150.516,214.503,116.755,180.742,75.258,180.742z M75.258,294.246
                            c-21.091,0-38.246-17.155-38.246-38.246s17.155-38.246,38.246-38.246c21.091,0,38.246,17.155,38.246,38.246
                            S96.342,294.246,75.258,294.246z"/>
                    </svg>
                </div>

                
            </div>

            <div class="full-start__icons">
                <div class="info__icon icon--book selector" data-type="book"></div>
                <div class="info__icon icon--like selector" data-type="like"></div>
                <div class="info__icon icon--wath selector" data-type="wath"></div>
            </div>
        </div>

    </div>
</div>`

export default html