import Template from '../../template'
import VPN from '../../../core/vpn'
import Color from '../../../utils/color'
import Storage from '../../../core/storage/storage'

export default {
    onVisible: function(){
        let lgbt_block = Storage.field('lgbt_content_block') || VPN.code() == 'ru' || VPN.code() == 'by'
        let lgbt_key   = this.data.id + '_' + (this.data.first_air_date ? 'tv' : 'movie')
        let img        = this.html.find('.card__img')

        if(img && lgbt_block && window.lampa_settings.lgbt && window.lampa_settings.lgbt[lgbt_key]){
            let pattern = Color.circlePattern(20)

            let layer = Template.elem('div', {class: 'card__filter'})
                layer.style.backgroundImage = 'url(' + pattern + ')'

            img.after(layer)
        }
    }
}