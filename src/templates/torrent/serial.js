let html = `<div class="torrent-serial selector layer--visible layer--render">
    <img data-src="{img}" class="torrent-serial__img" />
    <div class="torrent-serial__content">
        <div class="torrent-serial__body">
            <div class="torrent-serial__title">{fname}</div>
            <div class="torrent-serial__line"><span>#{torrent_serial_season} - <b>{season}</b></span><span>#{torrent_serial_date} - {air_date}</span></div>
        </div>
        <div class="torrent-serial__detail">
            <div class="torrent-serial__size">{size}</div>
            <div class="torrent-serial__exe">.{exe}</div>
        </div>
        <div class="torrent-serial__clear"></div>
    </div>
    <div class="torrent-serial__episode">{episode}</div>
</div>`

export default html