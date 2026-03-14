function init(){
    Lampa.Template.add('shots_player_record_button', `
        <div class="button selector shots-player-button" data-controller="player_panel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11.718" cy="11.718" r="10.718" stroke="white" stroke-width="2"/>
                <circle cx="11.718" cy="11.718" r="5.92621" fill="white" class="rec"/>
            </svg>
        </div>
    `)

    Lampa.Template.add('shots_modal_before_recording', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_before_recording_txt_1}
            </div>
            <div>
                <svg class="shots-svg-auto shots-svg-auto--helmet"><use xlink:href="#sprite-shots-howneed"></use></svg>
            </div>
            <div>
                #{shots_modal_before_recording_txt_2}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_before_upload_recording', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_before_upload_recording_txt_1}
            </div>
            <div>
                <svg class="shots-svg-auto shots-svg-auto--helmet"><use xlink:href="#sprite-shots-notitles"></use></svg>
            </div>
            <div>
                #{shots_modal_before_upload_recording_txt_2}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_error_recording', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_error_recording_txt_1}
            </div>
            <div>
                #{shots_modal_error_recording_txt_2}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_report', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_report_txt_1}
            </div>
            <div>
                #{shots_modal_report_txt_2}
            </div>
            <div>
                #{shots_modal_report_txt_3}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_delete', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_delete_txt_1}
            </div>
            <div>
                #{shots_modal_delete_txt_2}
            </div>
        </div>
    `)

    Lampa.Template.add('shots_modal_quota_limit', `
        <div class="about">
            <div style="font-size: 1.2em;">
                #{shots_modal_quota_txt_1}
            </div>
            <div>
                #{shots_modal_quota_txt_2}
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
                    <div class="shots-player-recorder__text">#{shots_recording_text} <span></span></div>
                    <div class="shots-player-recorder__button selector shots-player-recorder__rewind">
                        <svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.75 10.2302C13.4167 11 13.4167 12.9245 14.75 13.6943L32 23.6536C33.3333 24.4234 35 23.4612 35 21.9216L35 2.00298C35 0.463381 33.3333 -0.498867 32 0.270933L14.75 10.2302Z" fill="currentColor"/>
                            <path d="M1.75 10.2302C0.416665 11 0.416667 12.9245 1.75 13.6943L19 23.6536C20.3333 24.4234 22 23.4612 22 21.9216L22 2.00298C22 0.463381 20.3333 -0.498867 19 0.270933L1.75 10.2302Z" fill="currentColor"/>
                            <rect width="6" height="24" rx="2" transform="matrix(-1 0 0 1 6 0)" fill="currentColor"/>
                        </svg>
                        <div>#{shots_player_recorder_rewind_text}</div>
                    </div>
                    <div class="shots-player-recorder__button selector shots-player-recorder__forward">
                        <svg width="35" height="24" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.25 10.2302C21.5833 11 21.5833 12.9245 20.25 13.6943L3 23.6536C1.66666 24.4234 -6.72981e-08 23.4612 0 21.9216L8.70669e-07 2.00298C9.37967e-07 0.463381 1.66667 -0.498867 3 0.270933L20.25 10.2302Z" fill="currentColor"/>
                            <path d="M33.25 10.2302C34.5833 11 34.5833 12.9245 33.25 13.6943L16 23.6536C14.6667 24.4234 13 23.4612 13 21.9216L13 2.00298C13 0.463381 14.6667 -0.498867 16 0.270933L33.25 10.2302Z" fill="currentColor"/>
                            <rect x="29" width="6" height="24" rx="2" fill="currentColor"/>
                        </svg>
                        <div>#{shots_player_recorder_forward_text}</div>
                    </div>
                    <div class="shots-player-recorder__button selector shots-player-recorder__stop">
                        <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="6" height="25" rx="2" fill="currentColor"/>
                            <rect x="13" width="6" height="25" rx="2" fill="currentColor"/>
                        </svg>
                        <div>#{shots_player_recorder_stop_text}</div>
                    </div>
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

    Lampa.Template.add('shots_upload_notice_text', `
        <div class="about">
            <div style="padding-bottom: 1em;">
                #{shots_upload_notice_text}
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
            <video class="shots-lenta-video__video-element" autoplay loop poster="./img/video_poster.png"></video>
            <div class="shots-lenta-video__progress-bar">
                <div></div>
            </div>
            <div class="player-video__loader shots-lenta-video__loader"></div>
            <div class="shots-lenta-video__layer"></div>
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
                <div class="explorer-card__head-body selector">
                    <div class="shots-lenta-panel__info">
                        <div class="explorer-card__head-create shots-lenta-panel__card-year"></div>
                        <div class="shots-lenta-panel__card-title"></div>
                        <div class="shots-lenta-panel__recorder hide"></div>
                        <div class="shots-lenta-panel__tags"></div>
                    </div>
                </div>
            </div>

            <div class="shots-lenta-panel__right">
                <div class="shots-lenta-panel__author"></div>

                <div class="shots-lenta-panel__buttons">
                    <div class="selector action-liked">
                        <svg width="39" height="35" viewBox="0 0 39 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M26.6504 1.50977C29.2617 1.38597 32.2036 2.36705 34.7168 5.42676C37.1567 8.39737 37.1576 11.3625 36.2148 14.002C35.2408 16.7288 33.2538 19.0705 31.834 20.4238C31.8295 20.4281 31.8247 20.4322 31.8203 20.4365L19.1484 32.8271L6.47754 20.4365C5.03099 18.9847 3.053 16.646 2.08203 13.9443C1.14183 11.3282 1.13938 8.39959 3.58105 5.42676C6.09429 2.36705 9.03613 1.38597 11.6475 1.50977C14.3299 1.63693 16.7044 2.92997 17.9932 4.4873C18.2781 4.83167 18.7024 5.03125 19.1494 5.03125C19.5962 5.03113 20.0198 4.83157 20.3047 4.4873C21.5934 2.92997 23.968 1.63697 26.6504 1.50977Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round" fill="currentColor" class="icon-fill"/>
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
        </div>
    `)

    Lampa.Template.add('shots_counter', `
        <div class="shots-counter">
            <span></span>
            <div></div>
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

    let sprites =  `
        <symbol id="sprite-love" viewBox="0 0 39 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.6504 1.50977C29.2617 1.38597 32.2036 2.36705 34.7168 5.42676C37.1567 8.39737 37.1576 11.3625 36.2148 14.002C35.2408 16.7288 33.2538 19.0705 31.834 20.4238C31.8295 20.4281 31.8247 20.4322 31.8203 20.4365L19.1484 32.8271L6.47754 20.4365C5.03099 18.9847 3.053 16.646 2.08203 13.9443C1.14183 11.3282 1.13938 8.39959 3.58105 5.42676C6.09429 2.36705 9.03613 1.38597 11.6475 1.50977C14.3299 1.63693 16.7044 2.92997 17.9932 4.4873C18.2781 4.83167 18.7024 5.03125 19.1494 5.03125C19.5962 5.03113 20.0198 4.83157 20.3047 4.4873C21.5934 2.92997 23.968 1.63697 26.6504 1.50977Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
        </symbol>

        <symbol id="sprite-shots" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M253.266 512a19.166 19.166 0 0 1-19.168-19.168V330.607l-135.071-.049a19.164 19.164 0 0 1-16.832-28.32L241.06 10.013a19.167 19.167 0 0 1 36.005 9.154v162.534h135.902a19.167 19.167 0 0 1 16.815 28.363L270.078 502.03a19.173 19.173 0 0 1-16.812 9.97z" fill="currentColor"></path>
        </symbol>

        <symbol id="sprite-shots-notitles" viewBox="0 0 474 138" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="216.196" height="121.309" rx="9.5" stroke="white" stroke-width="3"/>
            <rect x="255.49" y="1.5" width="216.196" height="121.309" rx="9.5" stroke="white" stroke-width="3"/>
            <rect x="77.9692" y="49.6289" width="63.2581" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="51.4348" y="64.8156" width="116.327" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="302.813" y="27.8919" width="58.0774" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="345.485" y="10.1938" width="36.2068" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="319.336" y="44.1069" width="41.5542" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="312.751" y="60.3219" width="48.1394" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.66" x="316.25" y="76.5368" width="44.6411" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.38" x="342.385" y="92.7517" width="18.5054" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.28" x="308.429" y="108.967" width="52.4612" height="4.04266" rx="2.02133" fill="white"/>
            <rect x="371.113" y="27.8919" width="38.2129" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="371.113" y="44.1069" width="47.8267" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="371.113" y="60.3219" width="29.3054" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.66" x="371.113" y="76.5368" width="44.3281" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.38" x="371.113" y="92.7517" width="29.3054" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.28" x="371.113" y="108.967" width="30.9517" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="99.001" y="80.0025" width="21.1946" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="169.168" y="88.6869" width="62.5064" height="6.28762" rx="3.14381" transform="rotate(45 169.168 88.6869)" fill="#FF3F3F"/>
            <rect width="62.5064" height="6.28762" rx="3.14381" transform="matrix(-0.707107 0.707107 0.707107 0.707107 208.921 88.6869)" fill="#FF3F3F"/>
            <rect x="423.386" y="88.6869" width="62.5064" height="6.28762" rx="3.14381" transform="rotate(45 423.386 88.6869)" fill="#FF3F3F"/>
            <rect width="62.5064" height="6.28762" rx="3.14381" transform="matrix(-0.707107 0.707107 0.707107 0.707107 463.138 88.6869)" fill="#FF3F3F"/>
        </symbol>

        <symbol id="sprite-shots-howneed" viewBox="0 0 474 138" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="216.196" height="121.309" rx="9.5" stroke="white" stroke-width="3"/>
            <rect x="255.49" y="1.5" width="216.196" height="121.309" rx="9.5" stroke="white" stroke-width="3"/>
            <rect x="54.1262" y="103.818" width="47.7241" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.28" x="16.4497" y="103.818" width="186.409" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="302.813" y="27.8919" width="58.0774" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="345.485" y="10.1938" width="36.2068" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="319.336" y="44.1069" width="41.5542" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="312.751" y="60.3219" width="48.1394" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.66" x="316.25" y="76.5368" width="44.6411" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.38" x="342.385" y="92.7517" width="18.5054" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.28" x="308.429" y="108.967" width="52.4612" height="4.04266" rx="2.02133" fill="white"/>
            <rect x="371.113" y="27.8919" width="38.2129" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="371.113" y="44.1069" width="47.8267" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="371.113" y="60.3219" width="29.3054" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.66" x="371.113" y="76.5368" width="44.3281" height="5.14891" rx="2.57446" fill="white"/>
            <rect opacity="0.28" x="371.113" y="108.967" width="30.9517" height="5.14891" rx="2.57446" fill="white"/>
            <rect x="59.2751" y="100.74" width="11.3044" height="5.14891" rx="2.57446" transform="rotate(90 59.2751 100.74)" fill="white"/>
            <rect x="101.85" y="100.74" width="11.3044" height="5.14891" rx="2.57446" transform="rotate(90 101.85 100.74)" fill="white"/>
            <rect x="423.386" y="88.6869" width="62.5064" height="6.28762" rx="3.14381" transform="rotate(45 423.386 88.6869)" fill="#FF3F3F"/>
            <rect width="62.5064" height="6.28762" rx="3.14381" transform="matrix(-0.707107 0.707107 0.707107 0.707107 463.138 88.6869)" fill="#FF3F3F"/>
        </symbol>
    `

    document.querySelector('#sprites').innerHTML += sprites
}

export default {
    init
}