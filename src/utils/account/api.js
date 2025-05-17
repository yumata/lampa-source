import Permit from './permit'
import Utils from '../math'
import Manifest from '../manifest'
import Reguest from '../reguest'
import Arrays from '../arrays'

let network = new Reguest()

function url(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

function load(path, params = {}){
    return new Promise((resolve, reject)=>{
        if(Permit.token){
            let account = Permit.account

            Arrays.extend(params, {
                headers: {
                    token: account.token,
                    profile: account.profile.id
                },
                timeout: 8000
            })

            network.silent(url() + path, resolve, (e)=>{
                reject(network.errorCode(e))
            }, false, params)
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