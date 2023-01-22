onmessage = (e) => {
    let msg = e.data
    
    if(msg.type == 'account_bookmarks_parse'){
        let bookmarks = msg.data.reverse().map((elem)=>{
            if(typeof elem.data == 'string') elem.data = JSON.parse(elem.data)
    
            return elem
        })

        postMessage(bookmarks)
    }
}