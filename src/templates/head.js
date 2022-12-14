let html = `<div class="head">
    <div class="head__body">
        <div class="head__logo-icon">
            <img src="./img/logo-icon.svg" />
        </div>

        <div class="head__title"></div>
        
        <div class="head__actions">
            <div class="head__action head__settings selector open--search">
                <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"/>
                    <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            </div>

            <div class="head__action head__settings selector open--broadcast">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.04272 7.22978V6.76392C1.04272 4.00249 3.2813 1.76392 6.04272 1.76392H17.7877C20.5491 1.76392 22.7877 4.00249 22.7877 6.76392V17.2999C22.7877 20.0613 20.5491 22.2999 17.7877 22.2999H15.8387" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                    <circle cx="6.69829" cy="16.6443" r="5.65556" fill="currentColor"/>
                </svg>
            </div>

            <div class="head__action selector open--settings">
                <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.35883 18.1883L1.63573 17.4976L2.35883 18.1883L3.00241 17.5146C3.8439 16.6337 4.15314 15.4711 4.15314 14.4013C4.15314 13.3314 3.8439 12.1688 3.00241 11.2879L2.27931 11.9786L3.00241 11.2879L2.35885 10.6142C1.74912 9.9759 1.62995 9.01336 2.0656 8.24564L2.66116 7.19613C3.10765 6.40931 4.02672 6.02019 4.90245 6.24719L5.69281 6.45206C6.87839 6.75939 8.05557 6.45293 8.98901 5.90194C9.8943 5.36758 10.7201 4.51559 11.04 3.36732L11.2919 2.46324C11.5328 1.59833 12.3206 1 13.2185 1H14.3282C15.225 1 16.0121 1.59689 16.2541 2.46037L16.5077 3.36561C16.8298 4.51517 17.6582 5.36897 18.5629 5.90557C19.498 6.4602 20.6725 6.75924 21.8534 6.45313L22.6478 6.2472C23.5236 6.02019 24.4426 6.40932 24.8891 7.19615L25.4834 8.24336C25.9194 9.0118 25.7996 9.97532 25.1885 10.6135L24.5426 11.2882C23.7 12.1684 23.39 13.3312 23.39 14.4013C23.39 15.4711 23.6992 16.6337 24.5407 17.5146L25.1842 18.1883C25.794 18.8266 25.9131 19.7891 25.4775 20.5569L24.8819 21.6064C24.4355 22.3932 23.5164 22.7823 22.6406 22.5553L21.8503 22.3505C20.6647 22.0431 19.4876 22.3496 18.5541 22.9006C17.6488 23.4349 16.8231 24.2869 16.5031 25.4352L16.2513 26.3393C16.0103 27.2042 15.2225 27.8025 14.3246 27.8025H13.2184C12.3206 27.8025 11.5328 27.2042 11.2918 26.3393L11.0413 25.4402C10.7206 24.2889 9.89187 23.4336 8.98627 22.8963C8.05183 22.342 6.87822 22.0432 5.69813 22.3491L4.90241 22.5553C4.02667 22.7823 3.10759 22.3932 2.66111 21.6064L2.06558 20.5569C1.62993 19.7892 1.74911 18.8266 2.35883 18.1883Z" stroke="currentColor" stroke-width="2.4"/>
                    <circle cx="13.7751" cy="14.4013" r="4.1675" stroke="currentColor" stroke-width="2.4"/>
                </svg>
            </div>

            <div class="head__action selector open--premium icon--blink" data-blink-interval="45">
                <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.6162 7.10981L15.8464 7.55198L16.3381 7.63428L22.2841 8.62965C22.8678 8.72736 23.0999 9.44167 22.6851 9.86381L18.4598 14.1641L18.1104 14.5196L18.184 15.0127L19.0748 20.9752C19.1622 21.5606 18.5546 22.002 18.025 21.738L12.6295 19.0483L12.1833 18.8259L11.7372 19.0483L6.34171 21.738C5.81206 22.002 5.20443 21.5606 5.29187 20.9752L6.18264 15.0127L6.25629 14.5196L5.9069 14.1641L1.68155 9.86381C1.26677 9.44167 1.49886 8.72736 2.08255 8.62965L8.02855 7.63428L8.52022 7.55198L8.75043 7.10981L11.5345 1.76241C11.8078 1.23748 12.5589 1.23748 12.8322 1.76241L15.6162 7.10981Z" stroke="currentColor" stroke-width="2.2"/>
                </svg>
            </div>

            <div class="head__action selector open--notice notice--icon">
                <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.6"/>
                </svg>
            </div>

            <div class="head__action hide selector open--profile">
                <img />
            </div>

            <div class="head__action selector hide full-screen">
                <svg width="25" height="23" viewBox="0 0 25 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.51904 7.75323V5C1.51904 2.79086 3.3099 1 5.51904 1H8.46433" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                    <path d="M1.51904 14.7305V17.4837C1.51904 19.6928 3.3099 21.4837 5.51904 21.4837H8.46433" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                    <path d="M23.2815 7.75323V5C23.2815 2.79086 21.4906 1 19.2815 1H16.3362" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                    <path d="M23.2815 14.7305V17.4837C23.2815 19.6928 21.4906 21.4837 19.2815 21.4837H16.3362" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/>
                </svg>
            </div>
        </div>

        <div class="head__split"></div>

        <div class="head__time">
            <div class="head__time-now time--clock"></div>
            <div>
                <div class="head__time-date time--full"></div>
                <div class="head__time-week time--week"></div>
            </div>
        </div>
    </div>
</div>`

export default html