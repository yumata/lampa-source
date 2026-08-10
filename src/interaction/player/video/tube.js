import Arrays from '../../../utils/arrays'

let video_tube = []

function register(params){
    if(typeof params.verify === 'function' && typeof params.create === 'function'){
        if(video_tube.indexOf(params) == -1) video_tube.push(params)

        return true
    }

    return false
}

function verify(src){
    let find = video_tube.find(e=>e.verify(src))

    return find ? find : false
}

function remove(params){
    Arrays.remove(video_tube, params)
}

export default {
    register,
    verify,
    remove
}
