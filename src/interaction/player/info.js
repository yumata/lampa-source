import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/math'

let html     = Template.get('player_info')
let listener = Subscribe()


function set(data){
    html.find('.player-info__name').html(Utils.pathToNormalTitle(data.title))
}

function toggle(status){
    html.toggleClass('info--visible',status)
}

function render(){
    return html
}

function destroy(){

}

export default {
    listener,
    render,
    set,
    toggle,
    destroy
}