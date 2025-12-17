let html = `<div class="full-start-new">

    <div class="full-start-new__body">
        <div class="full-start-new__left">
            <div class="full-start-new__poster">
                <img class="full-start-new__img full--poster" />
            </div>
        </div>

        <div class="full-start-new__right">
            <div class="full-start-new__head"></div>
            <div class="full-start-new__title">{title}</div>
            <div class="full-start-new__tagline full--tagline">{tagline}</div>
            <div class="full-start-new__rate-line">
                <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>
                <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>
                <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>

                <div class="full-start__pg hide"></div>
                <div class="full-start__status hide"></div>
            </div>
            <div class="full-start-new__details"></div>
            <div class="full-start-new__reactions">
                <div>#{reactions_none}</div>
            </div>

            <div class="full-start-new__buttons">
                <div class="full-start__button selector button--play">
                    <svg><use xlink:href="#sprite-play"></use></svg>

                    <span>#{title_watch}</span>
                </div>

                <div class="full-start__button selector button--book">
                    <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                    </svg>

                    <span>#{settings_input_links}</span>
                </div>

                <div class="full-start__button selector button--reaction">
                    <svg><use xlink:href="#sprite-reaction"></use></svg>           

                    <span>#{title_reactions}</span>
                </div>

                <div class="full-start__button selector button--subscribe hide">
                    <svg viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                        <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.6"></path>
                    </svg>

                    <span>#{title_subscribe}</span>
                </div>

                <div class="full-start__button selector button--options">
                    <svg><use xlink:href="#sprite-dots"></use></svg>
                </div>
            </div>
        </div>
    </div>

    <div class="hide buttons--container">
        <div class="full-start__button view--torrent hide">
            <svg><use xlink:href="#sprite-torrent"></use></svg>

            <span>#{full_torrents}</span>
        </div>

        <div class="full-start__button selector view--trailer">
            <svg><use xlink:href="#sprite-trailer"></use></svg>

            <span>#{full_trailers}</span>
        </div>
    </div>
</div>`

export default html