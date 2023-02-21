import Template from './template'
import Storage from '../utils/storage'
import Socket from '../utils/socket'
import Utils from '../utils/math'

function update(params){
    if(params.hash == 0) return

    let viewed = Storage.cache('file_view',10000,{})
    let road   = viewed[params.hash]

    if(typeof road == 'undefined' || typeof road == 'number'){
        road = {
            duration: 0,
            time: 0,
            percent: 0
        }

        viewed[params.hash] = road
    }

    road.percent = params.percent

    if(typeof params.time !== 'undefined')     road.time     = params.time
    if(typeof params.duration !== 'undefined') road.duration = params.duration

    Storage.set('file_view', viewed)

    let line = $('.time-line[data-hash="'+params.hash+'"]').toggleClass('hide', params.percent ? false : true)

    $('> div', line).css({
        width: params.percent + '%'
    })

    $('.time-line-details[data-hash="'+params.hash+'"]').each(function(){
        let f = format(road)

        $(this).find('[a="t"]').text(f.time)
        $(this).find('[a="p"]').text(f.percent)
        $(this).find('[a="d"]').text(f.duration)
        $(this).toggleClass('hide', road.duration ? false : true)
    })

    if(!params.received) Socket.send('timeline',{params})
}

function view(hash){
    let viewed = Storage.cache('file_view',10000,{}),
        curent = typeof viewed[hash] !== 'undefined' ? viewed[hash] : 0

    let road = {
        percent: 0,
        time: 0,
        duration: 0
    }

    if(typeof curent == 'object'){
        road.percent  = curent.percent
        road.time     = curent.time
        road.duration = curent.duration
    }
    else{
        road.percent = curent || 0
    }

    return {
        hash: hash,
        percent: road.percent,
        time: road.time,
        duration: road.duration,
        handler: (percent,time,duration) => update({ hash, percent, time, duration })
    }
}

function render(params){
    let line = Template.get('timeline', params)

    line.toggleClass('hide',params.percent ? false : true)

    return line
}

function details(params, str = ''){
    let line = Template.get('timeline_details', format(params))

    if(str) line.prepend(str)

    line.attr('data-hash', params.hash)

    line.toggleClass('hide',params.duration ? false : true)

    return line
}

function format(params){
    let road = {
        percent: params.percent + '%',
        time: Utils.secondsToTimeHuman(params.time),
        duration: Utils.secondsToTimeHuman(params.duration)
    }

    return road
}

export default {
    render,
    update,
    view,
    details,
    format
}
