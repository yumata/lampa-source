let html = `<div class="menu">

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="main">
                <div class="menu__ico"><img src="./img/icons/menu/home.svg" /></div>
                <div class="menu__text">Главная</div>
            </li>

            <li class="menu__item selector" data-action="movie">
                <div class="menu__ico"><img src="./img/icons/menu/movie.svg" /></div>
                <div class="menu__text">Фильмы</div>
            </li>

            <li class="menu__item selector" data-action="tv">
                <div class="menu__ico"><img src="./img/icons/menu/tv.svg" /></div>
                <div class="menu__text">Сериалы</div>
            </li>

            <li class="menu__item selector" data-action="catalog">
                <div class="menu__ico"><img src="./img/icons/menu/catalog.svg" /></div>
                <div class="menu__text">Каталог</div>
            </li>
            <li class="menu__item selector" data-action="filter">
                <div class="menu__ico">
                    <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="white" stroke-width="3"/>
                        <rect x="7" y="8" width="24" height="3" rx="1.5" fill="white"/>
                        <rect x="7" y="16" width="24" height="3" rx="1.5" fill="white"/>
                        <rect x="7" y="25" width="24" height="3" rx="1.5" fill="white"/>
                        <circle cx="13.5" cy="17.5" r="3.5" fill="white"/>
                        <circle cx="23.5" cy="26.5" r="3.5" fill="white"/>
                        <circle cx="21.5" cy="9.5" r="3.5" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">Фильтр</div>
            </li>
            <li class="menu__item selector" data-action="collections">
                <div class="menu__ico"><img src="./img/icons/menu/catalog.svg" /></div>
                <div class="menu__text">Подборки</div>
            </li>
            <li class="menu__item selector" data-action="relise">
                <div class="menu__ico">
                    <svg height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="white" stroke-width="3"/>
                    <path d="M18.105 22H15.2936V16H9.8114V22H7V8H9.8114V13.6731H15.2936V8H18.105V22Z" fill="white"/>
                    <path d="M20.5697 22V8H24.7681C25.9676 8 27.039 8.27885 27.9824 8.83654C28.9321 9.38782 29.6724 10.1763 30.2034 11.2019C30.7345 12.2212 31 13.3814 31 14.6827V15.3269C31 16.6282 30.7376 17.7853 30.2128 18.7981C29.6943 19.8109 28.9602 20.5962 28.0105 21.1538C27.0609 21.7115 25.9895 21.9936 24.7962 22H20.5697ZM23.3811 10.3365V19.6827H24.7399C25.8395 19.6827 26.6798 19.3141 27.2608 18.5769C27.8419 17.8397 28.1386 16.7853 28.1511 15.4135V14.6731C28.1511 13.25 27.8637 12.1731 27.289 11.4423C26.7142 10.7051 25.8739 10.3365 24.7681 10.3365H23.3811Z" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">Релизы</div>
            </li>
            <li class="menu__item selector" data-action="anime">
                <div class="menu__ico">
                    <svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="white"/>
                    <path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="white"/>
                    <path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="white"/>
                    <path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">Аниме</div>
            </li>
        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="favorite" data-type="book">
                <div class="menu__ico"><img src="./img/icons/menu/bookmark.svg" /></div>
                <div class="menu__text">Закладки</div>
            </li>

            <li class="menu__item selector" data-action="favorite" data-type="like">
                <div class="menu__ico"><img src="./img/icons/menu/like.svg" /></div>
                <div class="menu__text">Нравится</div>
            </li>

            <li class="menu__item selector" data-action="favorite" data-type="wath">
                <div class="menu__ico"><img src="./img/icons/menu/time.svg" /></div>
                <div class="menu__text">Позже</div>
            </li>

            <li class="menu__item selector" data-action="favorite" data-type="history">
                <div class="menu__ico">
                    <svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="white" stroke-width="3"/>
                    <rect x="6" y="7" width="9" height="9" rx="1" fill="white"/>
                    <rect x="6" y="19" width="16" height="3" rx="1.5" fill="white"/>
                    <rect x="6" y="25" width="11" height="3" rx="1.5" fill="white"/>
                    <rect x="17" y="7" width="5" height="3" rx="1.5" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">История</div>
            </li>

            <li class="menu__item selector" data-action="mytorrents">
                <div class="menu__ico">
                    <svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="white" stroke-width="3"/>
                    <rect x="6" y="7" width="16" height="3" rx="1.5" fill="white"/>
                    <rect x="6" y="13" width="16" height="3" rx="1.5" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">Торренты</div>
            </li>
        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="settings">
                <div class="menu__ico"><img src="./img/icons/menu/settings.svg" /></div>
                <div class="menu__text">Настройки</div>
            </li>

            <li class="menu__item selector" data-action="about">
                <div class="menu__ico"><img src="./img/icons/menu/info.svg" /></div>
                <div class="menu__text">О приложении</div>
            </li>
        </ul>
    </div>
</div>`

export default html