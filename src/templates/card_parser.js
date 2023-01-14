let html = `<div class="card-parser selector layer--visible layer--render">
    <div class="card-parser__title">{Title}</div>

    <div class="card-parser__footer">
        <div class="card-parser__details">
            <div>#{torrent_item_seeds}: <span>{Seeders}</span></div>
            <div>#{torrent_item_grabs}: <span>{Peers}</span></div>
        </div>
        <div class="card-parser__size">{size}</div>
    </div>
</div>`

export default html