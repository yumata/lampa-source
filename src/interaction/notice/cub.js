import Lang from '../../utils/lang'
import Account from '../../utils/account'
import Notice from '../notice'
import NoticeClass from './class'
import Storage from '../../utils/storage'

class NoticeCub extends NoticeClass {
    constructor(params = {}){
        super(params)

        this.name = 'CUB'
        this.time = Storage.get('cub_notice_time','0')

        this.notices = []

        setInterval(this.update.bind(this),1000*60*5)

        this.update()
    }

    update(){
        Account.notice((result)=>{
            this.notices = result.map((item)=>{
                let data = JSON.parse(item.data)
                let text = Lang.translate('notice_new_quality')

                let labels = []

                if(data.card.seasons){
                    let k = []
        
                    for(let i in data.card.seasons) k.push(i)

                    let s = k.pop()

                    labels.push('S - <b>'+s+'</b>')
                    labels.push('E - <b>'+data.card.seasons[s]+'</b>')

                    if(data.voice) labels.push(data.voice)

                    text = Lang.translate('notice_new_episode')
                }
                else{
                    labels.push(Lang.translate('notice_quality') + ' - <b>' + data.card.quality + '</b>')
                }
                
                return {
                    time: item.time || Utils.parseToDate(item.date).getTime(),
                    title: !Lang.selected(['ru', 'uk', 'be']) ? (data.card.original_title || data.card.original_name) : (data.card.title || data.card.name),
                    text: text,
                    poster: data.card.poster ? data.card.poster : data.card.img ? data.card.img : data.card.poster_path,
                    card: data.card,
                    labels: labels
                }
            })

            this.notices.sort((a,b)=>{
                return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
            })

            Notice.drawCount()
        })
    }

    viewed(){
        Storage.set('cub_notice_time',Date.now())

        this.time = Date.now()

        Notice.drawCount()
    }

    empty(){
        return Lang.translate(Account.logged() ? 'notice_none_account' : 'notice_none')
    }

    count(){
        return this.notices.filter(n=>n.time > this.time).length
    }

    items(){
        return this.notices
    }
}

export default NoticeCub