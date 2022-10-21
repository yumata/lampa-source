function Api(){
    let network = new Lampa.Reguest()
    let api_url = 'http://cub.watch/api/iptv/'
    //let api_url = 'http://localhost:3100/api/iptv/'

    this.get = function(method){
        return new Promise((resolve, reject)=>{
            let account = Lampa.Storage.get('account','{}')

            if(account.token){
                network.silent(api_url + method,resolve,reject,false,{
                    headers: {
                        token: account.token,
                        profile: account.profile.id
                    }
                })
            }
            else {
                reject()
            }
        })
    }

    this.program = function(data, call){
        network.timeout(5000)

        network.silent(api_url + 'program/'+data.channel_id+'/'+data.time,(result)=>{
            call({
                result: result.program,
            })
        },()=>{
            call({
                result: ''
            })
        })
    }

    this.destroy = function(){
        network.clear()
    }
}

export default Api