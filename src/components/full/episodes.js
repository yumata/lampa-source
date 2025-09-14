import Utils from '../../utils/utils'
import Line from '../../interaction/items/line/line'
import LineModule from '../../interaction/items/line/module/module'
import Episode from '../../interaction/episode/episode'
import EpisodeModule from '../../interaction/episode/module/module'
import Router from '../../core/router'
import Lang from '../../core/lang'


function Episodes(data){
    Utils.extendItemsParams(data.results, {
        module: EpisodeModule.only('Small', 'Mark' ,'Callback'),
        createInstance: (item)=>new Episode(item)
    })

    data.results.reverse()

    data.results.filter(e=>e.comeing).forEach(e=>{
        e.params.module = EpisodeModule.only('SmallNext')
    })

    console.log(data)

    if(!data.results.length){
        data.results.push({
            episode_number: 1,
            season_number: data.movie.number_of_seasons || 1,
            air_date: '',
            name: Lang.translate('title_anons'),
            comeing: true,
            params: {
                module: EpisodeModule.only('SmallNext'),
                createInstance: (item)=>new Episode(item)
            }
        })
    }

    let comp = Utils.createInstance(Line, data, {
        module: LineModule.only('Items', 'Create', 'MoreFirst')
    })

    comp.use({
        onMore: Router.call.bind(Router, 'episodes', data.movie)
    })

    return comp
}

export default Episodes