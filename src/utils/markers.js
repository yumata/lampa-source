import Head from '../components/head'
import Manifest from './manifest'

let markers = ['socket', 'mirrors', 'request']
let markers_object = {}

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
        requestAnimationFrame(function updateMarkers(){
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
            })

            requestAnimationFrame(updateMarkers);
        })

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
}

function pass(who){
    markers_object[who].pass_count = Math.min(markers_object[who].pass_count + 1, 20);
}

function live(who){
    markers_object[who].error = false;
    markers_object[who].live = true;
}

function normal(who){
    markers_object[who].error = false;
    markers_object[who].live = false;
}

export default {
    init,
    error,
    pass,
    live,
    normal
}