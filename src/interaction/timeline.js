import Template from './template'
import Storage from '../utils/storage'

function update(params){
    if(params.hash == 0) return

    let viewed = Storage.cache('file_view',10000,{})

    viewed[params.hash] = params.percent

    params.continued = false

    Storage.set('file_view', viewed)

    let line = $('.time-line[data-hash="'+params.hash+'"]').toggleClass('hide', params.percent ? false : true)

    $('> div', line).css({
        width: params.percent + '%'
    })
}

function view(hash){
    let viewed = Storage.cache('file_view',10000,{}),
        curent = typeof viewed[hash] !== 'undefined' ? viewed[hash] : 0

    return {
        hash: hash,
        percent: curent || 0
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
    view
}