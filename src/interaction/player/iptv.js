import Subscribe from '../../utils/subscribe'
import Keypad from '../keypad'
import Panel from './panel'


let listener = Subscribe()

let status = {
    active: false,
    channel: false,
    select: false,
    program: false
}

function init(){
    Keypad.listener.follow('keydown',(e)=>{
        if(!playning()) return

        Panel.rewind()

        //PG-
        if (e.code === 428 || e.code === 34 || e.code === 4 || e.code === 65){
            prevChannel()
            playDelay()
        }

        //PG+
        if(e.code === 427 || e.code === 33 || e.code === 5|| e.code === 68){
            nextChannel()
            playDelay()
        }
    })
}

function start(object){
    status.position_view    = object.position
    status.position_channel = object.position

    status.active  = object
    status.channel = channel()

    listener.send('channel', {channel: status.channel, dir: 0, position: status.position_view})

    if(status.active.onPlay) status.active.onPlay(status.channel)

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

        if(status.active.onPlay) status.active.onPlay(status.channel)

        listener.send('play', {channel: status.channel, position: status.position_view})
    }
}

function playDelay(){
    clearTimeout(status.timer)

    status.timer = setTimeout(play,2000)
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

function redrawChannel(){
    moveChannel(0)
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

function playlistProgram(){
    if(status.active.onPlaylistProgram) status.active.onPlaylistProgram(status.select, status.position_program)
}

function openMenu(){
    if(status.active.onMenu) status.active.onMenu(status.select, status.position_program)
    else if(status.active.onPlaylistProgram) status.active.onPlaylistProgram(status.select, status.position_program)
}

function destroy(){
    clearTimeout(status.timer)

    status = {
        active: false,
        channel: false,
        select: false,
        program: false
    }
}

export default {
    listener,
    init,
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
    playlistProgram,
    openMenu,
    redrawChannel,
    destroy
}