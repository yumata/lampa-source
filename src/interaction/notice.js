import Storage from '../utils/storage'
import Arrays from '../utils/arrays'
import Modal from './modal'
import Controller from './controller'
import Template from './template'
import Account from '../utils/account'
import Activity from './activity'
import Utils from '../utils/math'

let where
let data    = {}

function init(){
    data = Storage.get('notice','{}')
}

function getNotice(call){
    Account.notice((result)=>{
        if(result.length){
            let items = []

            result.forEach((item)=>{
                let data = JSON.parse(item.data)
                let desc = 'Доступно новое качество<br><br>Качество - <b>' + data.card.quality + '</b>'

                if(data.card.seasons){
                    let k = []
        
                    for(let i in data.card.seasons) k.push(i)

                    let s = k.pop()

                    desc = 'Новая серия<br><br>Cезон - <b>'+s+'</b><br>Эпизод - <b>'+data.card.seasons[s]+'</b>'
                }
                
                items.push({
                    time: item.date + ' 12:00',
                    title: data.card.title || data.card.name,
                    descr: desc,
                    card: data.card
                })
            })

            let all = items

            all.sort((a,b)=>{
                let t_a = new Date(a.time).getTime(),
                    t_b = new Date(b.time).getTime()

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

        notice.forEach(element => {
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
            html.append('<div class="selector about">У вас еще нет никах уведомлений, зарегистрируйтесь на сайте <b>www.cub.watch</b>, чтобы следить за новыми сериями и релизами.</div>')
        }

        Modal.open({
            title: 'Уведомления',
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
        let time = new Date(element.time).getTime()

        max = Math.max(max, time)
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