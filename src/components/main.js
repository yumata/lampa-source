import Api from '../interaction/api'
import Main from '../interaction/items/main'
import Activity from '../interaction/activity'
import Background from '../interaction/background'
import Utils from '../utils/math'

/**
 * Компонент главной страницы
 * @param {object} object - Параметры компонента
 * @return {object} - Экземпляр компонента
 */
function component(object){
    let comp = new Main(object)
    let next = null

    comp.use({
        onCreate: function(){
            let nextCall = Api.main(object, this.build.bind(this), this.empty.bind(this))

            if(typeof nextCall == 'function') next = nextCall
        },
        onNext: function(resolve, reject){
            if(next){
                next(resolve.bind(this), reject.bind(this))
            }
            else reject.call(this)
        },
        onInstance: function(item){
            item.use({
                onMore: function(data){
                    Activity.push({
                        url: data.url,
                        title: data.title || Lang.translate('title_category'),
                        component: 'category_full',
                        page: 1,
                        genres: object.genres,
                        filter: data.filter,
                        source: data.source || object.source || 'tmdb',
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