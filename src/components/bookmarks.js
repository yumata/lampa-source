import Favorites from '../utils/favorite'
import Lang from '../utils/lang'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'

function component(object){
    let comp = new Lampa.InteractionMain(object)
    let viev_all = false

    comp.create = function(){
        this.activity.loader(true)

        let all      = Favorites.all()
        let lines    = []
        let category = ['look', 'scheduled', 'like', 'wath', 'book', 'viewed', 'thrown']

        category.forEach(a=>{
            if(all[a].length){
                let items = Arrays.clone(all[a].slice(0,20))

                items.forEach(a=>a.ready = false)

                lines.push({
                    title: Lang.translate('title_' + a),
                    results: items,
                    type: a
                })
            }
        })

        if(lines.length) comp.build(lines)
        else comp.empty()

        return this.render()
    }

    comp.onAppend = function(line){
        line.render(true).on('visible',()=>{
            let more = line.render(true).find('.items-line__more')

            if(more){
                more.text(Lang.translate('settings_param_card_view_all'))

                more.on('hover:enter',()=>{
                    viev_all = true
                })
            }
        })
    }

    comp.onMore = function(line){
        setTimeout(()=>{
            Activity.push({
                url: '',
                title: Lang.translate('title_' + line.type),
                component: 'favorite',
                type: line.type,
                page: viev_all ? 1 : 2
            })

            viev_all = false
        },50)
    }

    return comp
}

export default component