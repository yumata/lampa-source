import Utils from '../../utils/math'
import Line from '../../interaction/items/line/line'
import LineModule from '../../interaction/items/line/module/module'
import Episode from '../../interaction/episode/episode'
import EpisodeModule from '../../interaction/episode/module/module'
import Router from '../../core/router'


function Episodes(data){
    Utils.extendItemsParams(data.results, {
        module: EpisodeModule.only('Small', 'Mark' ,'Callback'),
        createInstance: (item)=>new Episode(item)
    })

    data.results.reverse()

    data.results.filter(e=>e.comeing).forEach(e=>{
        e.params.module = EpisodeModule.only('SmallNext')
    })

    let comp = Utils.createInstance(Line, data, {
        module: LineModule.only('Items', 'Create', 'MoreFirst')
    })

    comp.use({
        onMore: Router.call.bind(Router, 'episodes', data.movie)
    })

    return comp
}

export default Episodes