import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Utils from '../../../utils/utils'
import Lang from '../../../core/lang'
import Noty from '../../../interaction/noty'
import Account from '../../../core/account/account'
import Template from '../../../interaction/template'
import Api from '../../../core/account/api'
import Bell from '../../../interaction/bell'

export default {
    onCreate: function(){
        if(window.lampa_settings.disable_features.subscribe) return
        
        let button = this.html.find('.button--subscribe')
        
        button.on('hover:enter',()=>{
            if(button.hasClass('loading')) return

            if(!Account.Permit.access){
                return Account.Modal.account()
            }

            button.addClass('loading')

            Api.load('card/translations', {}, {
                id: this.card.id,
                imdb_id: this.card.imdb_id,
                season: Utils.countSeasons(this.card)
            }).then((data)=>{
                let items = []
                let subscribed = data.translations.subscribed || button.data('voice')

                if(subscribed){
                    items.push({
                        title: Lang.translate('title_unsubscribe'),
                        subtitle: subscribed,
                        unsubscribe: true
                    })

                    data.translations.voices = data.translations.voices.filter((voice)=> voice !== subscribed)
                }

                data.translations.voices.forEach((voice)=>{
                    items.push({
                        title: voice,
                        voice: voice,
                        ghost: true,
                        episode: 1
                    })
                })

                if(items.length){
                    Select.show({
                        title: Lang.translate('title_subscribe'),
                        items: items,
                        onSelect: (a)=>{
                            this.toggle()

                            if(a.unsubscribe){
                                Api.load('card/unsubscribe', {}, {
                                    id: this.card.id
                                }).then(()=>{
                                    button.removeClass('active').data('voice','').find('path').eq(1).attr('fill', 'transparent')
                                }).catch((e)=>{
                                    Noty.show(Lang.translate('subscribe_error'))
                                })
                            }
                            else{
                                Account.Api.subscribeToTranslation({
                                    card: this.card,
                                    season: Utils.countSeasons(this.card),
                                    episode: a.episode,
                                    voice: a.voice
                                },()=>{
                                    Bell.push({
                                        text: Lang.translate('subscribe_success')
                                    })

                                    button.addClass('active').data('voice',a.voice).find('path').attr('fill', 'currentColor')
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_error'))
                                })
                            }
                        },
                        onFullDraw: (scroll)=>{
                            scroll.body(true).prepend(Template.elem('div', {class: 'selectbox__text', children: [
                                Template.elem('div', {text: Lang.translate('subscribe_info')})
                            ]}))
                        },
                        onBack: ()=>{
                            Controller.toggle('content')
                        }
                    })
                }
                else Noty.show(Lang.translate('subscribe_noinfo'))
            }).catch((e)=>{}).finally(()=>{
                button.removeClass('loading')
            })
        })
    }
}