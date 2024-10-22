let html = `<div class="ad-video-block">
    <div class="ad-video-block__loader"></div>

    <video class="ad-video-block__video" type="video/mp4" poster="./img/video_poster.png" crossorigin="anonymous"></video>

    <div class="ad-video-block__vast"></div>
    <div class="ad-video-block__vast-line hide"></div>

    <div class="player-video__paused hide">
        <svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="6" height="25" rx="2" fill="white"></rect>
            <rect x="13" width="6" height="25" rx="2" fill="white"></rect>
        </svg>
    </div>

    <div class="ad-video-block__footer">
        <div class="ad-video-block__text"></div>
        <div class="ad-video-block__progress">
            <div class="ad-video-block__progress-fill"></div>
        </div>
    </div>

    <div class="ad-video-block__info"></div>

    <div class="ad-video-block__skip"><span></span></div>
</div>`

export default html