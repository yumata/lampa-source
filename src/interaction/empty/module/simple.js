import Storage from '../../../utils/storage'
import Activity from '../../activity'
import Empty from '../base'
import Lang from '../../../utils/lang'

class Module{
    onEmpty(){
        let button

        if(this.object.source == 'tmdb'){
            button = $('<div class="empty__footer"><div class="simple-button selector">'+Lang.translate('change_source_on_cub')+'</div></div>')

            button.find('.selector').on('hover:enter',()=>{
                Storage.set('source','cub')

                Activity.replace({source: 'cub'})
            })
        }

        this.empty = new Empty()

        if(button) empty.append(button)

        this.empty.addInfoButton()

        this.scroll.append(this.empty.render(true))

        this.start = this.empty.start.bind(this.empty)
    }
}

export default Module