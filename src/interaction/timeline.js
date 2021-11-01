import Template from './template'
import Storage from '../utils/storage'

function update(params){
    if(params.hash == 0) return

    let viewed = Storage.cache('file_view',10000,{})

    if(typeof viewed[params.id] === 'undefined'){
        viewed[params.id] = {}
    }

    viewed[params.id][params.hash] = params.percent

    params.continued = false

    Storage.set('file_view', viewed)

    let line = $('.time-line[data-hash="'+params.hash+'"]').toggleClass('hide', params.percent ? false : true)

    $('> div', line).css({
        width: params.percent + '%'
    })
}

function view(id, hash){
    let viewed = Storage.cache('file_view',10000,{}),
        torrent = typeof viewed[id] !== 'undefined' ? viewed[id] : {},
        curent = typeof torrent[hash] !== 'undefined' ? torrent[hash] : 0

    return {
        id: id,
        hash: hash,
        percent: curent || 0
    }
}

function remove(id){
    let viewed = Storage.cache('file_view',10000,{});

    if(typeof viewed[id] !== 'undefined'){
        delete viewed[id];
        Storage.set('file_view', viewed)
    }
}

function render(params){
    let line = Template.get('timeline', params)

    line.toggleClass('hide',params.percent ? false : true)

    return line
}

export default {
    render,
    update,
    view,
    remove
}