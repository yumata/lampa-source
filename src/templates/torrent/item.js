let html = `<div class="torrent-item selector layer--visible layer--render">
    <div class="torrent-item__title">{title}</div>
    <div class="torrent-item__ffprobe hide"></div>
    <div class="torrent-item__details">
        <div class="torrent-item__date">{date}</div>
        <div class="torrent-item__tracker">{tracker}</div>

        <div class="torrent-item__bitrate bitrate">#{torrent_item_bitrate}: <span>{bitrate} #{torrent_item_mb}</span></div>
        <div class="torrent-item__seeds">#{torrent_item_seeds}: <span>{seeds}</span></div>
        <div class="torrent-item__grabs">#{torrent_item_grabs}: <span>{grabs}</span></div>
        
        <div class="torrent-item__size">{size}</div>
    </div>
</div>`

export default html