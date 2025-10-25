import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Utils from '../../../utils/utils'
import Lang from '../../../core/lang'
import Noty from '../../../interaction/noty'
import Account from '../../../core/account/account'
import Loading from '../../../interaction/loading'
import Template from '../../../interaction/template'

export default {
    onCreate: function(){
        if(window.lampa_settings.disable_features.subscribe) return
        
        let button = this.html.find('.button--subscribe')
        
        button.on('hover:enter',()=>{
            Loading.start(()=>{
                this.event.cancel('translations')

                Loading.stop()
            })

            this.event.call('translations',{
                card_id: this.card.id,
                imdb_id: this.card.imdb_id,
                season: Utils.countSeasons(this.card)
            },(result)=>{
                Loading.stop()
                
                if(!result.result){
                    result.result = {
                        voice: {},
                        subscribe: ''
                    }
                }

                let items = []
                let subscribed = result.result.subscribe || button.data('voice')

                if(subscribed){
                    items.push({
                        title: Lang.translate('title_unsubscribe'),
                        subtitle: subscribed,
                        unsubscribe: true
                    })
                }

                for(let voice in result.result.voice){
                    items.push({
                        title: voice,
                        voice: voice,
                        ghost: voice !== result.result.subscribe,
                        episode: result.result.voice[voice]
                    })
                }

                if(items.length){
                    Select.show({
                        title: Lang.translate('title_subscribe'),
                        items: items,
                        onSelect: (a)=>{
                            this.toggle()

                            if(a.unsubscribe){
                                this.event.call('unsubscribe',{
                                    card_id: this.card.id
                                },(result)=>{
                                    if(result.result){
                                        button.removeClass('active').data('voice','').find('path').attr('fill', 'transparent')
                                    }
                                })
                            }
                            else if(Account.Permit.access){
                                Account.Api.subscribeToTranslation({
                                    card: this.card,
                                    season: Utils.countSeasons(this.card),
                                    episode: a.episode,
                                    voice: a.voice
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_success'))

                                    button.addClass('active').data('voice',a.voice).find('path').attr('fill', 'currentColor')
                                },()=>{
                                    Noty.show(Lang.translate('subscribe_error'))
                                })
                            }
                            else{
                                Account.Modal.account()
                            }
                        },
                        onFullDraw: (scroll)=>{
                            scroll.body(true).prepend(Template.elem('div', {class: 'selectbox-item', children: [
                                Template.elem('div', {class: 'selectbox-item__title', text: Lang.translate('subscribe_info')})
                            ]}))
                        },
                        onBack: ()=>{
                            Controller.toggle('content')
                        }
                    })
                }
                else Noty.show(Lang.translate('subscribe_noinfo'))
                
            })
        })
    }
}