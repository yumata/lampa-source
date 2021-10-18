let html = `<div class="torrent-item selector">
    <div class="torrent-item__title">{title}</div>
    <div class="torrent-item__details">
        <div class="torrent-item__date">{date}</div>
        <div class="torrent-item__tracker">{tracker}</div>

        <div class="torrent-item__bitrate bitrate">Битрейт: <span>{bitrate} Мб/с</span></div>
        <div class="torrent-item__seeds">Раздают: <span>{seeds}</span></div>
        <div class="torrent-item__grabs">Качают: <span>{grabs}</span></div>
        
        <div class="torrent-item__size">{size}</div>
    </div>
</div>`

export default html