let html = `<div class="player-panel">

    <div class="player-panel__body">
        <div class="player-panel__timeline selector">
            <div class="player-panel__peding"></div>
            <div class="player-panel__position"><div></div></div>
            <div class="player-panel__time hide"></div>
        </div>

        <div class="player-panel__line">
            <div class="player-panel__timenow"></div>
            <div class="player-panel__timeend"></div>
        </div>

        <div class="player-panel__line">
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
            </div>
            <div class="player-panel__right">
                <div class="player-panel__quality button selector">auto</div>
                <div class="player-panel__playlist button selector">
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
                <div class="player-panel__settings button selector">
                    <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.3973 12.6213L21.7828 14.5245C21.9976 14.7028 22.0598 15.0133 21.9184 15.2605L19.6572 19.2453C19.5159 19.4925 19.222 19.5903 18.9676 19.4925L16.1525 18.3368C15.5703 18.7968 14.9315 19.1763 14.2419 19.4695L13.8179 22.517C13.7727 22.7872 13.5409 23 13.2583 23H8.73601C8.45339 23 8.22159 22.7872 8.17638 22.517L7.75242 19.4695C7.06279 19.1763 6.42404 18.7911 5.84178 18.3368L3.02667 19.4925C2.77229 19.596 2.47838 19.4925 2.33704 19.2453L0.0758898 15.2605C-0.0654487 15.0075 -0.00323221 14.697 0.211558 14.5245L2.59704 12.6213C2.55183 12.2532 2.51791 11.8795 2.51791 11.5C2.51791 11.1205 2.55183 10.7468 2.59704 10.3787L0.211558 8.47548C-0.00323221 8.29726 -0.0654487 7.98676 0.0758898 7.73949L2.33709 3.75474C2.47838 3.50747 2.77234 3.40974 3.02672 3.50747L5.84183 4.66322C6.42404 4.20324 7.06285 3.82374 7.75247 3.53049L8.17644 0.483001C8.22164 0.212768 8.45344 0 8.73607 0H13.2583C13.5409 0 13.7727 0.212768 13.8236 0.483001L14.2476 3.53049C14.9372 3.82374 15.576 4.20895 16.1582 4.66322L18.9733 3.50747C19.2277 3.40397 19.5216 3.50747 19.663 3.75474L21.9241 7.73949C22.0654 7.99248 22.0032 8.30298 21.7884 8.47548L19.3973 10.3787C19.4425 10.7468 19.4764 11.1205 19.4764 11.5C19.4764 11.8795 19.4425 12.2532 19.3973 12.6213ZM11 17.3385C14.1356 17.3385 16.6774 14.8037 16.6774 11.6769C16.6774 8.55014 14.1356 6.01538 11 6.01538C7.86445 6.01538 5.32258 8.55014 5.32258 11.6769C5.32258 14.8037 7.86445 17.3385 11 17.3385Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__fullscreen button selector">
                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 23H21C23.2091 23 25 21.2091 25 19V15H23V19C23 20.1046 22.1046 21 21 21H17V23Z" fill="currentColor"/>
                    <path d="M17 2H21C22.1046 2 23 2.89543 23 4V8H25V4C25 1.79086 23.2091 0 21 0H17V2Z" fill="currentColor"/>
                    <path d="M8 0L8 2H4C2.89543 2 2 2.89543 2 4V8H0V4C0 1.79086 1.79086 0 4 0H8Z" fill="currentColor"/>
                    <path d="M8 21V23H4C1.79086 23 0 21.2091 0 19V15H2V19C2 20.1046 2.89543 21 4 21H8Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</div>`

export default html