import Template from '../../template'
import Utils from '../../../utils/math'
import TMDB from '../../../utils/api/tmdb'

class Module{
    onCreate(){
        this.html = Template.js('company', {
            name: this.data.name,
            place: (this.data.headquarters ? this.data.headquarters + (this.data.origin_country ? ', ' : '') : '') + (this.data.origin_country ? this.data.origin_country : '')
        })

        Utils.imgLoad(this.html.find('img'), this.data.logo_path ? TMDB.img(this.data.logo_path, 'w500') : this.data.img || 'img/img_broken.svg', (img) => {
            img.addClass('loaded')
        })
    }
}

export default Module