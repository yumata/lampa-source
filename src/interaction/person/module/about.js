import Template from '../../template'
import TMDB from '../../../core/api/sources/tmdb'
import Lang from '../../../core/lang'
import Utils from '../../../utils/utils'
import Modal from '../../modal'
import Controller from '../../../core/controller'
import Noty from '../../noty'
import Storage from '../../../core/storage/storage'
import Account from '../../../core/account/account'
import Manifest from '../../../core/manifest'
import Arrays from '../../../utils/arrays'

class Module{
    onCreate(){
        this.html = Template.js('person_start',{
            name: this.data.name,
            birthday: this.data.birthday ? Utils.parseTime(this.data.birthday).full : Lang.translate('player_unknown'),
            place: this.data.place_of_birth || Lang.translate('player_unknown')
        })

        this.prefix = Template.prefix(this.html, 'person-start')

        this.subscribed = Storage.get('person_subscribes_id','[]').find(a=>a == this.data.id)

        Utils.imgLoad(this.prefix.img, this.data.profile_path ? TMDB.img(this.data.profile_path, 'w500') : this.data.img || 'img/img_broken.svg', (img)=>{
            img.addClass('loaded')
        })

        if(window.lampa_settings.account_use) this.emit('subscribe', this.subscribed)

        this.html.find('.button--info').on('hover:enter',()=>{
            if(this.data.biography){
                Modal.open({
                    title: this.data.name,
                    size: 'large',
                    html: $('<div class="about">'+this.data.biography.replace(/\n/g, '<br>')+'</div>'),
                    onBack: ()=>{
                        Modal.close()

                        Controller.toggle('content')
                    }
                })
            }
            else{
                Noty.show(Lang.translate('empty_title_two'))
            }
        }).on('hover:focus hover:enter hover:hover',(e)=>{
            this.last = e.target
        })

        if(window.lampa_settings.account_use){
            this.html.find('.button--subscribe').on('hover:enter',()=>{
                if(!Account.Permit.access) return Account.Advert.account()
                
                let subscribes = Storage.get('person_subscribes_id','[]')

                this.subscribed = subscribes.find(a=>a == this.data.id)

                if(!this.subscribed && !Account.hasPremium()) return Account.Advert.premium()

                Lampa.Network.silent(Utils.protocol() + Manifest.cub_domain + '/api/person/' + (this.subscribed ? 'unsubscribe' : 'subscribe'), ()=>{
                    if(this.subscribed) Arrays.remove(subscribes, this.data.id)
                    else if(subscribes.indexOf(this.data.id) == -1) subscribes.push(this.data.id)

                    Storage.set('person_subscribes_id', subscribes)

                    this.subscribed = subscribes.find(a=>a == this.data.id)

                    this.emit('subscribe', this.subscribed)
                },(err)=>{
                    if(err.responseJSON && err.responseJSON.code == 555) Account.Advert.premium()
                    else Noty.show(Lang.translate('subscribe_error'))
                },{
                    person: JSON.stringify(this.data)
                },{
                    headers: {
                        token: Account.Permit.token
                    }
                })
            }).on('hover:focus hover:enter hover:hover',(e)=>{
                this.last = e.target
            })
        }
        else this.html.find('.button--subscribe').remove()
    }

    onSubscribe(subscribed){
        this.html.find('.button--subscribe svg path:nth-of-type(2)').setAttribute('fill', subscribed ? 'currentColor' : 'transparent')
        this.html.find('.button--subscribe span').text(Lang.translate(subscribed ? 'title_unsubscribe' : 'title_subscribe'))
    }
}

export default Module