import Template from './template'
import Storage from '../utils/storage'
import Utils from '../utils/math'

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

function hash(element, movie){
    let hash
    
    if(movie.number_of_seasons || /S[0-9]+/.test(element.path)){
        let path = element.path,
            math = path.match(/S([0-9]+)(\.)?EP?([0-9]+)/)

        let s = 0, e = 0

        if(math){
            s = parseInt(math[1])
            e = parseInt(math[3])
        }

        if(s === 0){
            math = path.match(/S([0-9]+)/)

            if(math) s = parseInt(math[1])
        }

        if(e === 0){
            math = path.match(/EP?([0-9]+)/)

            if(math) e = parseInt(math[1])
        }

        if(isNaN(s) || isNaN(e)){
            hash = Utils.hash(element.path)
        }
        else hash = [Utils.hash(movie.original_title),s,e].join('_')
    } 
    else if(movie.original_title){
        hash = Utils.hash(movie.original_title)
    }
    else{
        hash = Utils.hash(element.path)
    }

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