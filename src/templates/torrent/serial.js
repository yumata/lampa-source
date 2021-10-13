let html = `<div class="torrent-serial selector">
    <img src="{img}" class="torrent-serial__img" />
    <div class="torrent-serial__content">
        <div class="torrent-serial__body">
            <div class="torrent-serial__title">{title}</div>
            <div class="torrent-serial__line">Серия - <b>{episode}</b> &nbsp;•&nbsp; Сезон - <b>{season}</b> &nbsp;•&nbsp; Выход - {air_date}</div>
        </div>
        <div class="torrent-serial__detail">
            <div class="torrent-serial__size">{size}</div>
            <div class="torrent-serial__exe">.{exe}</div>
        </div>
    </div>
    <div class="torrent-serial__episode">{episode}</div>
</div>`

export default html