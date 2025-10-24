let html = `<div class="person-start">

    <div class="person-start__body">
        <div class="person-start__right">
            <div class="person-start__poster">
                <img class="person-start__img" />
            </div>
        </div>

        <div class="person-start__left">
            <div class="person-start__tags">
                <div class="person-start__tag">
                    <img src="./img/icons/pulse.svg" /> <div>{birthday}</div>
                </div>
            </div>
            
            <div class="person-start__name">{name}</div>
            <div class="person-start__place">{place}</div>

            <div class="person-start__bottom">
                <div class="full-start__button selector button--info">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512" xml:space="preserve">
                        <path d="M459.027 144.337 319.377 4.687A16 16 0 0 0 308.063 0H99.509C71.265 0 48.287 22.978 48.287 51.222v409.556c0 28.244 22.978 51.222 51.222 51.222H412.49c28.244 0 51.222-22.978 51.222-51.222V155.65a15.995 15.995 0 0 0-4.685-11.313zM324.063 54.628l85.022 85.023h-85.022zM412.491 480H99.509c-10.599 0-19.222-8.623-19.222-19.222V51.222C80.287 40.623 88.91 32 99.509 32h192.554v123.65c0 8.836 7.164 16 16 16h123.65v289.128c0 10.599-8.623 19.222-19.222 19.222zM370.4 265.826c0 8.836-7.164 16-16 16H157.6c-8.836 0-16-7.164-16-16s7.164-16 16-16h196.8c8.837 0 16 7.163 16 16zm0 109.199c0 8.836-7.164 16-16 16H157.6c-8.836 0-16-7.164-16-16s7.164-16 16-16h196.8c8.837 0 16 7.164 16 16z" fill="currentColor"></path>
                    </svg>
                </div>

                <div class="full-start__button selector button--subscribe">
                    <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                        <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                    </svg>
                    <span></span>
                </div>
            </div>
        </div>
    </div>
</div>`

export default html