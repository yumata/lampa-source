import Arrays from '../../utils/arrays'
import Subscribe from '../../utils/subscribe'

let listener = Subscribe()
let segments = {
    ad: [],
    skip: []
}

function update(time){
    let skip = get(time)

    if(skip && !skip.segment.viewed){
        skip.segment.viewed = true

        listener.send('skip', skip)
    }
}

function set(new_segments){
    if(Arrays.isObject(new_segments)){
        for(let i in new_segments){
            segments[i] = Arrays.isArray(new_segments[i]) ? Arrays.clone(new_segments[i]) : []
        }
    }
    else{
        segments.ad   = []
        segments.skip = []
    }

    listener.send('set', segments)
}

function get(time){
    let skip = false

    for(let i in segments){
        if(segments[i]){
            for(let j = 0; j < segments[i].length; j++){
                let seg = segments[i][j]
                if(time >= seg.start && time <= seg.end) skip = {type: i, segment: seg}
            }
        }
    }

    return skip
}

function all(){
    return segments
}

export default {
    listener,
    update,
    set,
    get,
    all
}