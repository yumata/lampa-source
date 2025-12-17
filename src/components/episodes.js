import Controller from '../core/controller'
import Lang from '../core/lang'
import Api from '../core/api/api'
import Utils from '../utils/utils'
import Background from '../interaction/background'
import Activity from '../interaction/activity/activity'
import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import Season from '../interaction/season/season'
import SeasonModule from '../interaction/season/module/module'
import Episode from '../interaction/episode/episode'
import Select from '../interaction/select'
import EpisodeModule from '../interaction/episode/module/module'
import Arrays from '../utils/arrays'

function choiceSeason(){
    let total  = this.object.seasons_count || Utils.countSeasons(this.object.card)
    let select = []

    for(let i = total; i > 0; i--){
        select.push({
            title: Lang.translate('torrent_serial_season') + ' ' + i,
            season: i,
            selected: (this.object.season || Utils.countSeasons(this.object.card)) == i
        })
    }

    Select.show({
        title: Lang.translate('torrent_serial_season'),
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
        items: {
            mapping: 'list'
        }
    })

    comp.use({
        onCreate: function(){
            let season = object.season || Utils.countSeasons(object.card)

            Api.seasons(object.card, [season],(v)=>{
                if(v[season] && v[season].episodes){
                    object.seasons_count = v[season].seasons_count || Utils.countSeasons(object.card)

                    Arrays.extend(v[season], {
                        params: {
                            createInstance: (item)=> {
                                return new Season(item)
                            },
                            module: SeasonModule.only('Line', 'Callback'),
                            emit: {
                                onEnter: choiceSeason.bind(this)
                            }
                        }
                    })
                    
                    let results = [v[season]]

                    v[season].episodes.forEach(episode => {
                        // Передаем название сериала для таймкода
                        episode.original_name = object.card.original_name

                        episode.params = {
                            createInstance: ()=> new Episode(episode),
                            module: EpisodeModule.toggle(EpisodeModule.MASK.base, 'Line')
                        }

                        results.push(episode)
                    })

                    if(!v[season].episodes.length){
                        Arrays.insert(results, 1, {
                            episode_number: 1,
                            season_number: season,
                            air_date: '',
                            name: Lang.translate('title_anons'),
                            comeing: true,
                            params: {
                                createInstance: (item)=> new Episode(item),
                                module: EpisodeModule.only('Line'),
                            }
                        })
                    }

                    this.build({results})
                }
                else{
                    this.empty()
                }
            })
        },
        onController: function(){
            Background.immediately(Utils.cardImgBackgroundBlur(object.card))
        }
    })

    return comp
}

export default component