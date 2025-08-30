import Storage from '../../../core/storage/storage'
import Activity from '../../activity/activity'
import Empty from '../empty'
import Lang from '../../../core/lang'

class Module{
    onEmpty(){
        let button
        let params = this.params.empty || {}

        if(this.object.source == 'tmdb' && params.cub_button){
            button = $('<div class="empty__footer"><div class="simple-button selector">'+Lang.translate('change_source_on_cub')+'</div></div>')

            button.find('.selector').on('hover:enter',()=>{
                Storage.set('source','cub')

                Activity.replace({source: 'cub'})
            })
        }

        this.empty_class = new Empty(params)

        if(button) this.empty_class.append(button)

        if(params.info_button) this.empty_class.addInfoButton(params.info_button)

        this.scroll.append(this.empty_class.render(true))

        this.start = this.empty_class.start.bind(this.empty_class)
    }
}

export default Module