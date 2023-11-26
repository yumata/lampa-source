let html = $('<div class="processing hide"><div><div class="processing__loader"></div><div class="processing__text"></div></div></div>'),
    text = html.find('.processing__text')

let processing = []

function init(){
    update()
}

function update(){
    if(processing.length){
        text.text(processing.length > 1 ? processing.length : '1 / ' + Math.round(processing[0].percent) + '%')

        let complite = processing.find(a=>a.percent >= 100)

        if(complite) Lampa.Arrays.remove(processing, complite)

        requestAnimationFrame(update)
    }
    else html.addClass('hide')
}

function push(id, percent){
    let find = processing.find(a=>a.id == id)

    if(!find){
        processing.push({
            id: id,
            percent: percent,
            start: Date.now()
        })

        html.removeClass('hide')

        update()
    }
    else find.percent = percent
}

function render(js){
    return js ? html[0] :html
}

export default {
    init,
    push,
    render
}