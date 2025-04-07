import Permit from './permit'
import Utils from '../math'
import Manifest from '../manifest'
import Reguest from '../reguest'

let network = new Reguest()

function url(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

function load(path){
    return new Promise((resolve, reject)=>{
        if(Permit.token){
            let account = Permit.account

            network.silent(url() + path, resolve, (e)=>{
                reject(network.errorCode(e))
            },false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                },
                timeout: 8000
            })
        }
        else{
            reject(403)
        }
    })
}

export default {
    url,
    load
}