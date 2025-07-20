import Permit from './permit'
import Utils from '../math'
import Manifest from '../manifest'
import Reguest from '../reguest'
import Arrays from '../arrays'

let network = new Reguest()

function url(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

function load(path, params = {}, post = false){
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

            let u = params.url ? params.url : url() + path

            network.silent(u, resolve, (e)=>{
                reject(network.errorCode(e))
            }, post, params)
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