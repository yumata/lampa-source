class Utils{
    static clear(str){
        return str.replace(/\&quot;/g,'"').replace(/\&#039;/g,"'").replace(/\&amp;/g,"&").replace(/\&.+?;/g,'')
    }
}

export default Utils