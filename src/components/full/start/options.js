import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Activity from '../../../interaction/activity/activity'
import Lang from '../../../core/lang'
import Account from '../../../core/account/account'

export default {
    onCreate: function(){
        if(!window.lampa_settings.disable_features.ai){
            this.html.find('.button--options').on('hover:enter',()=>{
                let items = []

                items.push({
                    title: Lang.translate('title_ai_assistant'),
                    separator: true,
                })

                items.push({
                    title: Lang.translate('title_recomendations'),
                    component: 'ai_recommendations',
                })

                items.push({
                    title: Lang.translate('title_facts'),
                    component: 'ai_facts',
                })

                Select.show({
                    title: Lang.translate('more'),
                    items: items,
                    onSelect: (a)=>{
                        Controller.toggle('full_start')

                        if(!Account.Permit.access) return Account.Advert.account()

                        Activity.push({
                            url: '',
                            title: a.title,
                            component: a.component,
                            card: this.card
                        })
                    },
                    onBack: ()=>{
                        Controller.toggle('full_start')
                    }
                })
            })
        }
        else{
            this.html.find('.button--options').remove()
        }
    }
}