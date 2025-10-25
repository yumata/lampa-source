import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Activity from '../../../interaction/activity/activity'
import Lang from '../../../core/lang'

export default {
    onCreate: function(){
        this.html.find('.button--options').on('hover:enter',()=>{
            let options = []

            Lampa.Listener.send('full', {
                link: this,
                type:'options',
                props: this.props,
                options
            })

            if(!window.lampa_settings.disable_features.ai){
                if(options.length){
                    options.push({
                        title: Lang.translate('title_ai_assistant'),
                        separator: true,
                    })
                }

                options.push({
                    title: Lang.translate('title_recomendations'),
                    onSelect: ()=>{
                        Controller.toggle('content')

                        Activity.push({
                            url: '',
                            title: Lang.translate('title_recomendations'),
                            component: 'ai_recommendations',
                            card: this.card
                        })
                    }
                })

                options.push({
                    title: Lang.translate('title_facts'),
                    onSelect: ()=>{
                        Controller.toggle('content')

                        Activity.push({
                            url: '',
                            title: Lang.translate('title_facts'),
                            component: 'ai_facts',
                            card: this.card
                        })
                    }
                })
            }

            Select.show({
                title: Lang.translate('more'),
                items: options,
                onSelect: ()=>{
                    Controller.toggle('content')
                },
                onBack: ()=>{
                    Controller.toggle('content')
                }
            })
        })
    }
}