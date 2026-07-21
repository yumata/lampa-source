import InfusePlayer from './infusePlayer.js'
import SenPlayer from './senPlayer.js'

const PLAYERS = {
    infuse: InfusePlayer,
    senplayer: SenPlayer
}

function get(id) {
    return PLAYERS[id] || null
}

export default {
    all: PLAYERS,
    get
}
