import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Utils from '../../../utils/utils'
import Api from '../../../core/api/api'
import Storage from '../../../core/storage/storage'
import Lang from '../../../core/lang'
import Manifest from '../../../core/manifest'

export default {
    onCreate: function(){
        if(!Storage.field('card_interfice_reactions') || window.lampa_settings.disable_features.reactions) return this.html.find('.full-start-new__reactions, .button--reaction').remove()

        let reactions_data = this.data.reactions

        let vote = (type, add = false)=>{
            let mine = Storage.get('mine_reactions',{})
            let id   = (this.card.name ? 'tv' : 'movie') + '_' + this.card.id
    
            if(!mine[id]) mine[id] = []
    
            let ready = mine[id].indexOf(type) >= 0 
    
            if(add){
                if(!ready) mine[id].push(type)
    
                Storage.set('mine_reactions', mine)
            }
    
            return ready
        }
        
        let draw = ()=>{
            if(reactions_data && reactions_data.result && reactions_data.result.length){
                let reactions = reactions_data.result
                let reactions_body = this.html.find('.full-start-new__reactions')[0]

                reactions.sort((a,b)=>{
                    return a.counter > b.counter ? -1 : a.counter < b.counter ? 1 : 0
                })

                reactions_body.empty()

                reactions.forEach(r=>{
                    let reaction = document.createElement('div'),
                        icon     = document.createElement('img'),
                        count    = document.createElement('div'),
                        wrap     = document.createElement('div')

                    reaction.addClass('reaction')
                    icon.addClass('reaction__icon')
                    count.addClass('reaction__count')

                    reaction.addClass('reaction--' + r.type)

                    count.text(Utils.bigNumberToShort(r.counter))

                    icon.src = Utils.protocol() + Manifest.cub_domain + '/img/reactions/' + r.type + '.svg'

                    reaction.append(icon)
                    reaction.append(count)

                    wrap.append(reaction)

                    if(vote(r.type)) reaction.addClass('reaction--voted')

                    reactions_body.append(wrap)
                })
            }
        }

        let items = [
            {type: 'fire'},
            {type: 'nice'},
            {type: 'think'},
            {type: 'bore'},
            {type: 'shit'}
        ]

        items.forEach(a=>{
            a.template = 'selectbox_icon',
            a.icon     = '<img src="'+Utils.protocol() + Manifest.cub_domain + '/img/reactions/' + a.type + '.svg'+'" />'
            a.ghost    = vote(a.type)
            a.noenter  = a.ghost
            a.title    = Lang.translate('reactions_' + a.type)
        })

        this.html.find('.button--reaction').on('hover:enter',()=>{
            Select.show({
                title: Lang.translate('title_reactions'),
                items: items,
                onSelect: (a)=>{
                    Controller.toggle('content')

                    Api.sources.cub.reactionsAdd({
                        method: this.card.name ? 'tv' : 'movie',
                        id: this.card.id,
                        type: a.type
                    },()=>{
                        vote(a.type, true)

                        let find = reactions_data.result.find(r=>r.type == a.type)

                        if(find) find.counter++
                        else{
                            reactions_data.result.push({
                                type: a.type,
                                counter: 1
                            })
                        }

                        a.ghost   = true
                        a.noenter = true

                        draw()
                    },(e)=>{
                        Lampa.Noty.show(Lang.translate('reactions_ready'))
                    })
                },
                onBack: ()=>{
                    Controller.toggle('content')
                }
            })
        })

        draw()
    }
}