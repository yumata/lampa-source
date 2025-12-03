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

        <symbol id="sprite-shots" viewBox="0 0 28 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.7324 3.20703C13.3376 3.00055 13.9846 2.94723 14.6152 3.05273L14.9297 3.11914L15.2363 3.21094C15.9417 3.45413 16.5636 3.89768 17.0244 4.49023C17.551 5.16739 17.8377 6.00057 17.8379 6.8584V11.1426H20.9277C21.5974 11.1426 22.256 11.317 22.8379 11.6484C23.347 11.9385 23.7826 12.3405 24.1123 12.8223L24.2471 13.0342L24.3682 13.2529C24.6328 13.7735 24.7759 14.3485 24.7861 14.9346C24.7963 15.5206 24.6731 16.1004 24.4268 16.6299L24.3135 16.8535L17.1562 29.9375V29.9385C16.824 30.5456 16.3345 31.0522 15.7393 31.4053C15.144 31.7583 14.4645 31.945 13.7725 31.9453H13.7715C13.2646 31.9454 12.7622 31.8453 12.2939 31.6514C11.8258 31.4574 11.4003 31.1728 11.042 30.8145C10.6837 30.4561 10.399 30.0306 10.2051 29.5625C10.0113 29.0944 9.91208 28.5926 9.91211 28.0859V23.8145L6.85742 23.8135V23.8125C6.18871 23.8123 5.5314 23.6393 4.9502 23.3086C4.36895 22.9778 3.88374 22.5016 3.54199 21.9268C3.2002 21.3517 3.01373 20.6972 3.00098 20.0283C2.98826 19.3596 3.1492 18.6989 3.46875 18.1113L10.5879 5.01562H10.5889C10.9987 4.26201 11.6475 3.66568 12.4336 3.32227L12.7324 3.20703Z" fill="white" stroke="#FFCC00" stroke-width="6"/>
        </symbol>
    `

    document.querySelector('#sprites').innerHTML += sprites
}

export default {
    init
}