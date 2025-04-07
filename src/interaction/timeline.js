import Template from './template'
import Storage from '../utils/storage'
import Socket from '../utils/socket'
import Utils from '../utils/math'
import Account from '../utils/account'
import Subscribe from '../utils/subscribe'
import Arrays from '../utils/arrays'

let listener = Subscribe()

function filename(){
    let acc  = Account.canSync()
    let name = 'file_view' + (acc ? '_' + acc.profile.id : '')

    if(window.localStorage.getItem(name) === null && acc){
        Storage.set(name, Arrays.clone(Storage.cache('file_view',10000,{})))
    }

    return name
}

function update(params){
    if(params.hash == 0) return

    let viewed = Storage.cache(filename(),10000,{})
    let road   = viewed[params.hash]

    if(typeof road == 'undefined' || typeof road == 'number'){
        road = {
            duration: 0,
            time: 0,
            percent: 0,
            profile: 0
        }

        viewed[params.hash] = road
    }

    road.percent = params.percent

    if(typeof params.time !== 'undefined')     road.time     = params.time
    if(typeof params.duration !== 'undefined') road.duration = params.duration
    if(typeof params.profile !== 'undefined')  road.profile  = params.profile

    Storage.set(filename(), viewed)

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

    listener.send('update', {data:{ hash: params.hash, road }})

    if(!params.received && Account.hasPremium()) Socket.send('timeline',{params})
}

function view(hash){
    let viewed = Storage.cache(filename(),10000,{}),
        curent = typeof viewed[hash] !== 'undefined' ? viewed[hash] : 0

    let account = Account.canSync()
    let profile = account && account.profile ? account.profile.id : 0

    let road = {
        percent: 0,
        time: 0,
        duration: 0,
        profile: 0
    }

    if(typeof curent == 'object'){
        road.percent  = curent.percent
        road.time     = curent.time
        road.duration = curent.duration
        road.profile  = curent.profile || profile
    }
    else{
        road.percent = curent || 0
        road.profile = profile
    }

    listener.send('view', {data: { hash, road }})

    return {
        hash: hash,
        percent: road.percent,
        time: road.time,
        duration: road.duration,
        profile: road.profile,
        handler: (percent,time,duration) => update({ hash, percent, time, duration, profile: road.profile })
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

function watched(card){
    let hash = Lampa.Utils.hash(card.original_name ? [1,1,card.original_name].join('') : card.original_title)

    return view(hash).percent
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
    listener,
    render,
    update,
    view,
    details,
    format,
    watched,
    filename
}
