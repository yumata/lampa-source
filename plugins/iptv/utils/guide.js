import DB from './db'
import Parser from './guide_parser'

class Guide{
    static init(){
        let lastupdate = Lampa.Storage.get('iptv_guide_updated_status','{}').time || 0

        if(Lampa.Storage.field('iptv_guide_update_after_start')) this.update()

        setInterval(()=>{
            if(Lampa.Storage.field('iptv_guide_interval') > 0 && (lastupdate + 1000 * 60 * 60 * Lampa.Storage.field('iptv_guide_interval')) < Date.now()) this.update()
        },1000 * 60)
    }

    static update(status_elem){
        let url = Lampa.Storage.get('iptv_guide_url')

        if(Lampa.Storage.field('iptv_guide_custom') && url){
            if(!window.iptv_guide_update_process){
                window.iptv_guide_update_process = Parser.listener

                let last_id = -1
                let program = []
                
                Parser.listener.follow('program',(data)=>{
                    if(last_id == data.id) program.push(data.program)
                    else{
                        DB.rewriteData('epg', last_id, program).finally(()=>{})

                        last_id = data.id

                        program = [data.program]
                    }
                })

                Parser.listener.follow('channel',(data)=>{
                    data.channel.names.forEach(name => {
                        DB.addData('epg_channels', name.toLowerCase(), {
                            id: data.channel.id,
                            ic: data.channel.icon
                        }).catch(()=>{})
                    })
                })

                if(Lampa.Processing){
                    Parser.listener.follow('percent',(data)=>{
                        Lampa.Processing.push('iptv',data.percent)
                    })
                }

                Parser.listener.follow('end',(data)=>{
                    program = []

                    let count = Lampa.Arrays.getKeys(data.channel).length

                    Lampa.Storage.set('iptv_guide_updated_status',{
                        type: 'finish',
                        channels: count,
                        time: Date.now()
                    })

                    Parser.listener.send('finish',{count, time: Date.now()})

                    window.iptv_guide_update_process.destroy()

                    window.iptv_guide_update_process = false
                })

                Parser.listener.follow('error',(data)=>{
                    window.iptv_guide_update_process.destroy()

                    window.iptv_guide_update_process = false

                    Lampa.Storage.set('iptv_guide_updated_status', {
                        type: 'error',
                        text: data.text
                    })
                })
                
                if(DB.clearTable){
                    DB.clearTable('epg').finally(()=>{})
                    DB.clearTable('epg_channels').finally(()=>{})
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