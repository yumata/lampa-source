import Utils from './math'
import Socket from './socket'

function Event(){
    let ids    = {}
    let evokes = {}

    function callback(data){
        if(data.method == 'callback' && ids[data.callback_name] == data.callback_id){
            evokes[data.callback_id](data)

            evokes[data.callback_id] = ()=>{}
        }
    }

    this.call = function(method, params, call){
        if(!ids[method]) ids[method] = Utils.uid(10)

        params.callback_id   = ids[method]
        params.callback_name = method

        evokes[params.callback_id] = call

        Socket.send('callback',params)
    }

    this.cancel = function(method){
        if(ids[method]){
            evokes[ids[method]] = ()=>{}
        }
    }

    this.destroy = function(){
        Socket.listener.remove('message', callback)

        for(let i in evokes){
            evokes[i] = ()=>{}
        }
    }

    Socket.listener.follow('message', callback)
}


export default Event