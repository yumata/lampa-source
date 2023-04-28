import Subscribe from '../../utils/subscribe'


let listener = Subscribe()

let status = {
    active: false,
    channel: false,
    select: false,
    program: false
}

function start(object){
    status.position_view    = object.position
    status.position_channel = object.position

    status.active  = object
    status.channel = channel()

    listener.send('channel', {channel: status.channel, dir: 0, position: status.position_view})
    listener.send('play', {channel: status.channel, position: status.position_view})
}

function playning(){
    return status.active
}

function channel(position){
    status.select = status.active.onGetChannel(position || status.position_view)

    return status.select
}

function play(){
    if(status.select !== status.channel){
        status.channel = status.select
        
        status.position_channel = status.position_view

        listener.send('play', {channel: status.channel, position: status.position_view})
    }
}

function reset(){
    status.position_view = status.position_channel

    moveChannel(0)
}

function programReady(data){
    setTimeout(()=>{
        if(status.select == data.channel){
            status.program = data

            status.position_program = data.position

            listener.send('draw-program',{dir: 0})
        }
    },10)
}

function select(){
    return status.select
}

function moveChannel(dir){
    channel(status.position_view)

    listener.send('channel', {channel: status.select, dir: dir, position: status.position_view})
}

function nextChannel(){
    if(status.position_view + 1 < status.active.total){
        status.position_view++

        moveChannel(1)
    }
}

function prevChannel(){
    if(status.position_view - 1 >= 0){
        status.position_view--

        moveChannel(-1)
    }
}

function moveProgram(dir){
    if(status.program){
        status.position_program += dir

        status.position_program = Math.max(0,Math.min(status.program.total, status.position_program))

        listener.send('draw-program',{dir})
    }
}

function nextProgram(){
    moveProgram(1)
}

function prevProgram(){
    moveProgram(-1)
}

function drawProgram(container){
    status.active.onGetProgram(status.select, status.position_program, container)
}

function destroy(){
    status = {
        active: false,
        channel: false,
        select: false,
        program: false
    }
}

export default {
    listener,
    start,
    playning,
    channel,
    programReady,
    reset,
    play,
    select,
    nextChannel,
    prevChannel,
    prevProgram,
    nextProgram,
    drawProgram,
    destroy
}