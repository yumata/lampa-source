import Template from '../../../template'

class Module{
    onCreate(){
        this.activity.loader(false)

        let ico = this.params.icon == 'text' ? 'text' : 'card'

        let tpl = Template.get('ai_search_animation',{
            icon: Template.string('icon_' + ico)
        })

        this.loading = $('<div class="ai-box-scroll layer--wheight"></div>')

        this.loading.append(tpl)

        this.scroll.append(this.loading)
    }

    onBuild(){
        this.loading.remove()
    }

    onEmpty(){
        this.loading.remove()
    }
}

export default Module