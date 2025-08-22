import Arrays from '../../utils/arrays'
import CardClass from './card'
import Lang from '../../utils/lang'

class Watched{
    constructor(params = {}){
        let n = Math.floor(Math.random() * 5) + 1
        
        Arrays.extend(params,{
            title: params.card.title || params.card.name,
            subtitle: Lang.translate('title_notice'),
            poster: params.card.poster_path,
            text: Lang.translate('ad_notice_'+params.type+'_text_'+n)
        })

        this.card = new CardClass(params)

        this.card.create()
    }

    destroy(){
        this.card.destroy()
    }

    render(js){
        return this.card.render(js)
    }
}

export default Watched