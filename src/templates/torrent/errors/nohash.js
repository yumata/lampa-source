let html = `<div class="error">
    <div class="error__ico"></div>
    <div class="error__body">
        <div class="error__title">{title}</div>
        <div class="error__text">{text}</div>
    </div>
</div>

<div class="torrent-error noconnect">
    <div>
        <div>#{torent_nohash_reasons}</div>
        <ul>
            <li>#{torent_nohash_reason_one}</li>
            <li>#{torent_nohash_reason_two}: {echo}</li>
            <li>#{torent_nohash_reason_three}: <code>{url}</code></li>
        </ul>
    </div>

    <div class="is--jackett">
        <div>#{torent_nohash_do}</div>
        <ul>
            <li>#{torent_nohash_do_one}</li>
            <li>#{torent_nohash_do_two}</li>
            <li>#{torent_nohash_do_three}</li>
        </ul>
    </div>

    <div class="is--torlook">
        <div>#{torent_nohash_do}</div>
        <ul>
            <li>#{torent_nohash_do_four}</li>
            <li>#{torent_nohash_do_five}</li>
        </ul>
    </div>
</div>`

export default html