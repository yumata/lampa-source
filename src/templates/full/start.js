let html = `<div class="full-start">

    <div class="full-start__body">
        <div class="full-start__right">
            <div class="full-start__poster">
                <img class="full-start__img full--poster" />
            </div>
        </div>

        <div class="full-start__left">
            <div class="full-start__deta">
                <div class="info__rate"><span>{rating}</span><div>TMDB</div></div>

                <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>
                <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>

                <div class="full-start__pg hide"></div>
            </div>

            <div class="full-start__title">{title}</div>
            <div class="full-start__title-original">{original_title}</div>

            <div class="full-start__tags">
                <div class="full-start__tag tag--quality hide">
                    <div></div>
                </div>
                <div class="full-start__tag tag--year hide">
                    <img src="./img/icons/add.svg" /> <div></div>
                </div>
                <div class="full-start__tag tag--countries">
                    <div>{countries}</div>
                </div>
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

            <div class="full-start__icons">
                <div class="info__icon icon--book selector" data-type="book"></div>
                <div class="info__icon icon--like selector" data-type="like"></div>
                <div class="info__icon icon--wath selector" data-type="wath"></div>
                <div class="info__icon button--subscribe selector hide" data-type="subscribe">
                    <svg enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><path fill="currentColor" d="m411 262.862v-47.862c0-69.822-46.411-129.001-110-148.33v-21.67c0-24.813-20.187-45-45-45s-45 20.187-45 45v21.67c-63.59 19.329-110 78.507-110 148.33v47.862c0 61.332-23.378 119.488-65.827 163.756-4.16 4.338-5.329 10.739-2.971 16.267s7.788 9.115 13.798 9.115h136.509c6.968 34.192 37.272 60 73.491 60 36.22 0 66.522-25.808 73.491-60h136.509c6.01 0 11.439-3.587 13.797-9.115s1.189-11.929-2.97-16.267c-42.449-44.268-65.827-102.425-65.827-163.756zm-170-217.862c0-8.271 6.729-15 15-15s15 6.729 15 15v15.728c-4.937-.476-9.94-.728-15-.728s-10.063.252-15 .728zm15 437c-19.555 0-36.228-12.541-42.42-30h84.84c-6.192 17.459-22.865 30-42.42 30zm-177.67-60c34.161-45.792 52.67-101.208 52.67-159.138v-47.862c0-68.925 56.075-125 125-125s125 56.075 125 125v47.862c0 57.93 18.509 113.346 52.671 159.138z"></path><path fill="currentColor" d="m451 215c0 8.284 6.716 15 15 15s15-6.716 15-15c0-60.1-23.404-116.603-65.901-159.1-5.857-5.857-15.355-5.858-21.213 0s-5.858 15.355 0 21.213c36.831 36.831 57.114 85.8 57.114 137.887z"></path><path fill="currentColor" d="m46 230c8.284 0 15-6.716 15-15 0-52.086 20.284-101.055 57.114-137.886 5.858-5.858 5.858-15.355 0-21.213-5.857-5.858-15.355-5.858-21.213 0-42.497 42.497-65.901 98.999-65.901 159.099 0 8.284 6.716 15 15 15z"></path></g></svg>
                </div>
            </div>
        </div>
    </div>

    <div class="full-start__footer">
            <div class="full-start__buttons-scroll"></div>

            <div class="full-start__buttons">
                <div class="full-start__button view--torrent hide">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
                        <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" fill="currentColor"/>
                        <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" fill="currentColor"/>
                    </svg>

                    <span>#{full_torrents}</span>
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

                    <span>#{full_trailers}</span>
                </div>
            </div>
    </div>
</div>`

export default html