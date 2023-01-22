function parse(string, empty){
    let json = empty || {}
    
    if(string){
        try{
            json = JSON.parse(string)
        }
        catch(e){}
    }
    
    return json
}

function stringify(data){
    return JSON.stringify(data)
}

onmessage = (e) => {
    let msg = e.data
    
    if(msg.type == 'stringify'){
        postMessage(stringify(msg.data))
    }
    else if(msg.type == 'parse'){
        postMessage(parse(msg.data, msg.empty))
    }
}