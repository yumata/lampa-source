let html = `<div class="torrent-checklist">
    <div class="torrent-checklist__descr">#{torrent_error_text}</div>

    <div class="torrent-checklist__progress-steps"></div>
    <div class="torrent-checklist__progress-bar">
        <div style="width: 0"></div>
    </div>

    <div class="torrent-checklist__content">
        <div class="torrent-checklist__steps">
            <ul class="torrent-checklist__list">
                <li>#{torrent_error_step_1}</li>
                <li>#{torrent_error_step_2}</li>
                <li>#{torrent_error_step_3}</li>
                <li>#{torrent_error_step_4}</li>
                <li>#{torrent_error_step_5}</li>
                <li>#{torrent_error_step_6}</li>
            </ul>
        </div>

        <div class="torrent-checklist__info">
            <div class="hide">#{torrent_error_info_1}</div>
            <div class="hide">#{torrent_error_info_2}</div>
            <div class="hide">#{torrent_error_info_3}</div>
            <div class="hide">#{torrent_error_info_4}</div>
            <div class="hide">#{torrent_error_info_5}</div>
            <div class="hide">#{torrent_error_info_6}</div>
            <div class="hide">#{torrent_error_info_7}</div>
        </div>
    </div>

    <div class="torrent-checklist__footer">
        <div class="simple-button selector">#{torrent_error_start}</div><div class="torrent-checklist__next-step"></div>
    </div>
</div>`

export default html