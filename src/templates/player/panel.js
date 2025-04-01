let html = `<div class="player-panel">

    <div class="player-panel__body">
        <div class="player-panel__timeline selector">
            <div class="player-panel__peding"></div>
            <div class="player-panel__position"><div></div></div>
            <div class="player-panel__time hide"></div>
            <div class="player-panel__time-touch-zone hide"></div>
        </div>

        <div class="player-panel__iptv">
            <div class="player-panel-iptv">
                <div class="player-panel-iptv__channel"></div>
                <div class="player-panel-iptv__arrow-up">
                    <svg width="32" height="19" viewBox="0 0 32 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.17163 17.4122L15.9606 3.62323L29.7496 17.4122" stroke="white" stroke-width="4"/>
                    </svg>                
                </div>
                <div class="player-panel-iptv__position">001</div>
                <div class="player-panel-iptv__arrow-down">
                    <svg width="32" height="19" viewBox="0 0 32 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.17163 1.98059L15.9606 15.7696L29.7496 1.98059" stroke="white" stroke-width="4"/>
                    </svg>                
                </div>
            </div>
        </div>

        <div class="player-panel__line player-panel__line-one">
            <div class="player-panel__timenow"></div>
            <div class="player-panel__timeend"></div>
        </div>

        <div class="player-panel__line player-panel__line-two">
            <div class="player-panel__left">
                <div class="player-panel__prev button selector">
                    <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.75 13.7698C1.41666 13 1.41667 11.0755 2.75 10.3057L20 0.34638C21.3333 -0.42342 23 0.538831 23 2.07843L23 21.997C23 23.5366 21.3333 24.4989 20 23.7291L2.75 13.7698Z" fill="currentColor"/>
                    <rect x="6" y="24" width="6" height="24" rx="2" transform="rotate(180 6 24)" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__next button selector">
                    <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 10.2302C21.5833 11 21.5833 12.9245 20.25 13.6943L3 23.6536C1.66666 24.4234 -6.72981e-08 23.4612 0 21.9216L8.70669e-07 2.00298C9.37967e-07 0.463381 1.66667 -0.498867 3 0.270933L20.25 10.2302Z" fill="currentColor"/>
                    <rect x="17" width="6" height="24" rx="2" fill="currentColor"/>
                    </svg>
                </div>

                <div class="player-panel__next-episode-name hide"></div>
            </div>
            <div class="player-panel__center">
                <div class="player-panel__prev button selector hide">
                    <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.75 13.7698C1.41666 13 1.41667 11.0755 2.75 10.3057L20 0.34638C21.3333 -0.42342 23 0.538831 23 2.07843L23 21.997C23 23.5366 21.3333 24.4989 20 23.7291L2.75 13.7698Z" fill="currentColor"/>
                    <rect x="6" y="24" width="6" height="24" rx="2" transform="rotate(180 6 24)" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__tstart button selector">
                    <svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.75 10.2302C13.4167 11 13.4167 12.9245 14.75 13.6943L32 23.6536C33.3333 24.4234 35 23.4612 35 21.9216L35 2.00298C35 0.463381 33.3333 -0.498867 32 0.270933L14.75 10.2302Z" fill="currentColor"/>
                    <path d="M1.75 10.2302C0.416665 11 0.416667 12.9245 1.75 13.6943L19 23.6536C20.3333 24.4234 22 23.4612 22 21.9216L22 2.00298C22 0.463381 20.3333 -0.498867 19 0.270933L1.75 10.2302Z" fill="currentColor"/>
                    <rect width="6" height="24" rx="2" transform="matrix(-1 0 0 1 6 0)" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__rprev button selector">
                    <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 10.7679C12.6667 11.5377 12.6667 13.4622 14 14.232L31.25 24.1913C32.5833 24.9611 34.25 23.9989 34.25 22.4593L34.25 2.5407C34.25 1.0011 32.5833 0.0388526 31.25 0.808653L14 10.7679Z" fill="currentColor"/>
                    <path d="M0.999998 10.7679C-0.333335 11.5377 -0.333333 13.4622 1 14.232L18.25 24.1913C19.5833 24.9611 21.25 23.9989 21.25 22.4593L21.25 2.5407C21.25 1.0011 19.5833 0.0388526 18.25 0.808653L0.999998 10.7679Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__playpause button selector">
                    <div>
                        <svg width="22" height="25" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10.7679C22.3333 11.5377 22.3333 13.4622 21 14.232L3.75 24.1913C2.41666 24.9611 0.75 23.9989 0.75 22.4593L0.750001 2.5407C0.750001 1.0011 2.41667 0.0388526 3.75 0.808653L21 10.7679Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div>
                        <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="6" height="25" rx="2" fill="currentColor"/>
                        <rect x="13" width="6" height="25" rx="2" fill="currentColor"/>
                        </svg>                    
                    </div>
                </div>
                <div class="player-panel__rnext button selector">
                    <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 10.7679C21.5833 11.5377 21.5833 13.4622 20.25 14.232L3 24.1913C1.66666 24.9611 -6.72981e-08 23.9989 0 22.4593L8.70669e-07 2.5407C9.37967e-07 1.0011 1.66667 0.0388526 3 0.808653L20.25 10.7679Z" fill="currentColor"/>
                    <path d="M33.25 10.7679C34.5833 11.5377 34.5833 13.4622 33.25 14.232L16 24.1913C14.6667 24.9611 13 23.9989 13 22.4593L13 2.5407C13 1.0011 14.6667 0.0388526 16 0.808653L33.25 10.7679Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__tend button selector">
                    <svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 10.2302C21.5833 11 21.5833 12.9245 20.25 13.6943L3 23.6536C1.66666 24.4234 -6.72981e-08 23.4612 0 21.9216L8.70669e-07 2.00298C9.37967e-07 0.463381 1.66667 -0.498867 3 0.270933L20.25 10.2302Z" fill="currentColor"/>
                    <path d="M33.25 10.2302C34.5833 11 34.5833 12.9245 33.25 13.6943L16 23.6536C14.6667 24.4234 13 23.4612 13 21.9216L13 2.00298C13 0.463381 14.6667 -0.498867 16 0.270933L33.25 10.2302Z" fill="currentColor"/>
                    <rect x="29" width="6" height="24" rx="2" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__next button selector hide">
                    <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 10.2302C21.5833 11 21.5833 12.9245 20.25 13.6943L3 23.6536C1.66666 24.4234 -6.72981e-08 23.4612 0 21.9216L8.70669e-07 2.00298C9.37967e-07 0.463381 1.66667 -0.498867 3 0.270933L20.25 10.2302Z" fill="currentColor"/>
                    <rect x="17" width="6" height="24" rx="2" fill="currentColor"/>
                    </svg>
                </div>
            </div>
            <div class="player-panel__right">
                <div class="player-panel__quality button selector">auto</div>
                <div class="player-panel__flow button selector hide">
                    <svg width="248" height="231" viewBox="0 0 248 231" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="121" cy="118.269" r="53" fill="currentColor"/>
                        <path d="M164.209 23.0455C161.336 32.768 166.085 42.9469 174.107 49.1458C194.73 65.0822 208.011 90.0596 208.011 118.139C208.011 146.995 193.985 172.576 172.378 188.434C165.208 193.697 161.067 202.64 163.581 211.171V211.171C166.617 221.471 177.935 227.026 187.147 221.508C223.218 199.902 247.365 160.435 247.365 115.328C247.365 71.907 224.989 33.7121 191.14 11.6443C180.803 4.90515 167.705 11.2113 164.209 23.0455V23.0455Z" fill="currentColor"/>
                        <path d="M77.3189 24.8314C73.9908 13.5659 61.2957 7.86635 51.7456 14.7061C20.4155 37.1446 0 73.8521 0 115.328C0 158.503 22.1225 196.511 55.6506 218.635C64.1325 224.232 75.0432 219.232 77.9161 209.484V209.484C80.2024 201.727 76.4887 193.579 69.931 188.847C48.0033 173.021 33.7315 147.247 33.7315 118.139C33.7315 89.7709 47.2872 64.5689 68.2743 48.6571C75.6646 43.054 79.9464 33.7256 77.3189 24.8314V24.8314Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__playlist button selector hide">
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="5" width="5" height="25" rx="2" transform="rotate(-90 0 5)" fill="currentColor"/>
                    <rect y="15" width="5" height="25" rx="2" transform="rotate(-90 0 15)" fill="currentColor"/>
                    <rect y="25" width="5" height="25" rx="2" transform="rotate(-90 0 25)" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__subs button selector hide">
                    <svg width="23" height="25" viewBox="0 0 23 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.4357 20.0861C20.1515 23.0732 16.5508 25 12.5 25C5.59644 25 0 19.4036 0 12.5C0 5.59644 5.59644 0 12.5 0C16.5508 0 20.1515 1.9268 22.4357 4.9139L18.8439 7.84254C17.2872 6.09824 15.0219 5 12.5 5C7.80558 5 5 7.80558 5 12.5C5 17.1944 7.80558 20 12.5 20C15.0219 20 17.2872 18.9018 18.8439 17.1575L22.4357 20.0861Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__tracks button selector hide">
                    <svg width="24" height="31" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" width="14" height="23" rx="7" fill="currentColor"/>
                    <path d="M3.39272 18.4429C3.08504 17.6737 2.21209 17.2996 1.44291 17.6073C0.673739 17.915 0.299615 18.7879 0.607285 19.5571L3.39272 18.4429ZM23.3927 19.5571C23.7004 18.7879 23.3263 17.915 22.5571 17.6073C21.7879 17.2996 20.915 17.6737 20.6073 18.4429L23.3927 19.5571ZM0.607285 19.5571C2.85606 25.179 7.44515 27.5 12 27.5V24.5C8.55485 24.5 5.14394 22.821 3.39272 18.4429L0.607285 19.5571ZM12 27.5C16.5549 27.5 21.1439 25.179 23.3927 19.5571L20.6073 18.4429C18.8561 22.821 15.4451 24.5 12 24.5V27.5Z" fill="currentColor"/>
                    <rect x="10" y="25" width="4" height="6" rx="2" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__pip button selector">
                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 2H21C22.1046 2 23 2.89543 23 4V11H25V4C25 1.79086 23.2091 0 21 0H4C1.79086 0 0 1.79086 0 4V19C0 21.2091 1.79086 23 4 23H9V21H4C2.89543 21 2 20.1046 2 19V4C2 2.89543 2.89543 2 4 2Z" fill="currentColor"/>
                    <path d="M11.0988 12.2064C11.7657 12.3811 12.3811 11.7657 12.2064 11.0988L11.2241 7.34718C11.0494 6.68023 10.2157 6.46192 9.72343 6.95423L6.95422 9.72344C6.46192 10.2157 6.68022 11.0494 7.34717 11.2241L11.0988 12.2064Z" fill="currentColor"/>
                    <path d="M7.53735 9.45591C8.06025 9.97881 8.91363 9.97322 9.44343 9.44342C9.97322 8.91362 9.97882 8.06024 9.45592 7.53734L6.93114 5.01257C6.40824 4.48967 5.55486 4.49526 5.02506 5.02506C4.49527 5.55485 4.48967 6.40823 5.01257 6.93113L7.53735 9.45591Z" fill="currentColor"/>
                    <rect x="12" y="14" width="13" height="9" rx="2" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__volume button selector">
                    <svg width="360" height="480" viewBox="0 0 360 480" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M145 366.736V123.602L290.343 30.3787C309.644 17.9988 335 31.8587 335 54.789V425.73C335 448.023 310.894 461.98 291.561 450.88L145 366.736Z" stroke="currentColor" stroke-width="45"/>
                        <path d="M60 134H136V357H60C40.67 357 25 341.33 25 322V169C25 149.67 40.67 134 60 134Z" stroke="currentColor" stroke-width="45"/>
                    </svg>
                    <div class="player-panel__volume-drop">
                        <input type="range" orient="vertical" class="player-panel__volume-range" max="1" min="0" step="0.01" />
                    </div>
                </div>
                <div class="player-panel__settings button selector">
                    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.35883 18.1883L1.63573 17.4976L2.35883 18.1883L3.00241 17.5146C3.8439 16.6337 4.15314 15.4711 4.15314 14.4013C4.15314 13.3314 3.8439 12.1688 3.00241 11.2879L2.27931 11.9786L3.00241 11.2879L2.35885 10.6142C1.74912 9.9759 1.62995 9.01336 2.0656 8.24564L2.66116 7.19613C3.10765 6.40931 4.02672 6.02019 4.90245 6.24719L5.69281 6.45206C6.87839 6.75939 8.05557 6.45293 8.98901 5.90194C9.8943 5.36758 10.7201 4.51559 11.04 3.36732L11.2919 2.46324C11.5328 1.59833 12.3206 1 13.2185 1H14.3282C15.225 1 16.0121 1.59689 16.2541 2.46037L16.5077 3.36561C16.8298 4.51517 17.6582 5.36897 18.5629 5.90557C19.498 6.4602 20.6725 6.75924 21.8534 6.45313L22.6478 6.2472C23.5236 6.02019 24.4426 6.40932 24.8891 7.19615L25.4834 8.24336C25.9194 9.0118 25.7996 9.97532 25.1885 10.6135L24.5426 11.2882C23.7 12.1684 23.39 13.3312 23.39 14.4013C23.39 15.4711 23.6992 16.6337 24.5407 17.5146L25.1842 18.1883C25.794 18.8266 25.9131 19.7891 25.4775 20.5569L24.8819 21.6064C24.4355 22.3932 23.5164 22.7823 22.6406 22.5553L21.8503 22.3505C20.6647 22.0431 19.4876 22.3496 18.5541 22.9006C17.6488 23.4349 16.8231 24.2869 16.5031 25.4352L16.2513 26.3393C16.0103 27.2042 15.2225 27.8025 14.3246 27.8025H13.2184C12.3206 27.8025 11.5328 27.2042 11.2918 26.3393L11.0413 25.4402C10.7206 24.2889 9.89187 23.4336 8.98627 22.8963C8.05183 22.342 6.87822 22.0432 5.69813 22.3491L4.90241 22.5553C4.02667 22.7823 3.10759 22.3932 2.66111 21.6064L2.06558 20.5569C1.62993 19.7892 1.74911 18.8266 2.35883 18.1883Z" stroke="currentColor" stroke-width="2.4"/>
                        <circle cx="13.7751" cy="14.4013" r="4.1675" stroke="currentColor" stroke-width="2.4"/>
                    </svg>
                </div>
                <div class="player-panel__fullscreen button selector">
                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.51904 7.75323V5C1.51904 2.79086 3.3099 1 5.51904 1H8.46433" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                        <path d="M1.51904 14.7305V17.4837C1.51904 19.6928 3.3099 21.4837 5.51904 21.4837H8.46433" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                        <path d="M23.2815 7.75323V5C23.2815 2.79086 21.4906 1 19.2815 1H16.3362" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                        <path d="M23.2815 14.7305V17.4837C23.2815 19.6928 21.4906 21.4837 19.2815 21.4837H16.3362" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</div>`

export default html