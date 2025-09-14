import Head from '../interaction/head/head'
import Manifest from './manifest'

let markers = ['socket', 'mirrors', 'request']
let markers_object = {}

let update_started = false

markers.forEach(marker=>{
    markers_object[marker] = {
        error: false,
        live: false,
        pass_count: 0,
        pass_time: 0,
        status_now: '',
        status_prev: '',
    }
})

function init(){
    markers.forEach(marker=>{
        markers_object[marker].element = Head.render()[0].querySelector('.head__markers .item--' + marker)
    })

    if(typeof requestAnimationFrame !== 'undefined'){
        Lampa.Listener.follow('request_error', (e)=>{
            if(e.params.url.indexOf(Manifest.cub_domain) > -1 && e.error.status == 0 && e.exception !== 'timeout'){
                error('request')
            }
        })

        Lampa.Listener.follow('request_secuses', (e)=>{
            if(e.params.url.indexOf(Manifest.cub_domain) > -1){
                pass('request')
                normal('request')
            }
        })
    }
}

function update(){
    if(update_started) return

    if(typeof requestAnimationFrame !== 'undefined'){
        update_started = true

        requestAnimationFrame(function updateMarkers(){
            let any = false

            markers.forEach(marker=>{
                let marker_data = markers_object[marker]
                let status = marker_data.pass_count > 0 ? 'status--pass' : marker_data.live ? 'status--live' : (marker_data.error ? 'status--error' : '')

                if(status !== marker_data.status_now){
                    marker_data.status_prev = marker_data.status_now
                    marker_data.status_now = status

                    updateStatus(marker)
                }

                if(status == 'status--pass' && marker_data.pass_time < Date.now() - 100){
                    marker_data.pass_count--
                    marker_data.pass_time = Date.now()
                }

                if(marker_data.pass_count >= 0) any = true
                if(marker_data.pass_count == 0) marker_data.pass_count = -1
            })

            if(any) requestAnimationFrame(updateMarkers)
            else update_started = false
        })
    }
}

function updateStatus(marker){
    let marker_data = markers_object[marker]

    if(!marker_data.element) return

    let status = marker_data.pass_count > 0 ? 'status--pass' : marker_data.live ? 'status--live' : (marker_data.error ? 'status--error' : '')

    marker_data.element.classList.remove('status--error', 'status--live', 'status--pass')

    if(status) marker_data.element.classList.add(status)
}

function error(who){
    markers_object[who].error = true;
    markers_object[who].live = false;

    update()
}

function pass(who){
    markers_object[who].pass_count = Math.min(markers_object[who].pass_count + 1, 20);

    update()
}

function live(who){
    markers_object[who].error = false;
    markers_object[who].live = true;

    update()
}

function normal(who){
    markers_object[who].error = false;
    markers_object[who].live = false;

    update()
}

export default {
    init,
    error,
    pass,
    live,
    normal
}