import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Api from '../../interaction/api'
import Lang from '../../utils/lang'
import Account from '../../utils/account'
import Request from '../../utils/reguest'
import Noty from '../../interaction/noty'
import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Modal from '../../interaction/modal'
import Manifest from '../../utils/manifest'

function create(data, params = {}){
    let html
    let last
    let subscribed = Storage.get('person_subscribes_id','[]').find(a=>a == data.id)
    let network    = new Request()

    this.create = function(){
        html = Template.get('person_start',{
            name: data.name,
            birthday: data.birthday ? Utils.parseTime(data.birthday).full : Lang.translate('player_unknown'),
            img: data.profile_path ? Api.img(data.profile_path) : data.img || 'img/img_broken.svg',
            place: data.place_of_birth || Lang.translate('player_unknown')
        })

        this.substatus()

        html.find('.button--info').on('hover:enter',()=>{
            if(data.biography){
                Modal.open({
                    title: data.name,
                    size: 'large',
                    html: $('<div class="about">'+data.biography+'</div>'),
                    onBack: ()=>{
                        Modal.close()

                        Controller.toggle('content')
                    },
                    onSelect: ()=>{
                        Modal.close()

                        Controller.toggle('content')
                    }
                })
            }
        }).on('hover:focus',(e)=>{
            last = e.target
        })

        html.find('.button--subscribe').on('hover:enter',()=>{
            let subscribes = Storage.get('person_subscribes_id','[]')

            subscribed = subscribes.find(a=>a == data.id)

            if(!subscribed && !Account.hasPremium()) return Account.showCubPremium()

            let account = Account.logged() ? Storage.get('account','{}') : false

            if(!account) return Account.showNoAccount()

            network.silent(Utils.protocol() + Manifest.cub_domain + '/api/person/' + (subscribed ? 'unsubscribe' : 'subscribe'),(result)=>{
                if(subscribed) Arrays.remove(subscribes, data.id)
                else if(subscribes.indexOf(data.id) == -1) subscribes.push(data.id)

                Storage.set('person_subscribes_id',subscribes)

                subscribed = subscribes.find(a=>a == data.id)

                this.substatus()
            },(err)=>{
                if(err.responseJSON && err.responseJSON.code == 555) Account.showCubPremium()
                else Noty.show(Lang.translate('subscribe_error'))
            },{
                person: JSON.stringify(data)
            },{
                headers: {
                    token: account.token
                }
            })
        }).on('hover:focus',(e)=>{
            last = e.target
        })
    }

    this.substatus = function(){
        html.find('.button--subscribe path:eq(1)').attr('fill', subscribed ? 'currentColor' : 'transparent')
        html.find('.button--subscribe span').text(Lang.translate(subscribed ? 'title_unsubscribe' : 'title_subscribe'))
    }

    this.toggle = function(){
        Controller.add('full_start',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())
            },
            update: ()=>{},
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down:this.onDown,
            up: this.onUp,
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('full_start')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        last = null

        html.remove()
    }
}

export default create