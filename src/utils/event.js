import Utils from './math'
import Socket from './socket'

function Event(){
    let id    = Utils.uid(10)
    let evoke = ()=>{}

    function callback(data){
        if(data.method == 'callback' && data.callback_id == id){
            evoke(data)

            evoke = ()=>{}
        }
    }

    this.call = function(params, call){
        params.callback_id = id

        evoke = call

        Socket.send('callback',params)
    }

    this.destroy = function(){
        Socket.listener.remove('message', callback)
    }

    Socket.listener.follow('message', callback)
}


export default Event