import Storage from '../../../core/storage/storage'
import Activity from '../../activity/activity'
import Empty from '../empty'
import Lang from '../../../core/lang'

class Module{
    onEmpty(){
        let params = this.params.empty || {}
            params.buttons = params.buttons || []

        if(this.object.source == 'tmdb' && params.cub_button){
            params.buttons.push({
                title: Lang.translate('change_source_on_cub'),
                onEnter: ()=>{
                    Storage.set('source','cub')

                    Activity.replace({source: 'cub'})
                }
            })
        }

        this.empty_class = new Empty(params)

        if(params.info_button) this.empty_class.addInfoButton(params.info_button)

        this.scroll.append(this.empty_class.render(true))

        this.start = this.empty_class.start.bind(this.empty_class)
    }
}

export default Module