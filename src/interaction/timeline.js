import Template from './template'
import Storage from '../utils/storage'
import Utils from '../utils/math'

function update(params){
    let viewed = Storage.cache('file_view',10000,{})

    viewed[params.hash] = params.percent

    params.continued = false

    Storage.set('file_view', viewed)

    let line = $('.time-line[data-hash="'+params.hash+'"]').removeClass('hide')

    $('> div', line).css({
        width: params.percent + '%'
    })
}

function hash(element, movie){
    let hash
    
    if(movie.title) hash = Utils.hash(movie.title)
    else            hash = Utils.hash(element.path)

    return hash
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
    hash,
    view
}