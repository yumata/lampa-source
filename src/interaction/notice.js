import Storage from '../utils/storage'
import Modal from './modal'
import Controller from './controller'
import Template from './template'
import Account from '../utils/account'
import Activity from './activity'
import Utils from '../utils/math'
import Lang from '../utils/lang'
import Arrays from '../utils/arrays'

let where
let data    = {}

function init(){
    data = Storage.get('notice','{}')

    setInterval(()=>{
        getNotice(icon)
    },1000*60*5)
}

function getNotice(call){
    Account.notice((result)=>{
        if(result.length){
            let items = []

            result.forEach((item)=>{
                let data = JSON.parse(item.data)
                let desc = Lang.translate('notice_new_quality') + '<div class="notice__footer"><div>'+Lang.translate('notice_quality')+' - <b>' + data.card.quality + '</b></div></div>'

                if(data.card.seasons){
                    let k = []
        
                    for(let i in data.card.seasons) k.push(i)

                    let s = k.pop()

                    desc = Lang.translate('notice_new_episode') + '<div class="notice__footer"><div>S - <b>'+s+'</b></div><div>E - <b>'+data.card.seasons[s]+'</b></div>'+(data.voice ? '<div>'+data.voice+'</div>' : '')+'</div>'
                }
                
                items.push({
                    time: item.time || (new Date(item.date)).getTime(),
                    title: data.card.title || data.card.name,
                    descr: desc,
                    card: data.card
                })
            })

            let all = items

            all.sort((a,b)=>{
                let t_a = a.time,
                    t_b = b.time

                if(t_a > t_b) return -1
                else if(t_a < t_b) return 1
                else return 0
            })

            call(all)
        }
        else call([])
    })
}

function open(){
    getNotice((notice)=>{
        let html = $('<div></div>')
        
        notice.forEach(notice_item => {
            let element = Arrays.clone(notice_item)
                element.time = Utils.parseTime(element.time).short

            let item = Template.get(element.card ? 'notice_card' : 'notice',element)

            if(element.card){
                let img = item.find('img')[0]
                let poster_size  = Storage.field('poster_size')

                img.onload = function(){}
            
                img.onerror = function(e){
                    img.src = './img/img_broken.svg'
                }

                img.src = element.card.poster ? element.card.poster : element.card.img ? element.card.img : Utils.protocol() + 'imagetmdb.cub.watch/t/p/'+poster_size+'/'+element.card.poster_path

                item.on('hover:enter',()=>{
                    Modal.close()

                    Activity.push({
                        url: '',
                        component: 'full',
                        id: element.card.id,
                        method: element.card.seasons ? 'tv' : 'movie',
                        card: element.card,
                        source: 'cub'
                    })
                })
            }

            html.append(item)
        })

        

        if(!notice.length){
            html.append('<div class="selector about">'+Lang.translate(Account.working() ? 'notice_none_account' : 'notice_none')+'</div>')
        }

        Modal.open({
            title: Lang.translate('title_notice'),
            size: 'medium',
            html: html,
            onBack: ()=>{
                Modal.close()

                Controller.toggle('head')
            }
        })

        data.time = maxtime(notice)

        Storage.set('notice',data)

        icon(notice)
    })
}

function maxtime(notice){
    let max = 0

    notice.forEach(element => {
        max = Math.max(max, element.time)
    })

    return max
}

function any(notice){
    return maxtime(notice) > data.time
}

function icon(notice){
    where.find('.notice--icon').toggleClass('active', any(notice))
}

function start(html){
    where = html

    getNotice(icon)
}

export default {
    open,
    start,
    init
}