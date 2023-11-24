import DB from './db'
import Parser from './guide_parser'

class Guide{
    static init(){
        let lastupdate = Lampa.Storage.get('iptv_guide_updated_status','{}').time || 0

        if(Lampa.Storage.field('iptv_guide_update_after_start')) this.update()

        setInterval(()=>{
            //if((lastupdate + 1000 * 60 * 60 * Lampa.Storage.field('iptv_guide_interval')) < Date.now()) this.update()
        },1000 * 60)
    }

    static update(status_elem){
        let url = Lampa.Storage.get('iptv_guide_url')

        if(Lampa.Storage.field('iptv_guide_custom') && url){
            if(!window.iptv_guide_update_process){
                window.iptv_guide_update_process = Parser.listener

                if(status_elem){
                    Parser.listener.follow('end',(data)=>{
                        let keys  = Lampa.Arrays.getKeys(data.channel)
                        let count = keys.length
                        let start = 0
                        let next  = (inx)=>{
                            let id = keys[inx]

                            if(!id){
                                Lampa.Storage.set('iptv_guide_updated_status',{
                                    type: 'finish',
                                    channels: count,
                                    time: Date.now()
                                })
                                
                                Parser.listener.send('finish',{count, time: Date.now()})

                                window.iptv_guide_update_process.destroy()

                                window.iptv_guide_update_process = false

                                return
                            }

                            DB.rewriteData('epg', id, data.channel[id].program).finally(()=>{
                                start++

                                Parser.listener.send('saved',{percent: 100 * (inx / count)})

                                next(start)
                                
                            })
                        }

                        next(0)
                    })

                    Parser.listener.follow('error',(data)=>{
                        window.iptv_guide_update_process.destroy()

                        window.iptv_guide_update_process = false

                        Lampa.Storage.set('iptv_guide_updated_status', {
                            type: 'error',
                            text: data.text
                        })
                    })
                }

                setTimeout(()=>{
                    Parser.start(url)
                },100)
            }
        }
        else if(status_elem){
            Lampa.Noty.show(Lampa.Lang.translate('iptv_guide_error_link'))
        }
    }
}

export default Guide