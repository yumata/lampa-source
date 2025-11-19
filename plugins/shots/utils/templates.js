function init(){
    Lampa.Template.add('shots_player_record_button', `
        <div class="button selector" data-controller="player_panel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11.718" cy="11.718" r="10.718" stroke="white" stroke-width="2"/>
                <circle cx="11.718" cy="11.718" r="5.92621" fill="#FF0707"/>
            </svg>
        </div>
    `)

    Lampa.Template.add('shots_modal_before_recording', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_before_recording_txt_1}
            </div>
            <div>
                <small style="font-size: 0.8em">#{shots_step} 1</small><br>
                #{shots_modal_before_recording_txt_2}
            </div>
            <div>
                <small style="font-size: 0.8em">#{shots_step} 2</small><br>
                #{shots_modal_before_recording_txt_3}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_short_recording', `
        <div class="about">
            <div>
                #{shots_modal_short_recording_txt}
            </div>
        </div>
    `)

    

    Lampa.Template.add('shots_player_recorder', `
        <div class="shots-player-recorder">
            <div class="shots-player-recorder__body">
                <div class="shots-player-recorder__plate">
                    <div class="shots-player-recorder__text">Идет запись <span></span></div>
                    <div class="shots-player-recorder__stop"></div>
                </div>
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_upload', `
        <div class="shots-modal-upload">
            <div class="shots-modal-upload__preview"></div>
            <div class="shots-modal-upload__body"></div>
        </div>
    `)

    Lampa.Template.add('shots_checkbox', `
        <div class="shots-selector shots-checkbox selector">
            <div class="shots-checkbox__icon"></div>
            <div class="shots-checkbox__text">{text}</div>
        </div>
    `)

    Lampa.Template.add('shots_button', `
        <div class="shots-selector shots-button selector">{text}</div>
    `)

    Lampa.Template.add('shots_progress', `
        <div class="shots-selector shots-progress selector">
            <div class="shots-progress__text">{text}</div>
            <div class="shots-progress__bar"><div></div></div>
        </div>
    `)

    Lampa.Template.add('shots_preview', `
        <div class="shots-preview">
            <div class="shots-preview__left">
                <div class="shots-preview__screenshot">
                    <img>
                </div>
            </div>
            <div class="shots-preview__body">
                <div class="shots-preview__year">{year}</div>
                <div class="shots-preview__title">{title}</div>
            </div>
        </div>
    `)

    Lampa.Template.add('shots_tags', `
        <div class="shots-tags"></div>
    `)

    Lampa.Template.add('shots_upload_complete_text', `
        <div class="about">
            <div style="padding-bottom: 1em;">
                #{shots_upload_complete_text}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_lenta', `
        <div class="shots-lenta">
            <div class="shots-lenta__video"></div>
            <div class="shots-lenta__panel"></div>
        </div>
    `)

    Lampa.Template.add('shots_lenta_video', `
        <div class="shots-lenta-video">
            <video class="shots-lenta-video__video-element" autoplay muted loop></video>
            <div class="shots-lenta-video__progress-bar">
                <div></div>
            </div>
            <div class="shots-lenta-video__layer selector"></div>
        </div>
    `)

    Lampa.Template.add('shots_lenta_panel', `
        <div class="shots-lenta-panel">
            <div class="explorer-card__head shots-lenta-panel__card loading">
                <div class="explorer-card__head-left">
                    <div class="explorer-card__head-img selector shots-lenta-panel__card-img">
                        <img>
                    </div>
                </div>
                <div class="explorer-card__head-body">
                    <div class="explorer-card__head-create shots-lenta-panel__card-year">2020</div>
                    <div class="shots-lenta-panel__card-title">Я всемогуший сирунчик!</div>
                </div>
            </div>

            <div class="shots-lenta-panel__tags"></div>

            <div class="shots-lenta-panel__counters"></div>

            <div class="shots-lenta-panel__author"></div>

            <div class="shots-lenta-panel__buttons">
                <div class="selector action-liked">
                    <svg width="36" height="39" viewBox="0 0 36 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M34.184 21.3804C34.9351 20.2459 35.3101 18.9972 35.3101 17.6332C35.3101 16.0544 34.7284 14.6832 33.5639 13.5173C32.3989 12.3526 31.0194 11.7703 29.4257 11.7703H25.3796C26.115 10.2532 26.4834 8.78172 26.4834 7.35661C26.4834 5.56338 26.2145 4.13819 25.6785 3.08065C25.142 2.0228 24.3603 1.24523 23.3333 0.746894C22.3062 0.248804 21.1494 0 19.8621 0C19.0801 0 18.3907 0.283507 17.793 0.850763C17.1341 1.49435 16.659 2.32217 16.3679 3.33373C16.0767 4.34496 15.8428 5.31449 15.6667 6.24175C15.4906 7.16892 15.2183 7.82411 14.8507 8.20722C14.0995 9.01949 13.2797 10.0006 12.3907 11.1499C10.8428 13.1574 9.79288 14.3453 9.2414 14.7133H2.94257C2.13029 14.7133 1.4367 15.0011 0.861955 15.5753C0.287453 16.1502 0 16.8437 0 17.656V32.3687C0 33.1811 0.287131 33.8743 0.861955 34.4491C1.43702 35.024 2.13029 35.3116 2.94257 35.3116H9.56291C9.90013 35.3116 10.9574 35.618 12.7353 36.2311C14.6205 36.8902 16.2795 37.392 17.7123 37.737C19.1389 38.0812 20.6013 38.2549 22.0689 38.2545H25.0343C27.1951 38.2545 28.9345 37.6372 30.2527 36.4033C31.5704 35.1695 32.222 33.4875 32.2069 31.3572C33.1264 30.1771 33.5861 28.8131 33.5861 27.2653C33.5861 26.9284 33.5634 26.5989 33.5172 26.2767C34.0994 25.2503 34.3912 24.1467 34.3912 22.9666C34.3909 22.4148 34.3221 21.8858 34.184 21.3804ZM5.4484 31.9322C5.15724 32.2232 4.81246 32.3693 4.41397 32.3693C4.0154 32.3693 3.67054 32.2233 3.3793 31.9322C3.08822 31.6413 2.94257 31.2963 2.94257 30.8975C2.94257 30.4991 3.0879 30.1544 3.3793 29.8631C3.67086 29.5719 4.0154 29.4263 4.41397 29.4263C4.81246 29.4263 5.15724 29.5719 5.4484 29.8631C5.73963 30.1543 5.88529 30.499 5.88529 30.8975C5.88529 31.2963 5.73963 31.6413 5.4484 31.9322ZM31.8744 19.5193C31.5448 20.2242 31.1347 20.5843 30.6444 20.5995C30.8742 20.8601 31.0659 21.2245 31.2192 21.6915C31.3724 22.1591 31.4485 22.5842 31.4485 22.9675C31.4485 24.0245 31.0429 24.9366 30.2305 25.7027C30.5067 26.1929 30.6445 26.7219 30.6445 27.2887C30.6445 27.8558 30.5106 28.419 30.2422 28.9783C29.9743 29.5371 29.61 29.9395 29.1504 30.1846C29.227 30.6443 29.265 31.0736 29.265 31.472C29.265 34.0313 27.7936 35.3109 24.8507 35.3109H22.0699C20.0618 35.3109 17.4415 34.7519 14.2074 33.6328C14.1307 33.6022 13.9088 33.5215 13.5407 33.3914C13.1727 33.2614 12.9007 33.1655 12.7244 33.1044C12.5481 33.0426 12.2801 32.9546 11.9197 32.8399C11.5594 32.7247 11.2685 32.6403 11.0462 32.5869C10.8241 32.5334 10.571 32.4836 10.2877 32.4375C10.0043 32.3916 9.76284 32.3687 9.56364 32.3687H8.82802V17.6566H9.56364C9.80882 17.6566 10.0808 17.5874 10.3797 17.4498C10.6785 17.3118 10.9852 17.105 11.2993 16.829C11.6012 16.5645 11.8963 16.2923 12.1844 16.0127C12.4603 15.7446 12.7668 15.4075 13.1041 15.0015C13.4412 14.5952 13.7055 14.2696 13.8973 14.0244C14.1406 13.7117 14.3819 13.3975 14.6213 13.0818C14.9124 12.6987 15.0888 12.4688 15.15 12.392C15.9928 11.35 16.5829 10.6527 16.92 10.3001C17.5484 9.64126 18.0043 8.80217 18.2878 7.78296C18.5716 6.76359 18.8053 5.80187 18.9885 4.89781C19.1723 3.99366 19.4638 3.3421 19.8628 2.94361C21.3337 2.94361 22.3149 3.30361 22.8051 4.02401C23.2953 4.74426 23.5406 5.8555 23.5406 7.35742C23.5406 8.26157 23.1725 9.49141 22.4367 11.0469C21.7012 12.6025 21.3337 13.8248 21.3337 14.7136H29.4255C30.1926 14.7136 30.8743 15.0085 31.4717 15.5989C32.0697 16.1888 32.3689 16.8745 32.3689 17.6564C32.3687 18.1927 32.2039 18.8135 31.8744 19.5193Z" fill="currentColor"/>
                        <path d="M14.3818 11.618L7.6377 17.7547V33.1878L16.9335 36.5904L30.1791 35.922L33.8247 19.2131L32.7918 14.17L23.9208 13.6839L25.0753 3.65858L18.8778 1.65332L14.3818 11.618Z" fill="currentColor" class="icon-fill"/>
                    </svg>
                </div>
                <div class="selector action-favorite">
                    <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5" fill="currentColor" class="icon-fill"></path>
                    </svg>
                </div>
                <div class="selector action-more">
                    <svg><use xlink:href="#sprite-dots"></use></svg>
                </div>
            </div>
        </div>
    `)

    Lampa.Template.add('shots_counter', `
        <div class="shots-counter">
            <span>Нравится</span>
            <div>140k</div>
        </div>
    `)

    Lampa.Template.add('shots_author', `
        <div class="shots-author">
            <div class="shots-author__img">
                <img>
            </div>
            <div class="shots-author__name"></div>
        </div>
    `)

}

export default {
    init
}