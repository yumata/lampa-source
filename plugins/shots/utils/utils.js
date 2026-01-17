function videoScreenShot(video, screen_width = 320){
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')
    let scale = screen_width / video.videoWidth

    let width = Math.round(video.videoWidth * scale)
    let height = Math.round(video.videoHeight * scale)

    canvas.width = width
    canvas.height = height

    try{
        context.drawImage(video, 0, 0, width, height)
    }
    catch(e){
        console.error('Shots', 'video screenshot error:', e.message)
    }

    return canvas.toDataURL('image/png')
}

function videoReplaceStatus(from, to){
    to.status = from.status
    to.screen = from.screen
    to.file   = from.file
}

function getBalanser(card){
    let history_data = Lampa.Storage.get('online_watched_last', '{}')
    let history_key  = Lampa.Utils.hash(card.name ? card.original_name : card.original_title)
    let history_item = history_data[history_key]

    return history_item && history_item.balanser ? history_item.balanser : ''
}

function shortVoice(voice){
    return (voice || '').replace(/\s[^a-zA-Zа-яА-Я0-9].*$/, '').trim()
}

function isTSQuality(str){
    return str.toLowerCase().indexOf(' ts') > -1 || str.toLowerCase().indexOf(' ad') > -1
}

function modal(html, buttons, back){
    let body = $('<div></div>')
    let footer = $('<div class="shots-modal-footer"></div>')

    body.append(html)
    body.append(footer)

    buttons.forEach((button)=>{
        let btn = Lampa.Template.get('shots_button', {text: button.name})

        btn.on('hover:enter', ()=>{
            if(button.onSelect) button.onSelect()
        })

        if(button.cancel) btn.addClass('shots-selector--transparent')

        footer.append(btn)
    })

    Lampa.Modal.open({
        html: body,
        size: 'small',
        scroll: {
            nopadding: true
        },
        onBack: back
    })
}

export default {
    videoScreenShot,
    videoReplaceStatus,
    getBalanser,
    shortVoice,
    isTSQuality,
    modal
}