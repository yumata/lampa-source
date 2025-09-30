import Template from '../../../template'
import Arrays from '../../../../utils/arrays'

export default {
    onCreate: function(){
        this.activity.loader(false)

        Arrays.extend(this.params, {
            loading: {
                icon: 'card'
            }
        })

        let tpl = Template.get('ai_search_animation',{
            icon: Template.string('icon_' + this.params.loading.icon)
        })

        this.loading = $('<div class="ai-box-scroll layer--wheight"></div>')

        this.loading.append(tpl)

        this.scroll.append(this.loading)
    },

    onBuild: function(){
        this.loading.remove()
    },

    onEmpty: function(){
        this.loading.remove()
    }
}