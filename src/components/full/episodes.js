import Utils from '../../utils/math'
import Line from '../../interaction/items/line/full'
import LineModule from '../../interaction/items/line/module/module'
import Episode from '../../interaction/episode/full'
import EpisodeModule from '../../interaction/episode/module/module'
import Router from '../../core/router'


function Episodes(data){
    Utils.extendItemsParams(data.results, {
        module: EpisodeModule.only('Small', 'Mark' ,'Callback'),
        createInstance: (item)=>new Episode(item)
    })

    data.results.reverse()

    let comp = Utils.createInstance(Line, data, {
        module: LineModule.only('Items', 'Create', 'MoreFirst'),
        more: {
            style: 'episodes-small'
        }
    })

    comp.use({
        onCreate: function(){
            this.scroll.body(true).addClass('full-episodes')
        },
        onMore: Router.call.bind(Router, 'episodes', data.movie)
    })

    return comp
}

export default Episodes