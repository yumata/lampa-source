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
                <div class="player-panel__size button selector">
                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="23" height="21" rx="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M19.1055 3.78684C19.7724 3.61219 20.3878 4.22757 20.2132 4.89452L19.2308 8.64611C19.0561 9.31306 18.2225 9.53136 17.7301 9.03906L14.9609 6.26984C14.4686 5.77754 14.6869 4.94386 15.3539 4.76921L19.1055 3.78684Z" fill="currentColor"/>
                    <path d="M15.5441 6.53738C16.067 6.01448 16.9203 6.02007 17.4501 6.54987C17.9799 7.07966 17.9855 7.93304 17.4626 8.45594L14.9379 10.9807C14.415 11.5036 13.5616 11.498 13.0318 10.9682C12.502 10.4384 12.4964 9.58505 13.0193 9.06215L15.5441 6.53738Z" fill="currentColor"/>
                    <path d="M5.89453 19.2064C5.22758 19.3811 4.6122 18.7657 4.78684 18.0988L5.76922 14.3472C5.94386 13.6802 6.77755 13.4619 7.26985 13.9542L10.0391 16.7234C10.5314 17.2157 10.3131 18.0494 9.64611 18.2241L5.89453 19.2064Z" fill="currentColor"/>
                    <path d="M9.45594 16.4559C8.93304 16.9788 8.07966 16.9732 7.54986 16.4434C7.02006 15.9136 7.01447 15.0602 7.53737 14.5373L10.0621 12.0126C10.585 11.4897 11.4384 11.4953 11.9682 12.0251C12.498 12.5549 12.5036 13.4082 11.9807 13.9311L9.45594 16.4559Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="player-panel__share button selector">
                    <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 0H4C1.79086 0 0 1.79086 0 4V19C0 21.2091 1.79086 23 4 23H21C23.2091 23 25 21.2091 25 19V4C25 1.79086 23.2091 0 21 0H19V2H21C22.1046 2 23 2.89543 23 4V19C23 20.1046 22.1046 21 21 21H4C2.89543 21 2 20.1046 2 19V4C2 2.89543 2.89543 2 4 2H6V0Z" fill="currentColor"/>
                    <path d="M11.5428 0.590908C11.9682 -0.196971 13.0318 -0.196969 13.4572 0.59091L15.8503 5.02273C16.2757 5.81061 15.7439 6.79545 14.893 6.79545H10.1069C9.25609 6.79545 8.7243 5.81061 9.14973 5.02273L11.5428 0.590908Z" fill="currentColor"/>
                    <path d="M10.8421 6.5C10.8421 5.52095 11.5843 4.72727 12.5 4.72727C13.4157 4.72727 14.158 5.52095 14.158 6.5V11.2273C14.158 12.2063 13.4157 13 12.5 13C11.5843 13 10.8421 12.2063 10.8421 11.2273V6.5Z" fill="currentColor"/>
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