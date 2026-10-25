/**
 * Карточка закладки из строки data. Пустой или битый data (например, закладка на удалённую карточку на сервере)
 * не должен обрывать разбор всего списка — собираем карточку из card_id / card_title, иначе пропускаем закладку
 */
function parseCard(elem){
    let card = null

    try{
        card = JSON.parse(elem.data)
    }
    catch(e){}

    if(card && typeof card == 'object' && card.id) return card

    if(!elem.card_id) return null

    card = {id: parseInt(elem.card_id) || elem.card_id, source: 'tmdb', poster_path: elem.card_poster || ''}

    if(elem.card_type == 'tv') card.name = card.original_name = elem.card_title || ''
    else card.title = elem.card_title || ''

    return card
}

onmessage = (e) => {
    let msg = e.data

    if(msg.type == 'account_bookmarks_parse'){
        let bookmarks = msg.data.map((elem)=>{
            if(typeof elem.data == 'string'){
                elem.data = parseCard(elem)

                if(!elem.data) return null

                delete elem.data.release_quality
                delete elem.data.quality
            }

            return elem
        }).filter(elem=>elem).reverse()

        postMessage(bookmarks)
    }
}
