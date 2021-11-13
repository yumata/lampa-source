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
                <div class="player-panel__prev button selector"></div>
                <div class="player-panel__next button selector"></div>
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
                <div class="player-panel__playpause button selector"></div>
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
                <div class="player-panel__playlist button selector"></div>
                <div class="player-panel__subs button selector hide"></div>
                <div class="player-panel__tracks button selector hide">
                    <svg width="24" height="31" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" width="14" height="23" rx="7" fill="currentColor"/>
                    <path d="M3.39272 18.4429C3.08504 17.6737 2.21209 17.2996 1.44291 17.6073C0.673739 17.915 0.299615 18.7879 0.607285 19.5571L3.39272 18.4429ZM23.3927 19.5571C23.7004 18.7879 23.3263 17.915 22.5571 17.6073C21.7879 17.2996 20.915 17.6737 20.6073 18.4429L23.3927 19.5571ZM0.607285 19.5571C2.85606 25.179 7.44515 27.5 12 27.5V24.5C8.55485 24.5 5.14394 22.821 3.39272 18.4429L0.607285 19.5571ZM12 27.5C16.5549 27.5 21.1439 25.179 23.3927 19.5571L20.6073 18.4429C18.8561 22.821 15.4451 24.5 12 24.5V27.5Z" fill="currentColor"/>
                    <rect x="10" y="25" width="4" height="6" rx="2" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__size button selector"></div>
            </div>
        </div>
    </div>
</div>`

export default html