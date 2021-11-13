import Utils from './math'

let client

function init(){
    client = pCloudSdk.createClient(null, 'pcloud');

    window.locationid = 2

    if(typeof pCloudSdk == 'undefined'){

    }
    else start()
}

function login(){
    client.login('email', 'pass').then((token)=>{
        
    }).catch(function(error) {
        console.log(error)
    })
}

function start(){

}

export default {
    init,
    login
}