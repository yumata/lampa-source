import Category from '../interaction/items/category'
import Activity from '../interaction/activity'
import Background from '../interaction/background'
import Utils from '../utils/math'
import Account from '../utils/account'

function component(object){
    let comp = new Category(object)

    comp.use({
        onCreate: function(){
            Account.subscribes(object, this.build.bind(this), this.empty.bind(this))
        },
        onInstance: function(item, data){
            item.use({
                onEnter: function(){
                    Activity.push({
                        url: data.url,
                        component: 'full',
                        id: data.id,
                        method: data.name ? 'tv' : 'movie',
                        card: data,
                        source: data.source || object.source || 'tmdb',
                    })
                },
                onFocus: function(){
                    Background.change(Utils.cardImgBackground(data))
                }
            })
        }
    })

    return comp
}

export default component