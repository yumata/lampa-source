import TV from '../iptv'
import Lang from '../../../core/lang'
import Html from './html'

let channel_active

function playAnimation(elem, anim){
    elem.css('animation','none')
    elem[0].offsetHeight
    elem.css('animation',(anim || 'pulse') + ' 0.2s ease')
}

function program(data){
    if(channel_active){
        let prog = channel_active.find('.player-panel-iptv-item__prog')

        TV.drawProgram(prog)

        playAnimation(prog, data.dir > 0 ? 'endless-left' : 'endless-right')
    }
}

function channel(data){
    let select = TV.select()

    Html.elem('iptv_channel').removeClass('up down')

    let active = Html.elem('iptv_channel').find('.active')

    Html.elem('iptv_channel').find('> div:not(.active)').remove()

    let new_item = $(`
        <div class="player-panel-iptv-item active">
            <div class="player-panel-iptv-item__left">
                <img class="player-panel-iptv-item__ico" />
            </div>
            <div class="player-panel-iptv-item__body">
                <div class="player-panel-iptv-item__group">${select.group}</div>
                <div class="player-panel-iptv-item__name">${select.name}</div>
                <div class="player-panel-iptv-item__prog">
                    <div class="player-panel-iptv-item__prog-load">${Lang.translate('loading')}...</div>
                </div>
            </div>
        </div>
    `)

    if(select.icons){
        select.icons.forEach(ic => {
            new_item.find('.player-panel-iptv-item__name').append($('<div class="player-panel-iptv-item__icons-item">'+ic+'</div>'))
        })
    }

    let ico = new_item.find('.player-panel-iptv-item__ico')
    let img = ico[0]

    img.onload = () => {
        ico.addClass('loaded')
    }

    img.onerror = () => {
        ico.remove()

        $('.player-panel-iptv-item__left', new_item).append(`
            <svg width="62" height="60" viewBox="0 0 62 60" class="loaded" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10.355" y="9.78363" width="15.8806" height="15.8806" rx="4" stroke="white" stroke-width="2"/>
                <rect x="36.4946" y="33.5455" width="15.8806" height="15.8806" rx="4" stroke="white" stroke-width="2"/>
                <rect x="18.2949" y="31.258" width="14.4642" height="14.4642" rx="4" transform="rotate(45 18.2949 31.258)" stroke="white" stroke-width="2"/>
                <rect x="44.4351" y="7.49618" width="14.4642" height="14.4642" rx="4" transform="rotate(45 44.4351 7.49618)" stroke="white" stroke-width="2"/>
            </svg>
        `)
    }

    if(select.logo) img.src = select.logo
    else img.onerror()

    new_item.css({
        '-webkit-transform': 'translate3d(0,'+(data.dir > 0 ? '100%' : '-100%')+',0)'
    })

    Html.elem('iptv_channel').append(new_item)

    channel_active = new_item

    playAnimation(Html.elem('iptv_position'))
    playAnimation(data.dir > 0 ? Html.elem('iptv_arrow_down') : Html.elem('iptv_arrow_up'))

    setTimeout(() => {
        new_item.css({
            '-webkit-transform': 'translate3d(0,0,0)',
            opacity: 1
        })

        if(active.length) active.removeClass('active').css({
            '-webkit-transform': 'translate3d(0,'+(data.dir > 0 ? '-100%' : '100%')+',0)',
            opacity: 0
        })

        Html.elem('iptv_position').text((data.position + 1).pad(3))
    },10)
}

export default { 
    channel, 
    program 
}
