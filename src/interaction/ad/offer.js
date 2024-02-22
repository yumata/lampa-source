import Lang from '../../utils/lang'
import Account from '../../utils/account'
import Modal from '../modal'
import Controller from '../controller'
import Template from '../template'

let timer
let next = 0

function init(){

}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function show(data,call){
    if(Lang.selected(['ru','uk','be','bg']) && !Account.hasPremium() && next < Date.now() && !(data.torrent_hash || data.youtube)){
        let enabled = Controller.enabled().name

        let temp = Template.get('cub_premium')
        let coun = $('<span>15</span>').css('margin-left','0.5em')
        let tic  = 15

        temp.find('.cub-premium__descr').eq(1).text(Lang.translate('ad_disable')).css('font-size','1em')
        temp.find('.cub-premium__url').text(Lang.translate('ad_continue_after')).append(coun)

        timer = setInterval(()=>{
            tic--

            coun.text(tic)

            if(tic == 0){
                clearInterval(timer)

                next = Date.now() + 1000*60*random(30,80)

                Modal.close()

                Controller.toggle(enabled)

                call()
            }
        },1000)

        Modal.open({
            title: '',
            html: temp,
            onBack: ()=>{
                clearInterval(timer)

                Modal.close()
    
                Controller.toggle(enabled)
            }
        })
    
        Modal.render().addClass('modal--cub-premium').find('.modal__content').before('<div class="modal__icon"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32"><path d="m2.837 20.977q-.912-5.931-1.825-11.862a.99.99 0 0 1 1.572-.942l5.686 4.264a1.358 1.358 0 0 0 1.945-.333l4.734-7.104a1.263 1.263 0 0 1 2.1 0l4.734 7.1a1.358 1.358 0 0 0 1.945.333l5.686-4.264a.99.99 0 0 1 1.572.942q-.913 5.931-1.825 11.862z" fill="#D8C39A"></svg></div>')
    }
    else call()
}

export default {
    init,
    show
}
