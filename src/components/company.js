import Api from '../interaction/api'
import Main from '../interaction/items/main'
import Background from '../interaction/background'
import Utils from '../utils/math'
import Router from '../core/router'

function component(object){
    let comp = Utils.createInstance(Main, object)

    comp.use({
        onCreate: function(){
            Api.company(object, (data)=>{
                object.company = data.company

                this.build(data.lines)
            }, this.empty.bind(this))
        },
        onInstance: function(item){
            item.use({
                onMore: Router.call.bind(Router, 'category_full', data, {companies: object.company.id, sort_by: 'vote_count.desc'}),
                onInstance: function(card, data){
                    card.use({
                        onEnter: Router.call.bind(Router, 'full', data),
                        onFocus: function(){
                            Background.change(Utils.cardImgBackground(data))
                        }
                    })
                }
            })
        }
    })

    return comp
}

export default component