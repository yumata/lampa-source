import Template from './template'
import Controller from './controller'
import Modal from './modal'
import Socket from '../utils/socket'

let timer
let listener

function open(params){
    let enabled = Controller.enabled().name
    let text    = params.type == 'card' ? 'Открыть карточку на другом устройстве' : params.type == 'play' ? 'Выберите устройство на котором смотреть' : ''
    let temp    = Template.get('broadcast',{text})
    let list    = temp.find('.broadcast__devices')

    if(!text) temp.find('.about').remove()

    listener = function(e){
        if(e.method == 'devices'){
            let devices = e.data.filter(d=>!(d.name == 'CUB' || d.device_id == Socket.uid()))
            
            list.empty()

            devices.forEach(device=>{
                let item = $('<div class="broadcast__device selector">'+device.name+'</div>')

                item.on('hover:enter',()=>{
                    close()

                    Controller.toggle(enabled)

                    if(params.type == 'card'){
                        Socket.send('open',{
                            params: params.object,
                            uid: device.uid
                        })
                    }

                    if(params.type == 'play'){
                        Socket.send('other',{
                            params: {
                                submethod: 'play',
                                object: params.object
                            },
                            uid: device.uid
                        })
                    }
                })

                list.append(item)
            })

            Modal.toggle()
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

function close(){
    Socket.listener.remove('message',listener)

    clearInterval(timer)

    Modal.close()

    listener = null
}

export default {
    open
}