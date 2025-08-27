let html = `<div class="menu">

    <div class="menu__case">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="main">
                <div class="menu__ico">
                    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                        <path fill="currentColor" d="M475.425,200.225L262.092,4.669c-6.951-6.359-17.641-6.204-24.397,0.35L36.213,200.574
                        c-3.449,3.348-5.399,7.953-5.399,12.758v280.889c0,9.819,7.958,17.778,17.778,17.778h148.148c9.819,0,17.778-7.959,17.778-17.778
                        v-130.37h82.963v130.37c0,9.819,7.958,17.778,17.778,17.778h148.148c9.819,0,17.778-7.953,17.778-17.778V213.333
                        C481.185,208.349,479.099,203.597,475.425,200.225z M445.629,476.444H333.037v-130.37c0-9.819-7.959-17.778-17.778-17.778H196.741
                        c-9.819,0-17.778,7.959-17.778,17.778v130.37H66.37V220.853L250.424,42.216l195.206,178.939V476.444z"/>
                    </svg>
           
                </div>
                <div class="menu__text">#{menu_main}</div>
            </li>

            <li class="menu__item selector" data-action="feed">
                <div class="menu__ico">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 0L11.4308 6.56918L18 9L11.4308 11.4308L9 18L6.56918 11.4308L0 9L6.56918 6.56918L9 0Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_feed}</div>
            </li>

            <li class="menu__item selector" data-action="movie">
                <div class="menu__ico">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                            <path fill="currentColor" d="M256,81.077C159.55,81.077,81.077,159.55,81.077,256c0,10.578,8.574,19.152,19.152,19.152s19.152-8.574,19.152-19.158
                                c0-75.325,61.287-136.612,136.618-136.612c10.572,0,19.152-8.574,19.152-19.152S266.578,81.077,256,81.077z"/>
                        
                            <path fill="currentColor" d="M411.771,236.848c-10.578,0-19.152,8.574-19.152,19.152c0,75.325-61.287,136.618-136.618,136.618
                                c-10.578,0-19.152,8.574-19.152,19.152c0,10.578,8.574,19.152,19.152,19.152c96.45,0,174.923-78.473,174.923-174.923
                                C430.923,245.422,422.349,236.848,411.771,236.848z"/>
                       
                            <path fill="currentColor" d="M256,0C114.843,0,0,114.843,0,256s114.843,256,256,256s256-114.842,256-256S397.158,0,256,0z M256,473.696
                                c-120.039,0-217.696-97.657-217.696-217.696S135.961,38.304,256,38.304s217.696,97.65,217.696,217.689
                                S376.039,473.696,256,473.696z"/>
                        
                            <path fill="currentColor" d="M256,158.318c-53.856,0-97.676,43.814-97.676,97.676s43.814,97.682,97.676,97.682c53.862,0,97.676-43.82,97.676-97.682
                                S309.862,158.318,256,158.318z M256,315.378c-32.737,0-59.372-26.634-59.372-59.378c0-32.737,26.634-59.372,59.372-59.372
                                c32.744,0,59.372,26.634,59.372,59.372C315.372,288.744,288.737,315.378,256,315.378z"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_movies}</div>
            </li>

            <li class="menu__item selector" data-action="tv">
                <div class="menu__ico">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                        <path fill="currentColor" d="M503.17,240.148L289.423,107.799c-5.735-3.548-12.98-3.722-18.883-0.435c-5.909,3.293-9.569,9.525-9.569,16.286v264.699
                        c0,6.76,3.66,12.993,9.569,16.286c2.827,1.572,5.953,2.355,9.072,2.355c3.411,0,6.816-0.932,9.811-2.79L503.17,271.85
                        c5.493-3.399,8.83-9.395,8.83-15.851C512,249.543,508.663,243.547,503.17,240.148z M298.252,354.888V157.122l159.695,98.877
                        L298.252,354.888z"/>
                        <path fill="currentColor" d="M242.2,240.148L28.452,107.799c-5.754-3.554-12.98-3.722-18.883-0.435C3.66,110.657,0,116.889,0,123.649v264.699
                        c0,6.76,3.66,12.993,9.569,16.286c2.827,1.572,5.953,2.355,9.072,2.355c3.405,0,6.81-0.932,9.811-2.79L242.2,271.85
                        c5.487-3.399,8.83-9.395,8.83-15.851C251.029,249.543,247.686,243.547,242.2,240.148z M37.282,354.888V157.122l159.696,98.877
                        L37.282,354.888z"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_tv}</div>
            </li>

            <li class="menu__item selector" data-action="myperson">
                <div class="menu__ico">
                    <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16.6978" cy="8.92432" r="6.88428" stroke="currentColor" stroke-width="3"/>
                        <path d="M30.9312 29.9561C30.9312 22.0952 24.5586 15.7227 16.6978 15.7227C8.83686 15.7227 2.46436 22.0952 2.46436 29.9561" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    </svg>

                </div>
                <div class="menu__text">#{title_persons}</div>
            </li>

            <li class="menu__item selector" data-action="catalog">
                <div class="menu__ico">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                        <path fill="currentColor" d="M478.354,146.286H33.646c-12.12,0-21.943,9.823-21.943,21.943v321.829c0,12.12,9.823,21.943,21.943,21.943h444.709
                            c12.12,0,21.943-9.823,21.943-21.943V168.229C500.297,156.109,490.474,146.286,478.354,146.286z M456.411,468.114H55.589V190.171
                            h400.823V468.114z"/>
                    
                        <path fill="currentColor" d="M441.783,73.143H70.217c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h371.566
                            c12.12,0,21.943-9.823,21.943-21.943C463.726,82.966,453.903,73.143,441.783,73.143z"/>
                    
                        <path fill="currentColor" d="M405.211,0H106.789c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h298.423
                            c12.12,0,21.943-9.823,21.943-21.943C427.154,9.823,417.331,0,405.211,0z"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_catalog}</div>
            </li>
            <li class="menu__item selector" data-action="filter">
                <div class="menu__ico">
                    <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"/>
                        <rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"/>
                        <rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"/>
                        <rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"/>
                        <circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"/>
                        <circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"/>
                        <circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_filter}</div>
            </li>
            <li class="menu__item selector" data-action="relise">
                <div class="menu__ico">
                    <svg height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="currentColor" stroke-width="3"/>
                        <path d="M18.105 22H15.2936V16H9.8114V22H7V8H9.8114V13.6731H15.2936V8H18.105V22Z" fill="currentColor"/>
                        <path d="M20.5697 22V8H24.7681C25.9676 8 27.039 8.27885 27.9824 8.83654C28.9321 9.38782 29.6724 10.1763 30.2034 11.2019C30.7345 12.2212 31 13.3814 31 14.6827V15.3269C31 16.6282 30.7376 17.7853 30.2128 18.7981C29.6943 19.8109 28.9602 20.5962 28.0105 21.1538C27.0609 21.7115 25.9895 21.9936 24.7962 22H20.5697ZM23.3811 10.3365V19.6827H24.7399C25.8395 19.6827 26.6798 19.3141 27.2608 18.5769C27.8419 17.8397 28.1386 16.7853 28.1511 15.4135V14.6731C28.1511 13.25 27.8637 12.1731 27.289 11.4423C26.7142 10.7051 25.8739 10.3365 24.7681 10.3365H23.3811Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_relises}</div>
            </li>
            <li class="menu__item selector" data-action="anime">
                <div class="menu__ico">
                    <svg height="173" viewBox="0 0 180 173" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M126 3C126 18.464 109.435 31 89 31C68.5655 31 52 18.464 52 3C52 2.4505 52.0209 1.90466 52.0622 1.36298C21.3146 15.6761 0 46.8489 0 83C0 132.706 40.2944 173 90 173C139.706 173 180 132.706 180 83C180 46.0344 157.714 14.2739 125.845 0.421326C125.948 1.27051 126 2.13062 126 3ZM88.5 169C125.779 169 156 141.466 156 107.5C156 84.6425 142.314 64.6974 122 54.0966C116.6 51.2787 110.733 55.1047 104.529 59.1496C99.3914 62.4998 94.0231 66 88.5 66C82.9769 66 77.6086 62.4998 72.4707 59.1496C66.2673 55.1047 60.3995 51.2787 55 54.0966C34.6864 64.6974 21 84.6425 21 107.5C21 141.466 51.2208 169 88.5 169Z" fill="currentColor"/>
                        <path d="M133 121.5C133 143.315 114.196 161 91 161C67.804 161 49 143.315 49 121.5C49 99.6848 67.804 116.5 91 116.5C114.196 116.5 133 99.6848 133 121.5Z" fill="currentColor"/>
                        <path d="M72 81C72 89.8366 66.1797 97 59 97C51.8203 97 46 89.8366 46 81C46 72.1634 51.8203 65 59 65C66.1797 65 72 72.1634 72 81Z" fill="currentColor"/>
                        <path d="M131 81C131 89.8366 125.18 97 118 97C110.82 97 105 89.8366 105 81C105 72.1634 110.82 65 118 65C125.18 65 131 72.1634 131 81Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_anime}</div>
            </li>
        
            <li class="menu__item selector" data-action="favorite">
                <div class="menu__ico">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                   <path fill="currentColor" d="M391.416,0H120.584c-17.778,0-32.242,14.464-32.242,32.242v460.413c0,7.016,3.798,13.477,9.924,16.895
                       c2.934,1.638,6.178,2.45,9.421,2.45c3.534,0,7.055-0.961,10.169-2.882l138.182-85.312l138.163,84.693
                       c5.971,3.669,13.458,3.817,19.564,0.387c6.107-3.418,9.892-9.872,9.892-16.875V32.242C423.657,14.464,409.194,0,391.416,0z
                        M384.967,457.453l-118.85-72.86c-6.229-3.817-14.07-3.798-20.28,0.032l-118.805,73.35V38.69h257.935V457.453z"/>
                    </svg>
                </div>
                <div class="menu__text">#{settings_input_links}</div>
            </li>


            <li class="menu__item selector" data-action="history">
                <div class="menu__ico">
                    <svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="currentColor" stroke-width="3"/>
                    <rect x="6" y="7" width="9" height="9" rx="1" fill="currentColor"/>
                    <rect x="6" y="19" width="16" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="6" y="25" width="11" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="17" y="7" width="5" height="3" rx="1.5" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_history}</div>
            </li>

            <li class="menu__item selector" data-action="subscribes">
                <div class="menu__ico">
                    <svg xmlns="http://www.w3.org/2000/svg" height="512" viewBox="0 0 59 59.5" xml:space="preserve">
                        <path d="m48.5 20.5h-38a10.51 10.51 0 0 0 -10.5 10.5v18a10.51 10.51 0 0 0 10.5 10.5h38a10.51 10.51 0 0 0 10.5-10.5v-18a10.51 10.51 0 0 0 -10.5-10.5zm-9.23 16.06-10.42 10.44a2.51 2.51 0 0 1 -3.54 0l-5.58-5.6a2.5 2.5 0 1 1 3.54-3.54l3.81 3.82 8.65-8.68a2.5 2.5 0 0 1 3.54 3.53z" fill="currentColor"></path>
                        <path d="m49.5 16h-40a3 3 0 0 1 0-6h40a3 3 0 0 1 0 6z" fill="currentColor"></path>
                        <path d="m45.5 6h-32a3 3 0 0 1 0-6h32a3 3 0 0 1 0 6z" fill="currentColor"></path>
                    </svg>
                </div>
                <div class="menu__text">#{title_subscribes}</div>
            </li>

            <li class="menu__item selector" data-action="timetable">
                <div class="menu__ico">
                    <svg height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1.5" y="3.5" width="25" height="23" rx="2.5" stroke="currentColor" stroke-width="3"/>
                        <rect x="6" width="3" height="7" rx="1.5" fill="currentColor"/>
                        <rect x="19" width="3" height="7" rx="1.5" fill="currentColor"/>
                        <circle cx="7" cy="12" r="2" fill="currentColor"/>
                        <circle cx="7" cy="19" r="2" fill="currentColor"/>
                        <circle cx="14" cy="12" r="2" fill="currentColor"/>
                        <circle cx="14" cy="19" r="2" fill="currentColor"/>
                        <circle cx="21" cy="12" r="2" fill="currentColor"/>
                        <circle cx="21" cy="19" r="2" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_timeline}</div>
            </li>

            <li class="menu__item selector" data-action="mytorrents">
                <div class="menu__ico">
                    <svg height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="25" height="31" rx="2.5" stroke="currentColor" stroke-width="3"/>
                    <rect x="6" y="7" width="16" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="6" y="13" width="16" height="3" rx="1.5" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_torrents}</div>
            </li>
        </ul>
    </div>

    <div class="menu__split"></div>

    <div class="menu__case nosort">
        <ul class="menu__list">
            <li class="menu__item selector" data-action="settings">
                <div class="menu__ico">
                    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.35883 18.1883L1.63573 17.4976L2.35883 18.1883L3.00241 17.5146C3.8439 16.6337 4.15314 15.4711 4.15314 14.4013C4.15314 13.3314 3.8439 12.1688 3.00241 11.2879L2.27931 11.9786L3.00241 11.2879L2.35885 10.6142C1.74912 9.9759 1.62995 9.01336 2.0656 8.24564L2.66116 7.19613C3.10765 6.40931 4.02672 6.02019 4.90245 6.24719L5.69281 6.45206C6.87839 6.75939 8.05557 6.45293 8.98901 5.90194C9.8943 5.36758 10.7201 4.51559 11.04 3.36732L11.2919 2.46324C11.5328 1.59833 12.3206 1 13.2185 1H14.3282C15.225 1 16.0121 1.59689 16.2541 2.46037L16.5077 3.36561C16.8298 4.51517 17.6582 5.36897 18.5629 5.90557C19.498 6.4602 20.6725 6.75924 21.8534 6.45313L22.6478 6.2472C23.5236 6.02019 24.4426 6.40932 24.8891 7.19615L25.4834 8.24336C25.9194 9.0118 25.7996 9.97532 25.1885 10.6135L24.5426 11.2882C23.7 12.1684 23.39 13.3312 23.39 14.4013C23.39 15.4711 23.6992 16.6337 24.5407 17.5146L25.1842 18.1883C25.794 18.8266 25.9131 19.7891 25.4775 20.5569L24.8819 21.6064C24.4355 22.3932 23.5164 22.7823 22.6406 22.5553L21.8503 22.3505C20.6647 22.0431 19.4876 22.3496 18.5541 22.9006C17.6488 23.4349 16.8231 24.2869 16.5031 25.4352L16.2513 26.3393C16.0103 27.2042 15.2225 27.8025 14.3246 27.8025H13.2184C12.3206 27.8025 11.5328 27.2042 11.2918 26.3393L11.0413 25.4402C10.7206 24.2889 9.89187 23.4336 8.98627 22.8963C8.05183 22.342 6.87822 22.0432 5.69813 22.3491L4.90241 22.5553C4.02667 22.7823 3.10759 22.3932 2.66111 21.6064L2.06558 20.5569C1.62993 19.7892 1.74911 18.8266 2.35883 18.1883Z" stroke="currentColor" stroke-width="2.4"/>
                        <circle cx="13.7751" cy="14.4013" r="4.1675" stroke="currentColor" stroke-width="2.4"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_settings}</div>
            </li>

            <li class="menu__item selector" data-action="about">
                <div class="menu__ico">
                    <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="m392 512h-272c-66.168 0-120-53.832-120-120v-272c0-66.168 53.832-120 120-120h272c66.168 0 120 53.832 120 120v272c0 66.168-53.832 120-120 120zm-272-472c-44.112 0-80 35.888-80 80v272c0 44.112 35.888 80 80 80h272c44.112 0 80-35.888 80-80v-272c0-44.112-35.888-80-80-80zm206 342c0 11.046-8.954 20-20 20h-100c-26.536-1.056-26.516-38.953 0-40h30v-113c0-11.028-8.972-20-20-20h-10c-26.536-1.056-26.516-38.953 0-40h10c33.084 0 60 26.916 60 60v113h30c11.046 0 20 8.954 20 20zm-70-222c13.807 0 25-11.193 25-25-1.317-33.162-48.688-33.153-50 0 0 13.807 11.193 25 25 25z"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_about}</div>
            </li>

            <li class="menu__item selector" data-action="console">
                <div class="menu__ico">
                    <svg height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="currentColor" stroke-width="3"/>
                    <rect x="6" y="7" width="25" height="3" fill="currentColor"/>
                    <rect x="6" y="13" width="13" height="3" fill="currentColor"/>
                    <rect x="6" y="19" width="19" height="3" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">#{menu_console}</div>
            </li>

            <li class="menu__item selector" data-action="edit">
                <div class="menu__ico">
                    <svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>
                    </svg>

                </div>
                <div class="menu__text">Редактировать</div>
            </li>
        </ul>
    </div>
</div>`

export default html