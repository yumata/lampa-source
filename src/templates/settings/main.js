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
            <img src="./img/icons/settings/panel.svg" />
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
            <svg height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="21" height="21" rx="2" fill="white"/>
            <mask id="path-2-inside-1_154:24" fill="white">
            <rect x="2" y="27" width="17" height="17" rx="2"/>
            </mask>
            <rect x="2" y="27" width="17" height="17" rx="2" stroke="white" stroke-width="6" mask="url(#path-2-inside-1_154:24)"/>
            <rect x="27" y="2" width="17" height="17" rx="2" fill="white"/>
            <rect x="27" y="34" width="17" height="3" fill="white"/>
            <rect x="34" y="44" width="17" height="3" transform="rotate(-90 34 44)" fill="white"/>
            </svg>
        </div>
        <div class="settings-folder__name">#{settings_main_plugins}</div>
    </div>
    <div class="settings-folder selector" data-component="parental_control">
        <div class="settings-folder__icon">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 401.998 401.998" xml:space="preserve"><path d="M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z" fill="white"></path></svg>
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