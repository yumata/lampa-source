import Template from './template'
import Controller from '../core/controller'
import Modal from './modal'
import Socket from '../core/socket'
import Lang from '../core/lang'
import Arrays from '../utils/arrays'
import Head from './head/head'
import Activity from './activity/activity'

let timer
let listener

function init(){
    let timer, activity

    let broadcast = Head.addIcon(Template.string('icon_broadcast'), ()=>{
        open({
            type: 'card',
            object: Activity.extractObject(activity)
        })
    })

    broadcast.addClass('open--broadcast')
    
    broadcast.hide()
    
    Lampa.Listener.follow('activity',(e)=>{
        if(e.type == 'start') activity = e.object

        clearTimeout(timer)

        timer = setTimeout(()=>{
            if(activity){
                if(activity.component !== 'full'){
                    broadcast.hide()

                    activity = false
                }
            }
        },1000)

        if(e.type == 'start' && e.component == 'full'){
            broadcast.show()

            activity = e.object
        }
    })
}

/**
 * Открыть окно
 * @params {Object} params - параметры
 * @params {String} params.type - тип (card, play)
 * @params {Object} params.object - объект
 * @returns {void}
 */
function open(params){
    let enabled = Controller.enabled().name
    let text    = params.type == 'card' ? Lang.translate('broadcast_open') : params.type == 'play' ? Lang.translate('broadcast_play') : ''
    let temp    = Template.get('broadcast',{text})
    let list    = temp.find('.broadcast__devices')
    let last    = ''

    if(!text) temp.find('.about').remove()

    Socket.send('devices',{})

    timer = setInterval(()=>{
        Socket.send('devices',{})
    },3000)

    listener = function(e){
        if(e.method == 'devices'){
            let devices = e.data.filter(d=>!(d.name == 'CUB' || d.device_id == Socket.uid()))
            let select
            
            list.empty()

            devices.forEach(device=>{
                let item = $('<div class="broadcast__device selector">'+device.name+'</div>')

                item.on('hover:enter',()=>{
                    close()

                    Controller.toggle(enabled)

                    if(params.type == 'card'){
						let object = Arrays.clone(params.object)
						let card   = {
							id: object.card.id,
							source: object.card.source || 'tmdb'
						}
						
						object.card = card
						
                        Socket.send('open',{
                            params: object,
                            uid: device.uid
                        })
                    }

                    if(params.type == 'play'){
                        let player = Arrays.clone(params.object.player)

                        delete player.playlist

                        Socket.send('other',{
                            params: {
                                submethod: 'play',
                                object: {
                                    player,
                                    playlist: []
                                }
                            },
                            uid: device.uid
                        })
                    }
                }).on('hover:focus',()=>{
                    last = device.uid
                })

                list.append(item)

                if(last == device.uid) select = item[0]
            })

            Modal.toggle(select)
        }
    }

    Modal.open({
        title: '',
        html: temp,
        size: 'small',
        mask: true,
        onBack: ()=>{
            close()

            Controller.toggle(enabled)
        }
    })

    listener({
        method: 'devices',
        data: Socket.devices()
    })

    Socket.listener.follow('message', listener)
}

/**
 * Закрыть окно
 */
function close(){
    Socket.listener.remove('message', listener)

    clearInterval(timer)

    Modal.close()

    listener = null
}

export default {
    init,
    open
}