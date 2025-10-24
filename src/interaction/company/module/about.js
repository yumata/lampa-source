import Template from '../../template'
import Utils from '../../../utils/utils'
import TMDB from '../../../core/api/sources/tmdb'

export default {
    onCreate: function(){
        this.html = Template.js('company', {
            name: this.data.name,
            place: (this.data.headquarters ? this.data.headquarters + (this.data.origin_country ? ', ' : '') : '') + (this.data.origin_country ? this.data.origin_country : '')
        })

        Utils.imgLoad(this.html.find('img'), this.data.logo_path ? TMDB.img(this.data.logo_path, 'w500') : this.data.img || 'img/img_broken.svg', (img) => {
            img.addClass('loaded')
        })
    }
}