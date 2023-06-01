import DB from './db'

class Utils{
    static clear(str){
        return str.replace(/\&quot;/g,'"').replace(/\&#039;/g,"'").replace(/\&amp;/g,"&").replace(/\&.+?;/g,'')
    }

    static isHD(name){
        let math = name.toLowerCase().match(' .hd$| .нd$| .hd | .нd | hd$| нd&| hd | нd ')

        return math ? math[0].trim() : ''
    }

    static clearHDSD(name){
        return name.replace(/ hd$| нd$| .hd$| .нd$/gi,'').replace(/ sd$/gi,'').replace(/ hd | нd | .hd | .нd /gi,' ').replace(/ sd /gi,' ')
    }

    static clearMenuName(name){
        return name.replace(/^\d+\. /gi,'').replace(/^\d+ /gi,'')
    }

    static clearChannelName(name){
        return this.clearHDSD(this.clear(name))
    }

    static hasArchive(channel){
        if(channel.catchup){
            let days = parseInt(channel.catchup.days)

            if(!isNaN(days) && days > 0) return days
        }

        return 0
    }

    static canUseDB(){
        return DB.db && Lampa.Storage.get('iptv_use_db','indexdb') == 'indexdb'
    }
}

export default Utils