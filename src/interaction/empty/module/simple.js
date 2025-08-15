import Storage from '../../../utils/storage'
import Activity from '../../activity'
import Empty from '../base'
import Lang from '../../../utils/lang'

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

        this.empty = new Empty(params)

        if(button) this.empty.append(button)

        if(params.info_button) this.empty.addInfoButton(params.info_button)

        this.scroll.append(this.empty.render(true))

        this.start = this.empty.start.bind(this.empty)
    }
}

export default Module