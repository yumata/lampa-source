import Api from '../interaction/api'
import Main from '../interaction/items/main'
import Activity from '../interaction/activity'
import Background from '../interaction/background'
import Utils from '../utils/math'

function component(object){
    let comp = new Main(object)

    comp.use({
        onCreate: function(){
            Api.company(object, (data)=>{
                object.company = data.company

                this.build(data.lines)
            }, this.empty.bind(this))
        },
        onInstance: function(item){
            item.use({
                onMore: function(data){
                    Activity.push({
                        url: data.url,
                        title: data.title || Lang.translate('title_category'),
                        component: 'category_full',
                        page: 1,
                        companies: object.company.id,
                        sort_by: 'vote_count.desc'
                    })
                },
                onInstance: function(card, data){
                    card.use({
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
        }
    })

    return comp
}

export default component