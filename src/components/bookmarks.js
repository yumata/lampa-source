import Favorites from '../utils/favorite'
import Lang from '../utils/lang'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Template from '../interaction/template'

function component(object){
    let all      = Favorites.all()
    let comp     = new Lampa.InteractionMain(object)
    let viev_all = false

    comp.create = function(){
        this.activity.loader(true)

        let category = ['look', 'scheduled', 'book', 'like', 'wath', 'viewed', 'continued','thrown']
        let lines    = []
        
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

        if(lines.length){
            Arrays.insert(lines, 0, {
                title: '',
                results: []
            })

            comp.build(lines)
        }
        else comp.empty()

        return this.render()
    }

    comp.onAppend = function(line, elem){
        if(elem.results.length == 0){
            line.render(true).removeClass('items-line--type-cards').find('.items-line__head').addClass('hide')

            let body     = line.render(true).find('.scroll__body')
            let category = ['book','like','wath', 'look','viewed','scheduled','continued','thrown']

            category.forEach(a=>{
                let register = Template.js('register')
                    register.addClass('selector')

                    register.find('.register__name').text(Lang.translate('title_' + a))
                    register.find('.register__counter').text(all[a].length)

                    register.on('hover:enter',()=>{
                        Activity.push({
                            url: '',
                            title: Lang.translate('title_' + a),
                            component: 'favorite',
                            type: a,
                            page: 1
                        })
                    })

                    register.on('hover:focus',()=>{
                        line.render(true).find('.scroll').Scroll.update(register, true)
                    })

                body.append(register)
            })
        }
        else{
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