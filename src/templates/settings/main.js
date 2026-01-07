let html = `<div>
    <div class="settings-folder selector" data-component="account">
        <div class="settings-folder__icon">
            <svg height="169" viewBox="0 0 172 169" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="85.765" cy="47.5683" r="15.5683" stroke="white" stroke-width="12"/>
                <path d="M121.53 112C121.53 92.2474 105.518 76.2349 85.7651 76.2349C66.0126 76.2349 50 92.2474 50 112" stroke="white" stroke-width="12"/>
                <rect x="44" y="125" width="84" height="16" rx="8" fill="white"/>
                <rect x="6" y="6" width="160" height="157" rx="21" stroke="white" stroke-width="12"/>
            </svg>
        </div>
        <div class="settings-folder__name">#{settings_cub_sync}</div>
    </div>
    <div class="settings-folder selector" data-component="interface">
        <div class="settings-folder__icon">
            <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.3222 3.76511C17.3222 1.7586 15.6937 0.130127 13.6872 0.130127H3.99387C1.98736 0.130127 0.358887 1.7586 0.358887 3.76511V18.3051C0.358887 20.3116 1.98736 21.94 3.99387 21.94H13.6872C15.6937 21.94 17.3222 20.3116 17.3222 18.3051V3.76511ZM14.8988 3.76511V18.3051C14.8988 18.9739 14.356 19.5167 13.6872 19.5167H3.99387C3.32503 19.5167 2.78221 18.9739 2.78221 18.3051V3.76511C2.78221 3.09628 3.32503 2.55345 3.99387 2.55345H13.6872C14.356 2.55345 14.8988 3.09628 14.8988 3.76511ZM17.3222 27.9983C17.3222 25.9918 15.6937 24.3634 13.6872 24.3634H3.99387C1.98736 24.3634 0.358887 25.9918 0.358887 27.9983V32.845C0.358887 34.8515 1.98736 36.48 3.99387 36.48H13.6872C15.6937 36.48 17.3222 34.8515 17.3222 32.845V27.9983ZM14.8988 27.9983V32.845C14.8988 33.5138 14.356 34.0567 13.6872 34.0567H3.99387C3.32503 34.0567 2.78221 33.5138 2.78221 32.845V27.9983C2.78221 27.3295 3.32503 26.7867 3.99387 26.7867H13.6872C14.356 26.7867 14.8988 27.3295 14.8988 27.9983ZM36.7087 3.76511C36.7087 2.80105 36.3258 1.87648 35.6441 1.19479C34.9624 0.513098 34.0378 0.130127 33.0738 0.130127H23.3805C22.4164 0.130127 21.4918 0.513098 20.8101 1.19479C20.1284 1.87648 19.7455 2.80105 19.7455 3.76511V32.845C19.7455 33.8091 20.1284 34.7336 20.8101 35.4153C21.4918 36.097 22.4164 36.48 23.3805 36.48H33.0738C34.0378 36.48 34.9624 36.097 35.6441 35.4153C36.3258 34.7336 36.7087 33.8091 36.7087 32.845V3.76511ZM34.2854 3.76511V32.845C34.2854 33.5138 33.7426 34.0567 33.0738 34.0567H23.3805C22.7116 34.0567 22.1688 33.5138 22.1688 32.845V3.76511C22.1688 3.09628 22.7116 2.55345 23.3805 2.55345H33.0738C33.7426 2.55345 34.2854 3.09628 34.2854 3.76511Z" fill="white"/>
            </svg>
        </div>
        <div class="settings-folder__name">#{settings_main_interface}</div>
    </div>
    <div class="settings-folder selector" data-component="player">
        <div class="settings-folder__icon">
            <img src="./img/icons/settings/player.svg" />
        </div>
        <div class="settings-folder__name">#{settings_main_player}</div>
    </div>
    <div class="settings-folder selector" data-component="parser">
        <div class="settings-folder__icon">
            <img src="./img/icons/settings/parser.svg" />
        </div>
        <div class="settings-folder__name">#{settings_main_parser}</div>
    </div>
    <div class="settings-folder selector" data-component="server">
        <div class="settings-folder__icon">
            <img src="./img/icons/settings/server.svg" />
        </div>
        <div class="settings-folder__name">#{settings_main_torrserver}</div>
    </div>
    <div class="settings-folder selector" data-component="tmdb">
        <div class="settings-folder__icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 32 32">
                <path fill="white" d="M25.99 29.198c2.807 0 4.708-1.896 4.708-4.708v-19.781c0-2.807-1.901-4.708-4.708-4.708h-19.979c-2.807 0-4.708 1.901-4.708 4.708v27.292l2.411-2.802v-24.49c0.005-1.266 1.031-2.292 2.297-2.292h19.974c1.266 0 2.292 1.026 2.292 2.292v19.781c0 1.266-1.026 2.292-2.292 2.292h-16.755l-2.417 2.417-0.016-0.016zM11.714 15.286h-2.26v7.599h2.26c5.057 0 5.057-7.599 0-7.599zM11.714 21.365h-0.734v-4.557h0.734c2.958 0 2.958 4.557 0 4.557zM11.276 13.854h1.516v-6.083h1.891v-1.505h-5.302v1.505h1.896zM18.75 9.599l-2.625-3.333h-0.49v7.714h1.542v-4.24l1.573 2.042 1.578-2.042-0.010 4.24h1.542v-7.714h-0.479zM21.313 19.089c0.474-0.333 0.677-0.922 0.698-1.5 0.031-1.339-0.807-2.307-2.156-2.307h-3.005v7.609h3.005c1.24-0.010 2.245-1.021 2.245-2.26v-0.036c0-0.62-0.307-1.172-0.781-1.5zM18.37 16.802h1.354c0.432 0 0.698 0.339 0.698 0.766 0.031 0.406-0.286 0.76-0.698 0.76h-1.354zM19.724 21.37h-1.354v-1.516h1.37c0.411 0 0.745 0.333 0.745 0.745v0.016c0 0.417-0.333 0.755-0.75 0.755z"/>
            </svg>
        </div>
        <div class="settings-folder__name">TMDB</div>
    </div>
    <div class="settings-folder selector" data-component="plugins" data-static="true">
        <div class="settings-folder__icon">
            <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.00439" y="1.97363" width="33.3257" height="33.3257" rx="3.5" stroke="white" stroke-width="3"/>
                <rect x="11.3193" y="17.2463" width="14.6958" height="2.78015" rx="1.39008" fill="white"/>
                <rect x="17.2773" y="25.9844" width="14.6958" height="2.78015" rx="1.39008" transform="rotate(-90 17.2773 25.9844)" fill="white"/>
            </svg>
        </div>
        <div class="settings-folder__name">#{settings_main_plugins}</div>
    </div>
    <div class="settings-folder selector" data-component="parental_control">
        <div class="settings-folder__icon">
            <svg width="35" height="38" viewBox="0 0 35 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34.171 8.37254L34.1218 7.21457L32.9688 7.09618C28.5402 6.64136 24.733 4.98873 22.3189 3.68243C19.6748 2.25169 18.0721 0.909411 18.0574 0.897023L17.1918 0.165649L16.3257 0.895967C16.3097 0.909371 14.707 2.25169 12.063 3.68239C9.64886 4.98869 5.84167 6.64132 1.41305 7.09614L0.260081 7.21453L0.210854 8.3725C0.20204 8.5798 0.0168308 13.5185 1.91913 19.4987C3.04163 23.0278 4.6627 26.1897 6.73729 28.8972C9.34237 32.2968 12.6651 34.9766 16.6133 36.862L17.1909 37.138L17.7685 36.862C21.7167 34.9766 25.0395 32.2969 27.6445 28.8972C29.7191 26.1898 31.3402 23.0277 32.4627 19.4988C34.365 13.5186 34.1798 8.57988 34.171 8.37254ZM17.1909 34.1585C13.8971 32.4847 11.1094 30.1827 8.89734 27.3087C7.01303 24.8606 5.53384 21.9881 4.50073 18.7712C3.23805 14.8392 2.95488 11.3326 2.89757 9.61072C4.67391 9.34696 6.46971 8.90315 8.25211 8.28676C9.99454 7.68418 11.7288 6.91588 13.4066 6.00328C15.109 5.07731 16.4045 4.1929 17.1909 3.61457C17.9773 4.19286 19.2728 5.07731 20.9752 6.00328C22.653 6.91592 24.3872 7.68418 26.1296 8.28676C27.9125 8.90335 29.7089 9.34716 31.4857 9.61092C31.4305 11.3159 31.1529 14.7731 29.9081 18.6863C28.8798 21.9191 27.4023 24.806 25.5167 27.2668C23.2993 30.1604 20.5007 32.4766 17.1909 34.1585Z" fill="white"/>
                <path d="M24.4966 12.5542L22.6265 14.4243L15.6567 21.3941L12.1244 17.8618L11.644 17.3815L10.6963 18.3292V18.3292L9.74854 19.277L15.6567 25.1852L26.3921 14.4498L24.4966 12.5542Z" fill="white"/>
            </svg>
        </div>
        <div class="settings-folder__name">#{title_parental_control}</div>
    </div>
    <div class="settings-folder selector" data-component="more">
        <div class="settings-folder__icon">
            <img src="./img/icons/settings/more.svg" />
        </div>
        <div class="settings-folder__name">#{settings_main_rest}</div>
    </div>
</div>`

export default html
