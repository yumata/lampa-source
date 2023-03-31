onmessage = (e) => {
    let msg = e.data
    
    if(msg.type == 'account_bookmarks_parse'){
        let bookmarks = msg.data.map((elem)=>{
            if(typeof elem.data == 'string'){
                elem.data = JSON.parse(elem.data)
                
                delete elem.data.release_quality
                delete elem.data.quality
            }
    
            return elem
        }).reverse()

        postMessage(bookmarks)
    }
}