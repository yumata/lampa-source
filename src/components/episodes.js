import Controller from '../interaction/controller'
import Lang from '../utils/lang'
import Api from '../interaction/api'
import Utils from '../utils/math'
import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import Season from '../interaction/season'
import Episode from '../interaction/episode/full'
import Select from '../interaction/select'
import EpisodeModule from '../interaction/episode/module/module'

function choiceSeason(){
    let total  = Utils.countSeasons(this.object.movie)
    let select = []

    for(let i = total; i > 0; i--){
        select.push({
            title: Lang.translate('torrent_serial_season') + ' ' + i,
            season: i
        })
    }

    Select.show({
        title: 'Выбрать сезон',
        items: select,
        onSelect: (a)=>{
            Controller.toggle('content')

            Activity.replace({
                season: a.season,
            })
        },
        onBack: ()=>{
            Controller.toggle('content')
        }
    })
}

/**
 * Компонент "Сезоны сериала"
 * @param {*} object 
 */
function component(object){
    let comp = Utils.createInstance(Category, object, {
        module: CategoryModule.toggle(CategoryModule.MASK.base, 'Explorer'),
    })

    comp.use({
        onCreate: function(){
            // Background.immediately(Utils.cardImgBackgroundBlur(object.card))

            let season = object.season || Utils.countSeasons(object.card)

            Api.seasons(object.card, [season],(v)=>{
                if(v[season] && v[season].episodes && v[season].episodes.length){
                    let results = [
                        {
                            params: {
                                createInstance: ()=>{
                                    return new Season(v[season])
                                },
                                emit: {
                                    onEnter: choiceSeason.bind(this)
                                }
                            }
                        }
                    ]

                    v[season].episodes.forEach(episode => {
                        episode.params = {
                            createInstance: ()=>{
                                return new Episode(episode)
                            },
                            module: EpisodeModule.toggle(EpisodeModule.MASK.base, 'Line')
                        }

                        results.push(episode)
                    })

                    this.build({results})
                }
                else{
                    this.empty()
                }
            })
        },
        onBuild: function(){
            this.body.removeClass('category-full').addClass('explorer-list')
        }
    })

    return comp
}

export default component