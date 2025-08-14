import Utils from '../../utils/math'
import Lang from '../../utils/lang'
import Activity from '../../interaction/activity'
import Line from '../../interaction/items/line/full'
import LineModule from '../../interaction/items/line/module/module'
import Episode from '../../interaction/episode/full'
import EpisodeModule from '../../interaction/episode/module/module'
import Router from '../../core/router'


function Episodes(){
    let comeout  = Activity.props().get('cameout')
    let episodes = Activity.props().get('episodes')
    let movie    = Activity.props().get('movie')

    comeout.forEach(item=>{
        item.params = {
            module: EpisodeModule.only('Small', 'Callback'),
            createInstance: ()=>{
                return new Episode(item)
            }
        }
    })

    comeout.reverse()

    let comp = Utils.createInstance(Line, {
        title: episodes.name || Lang.translate('full_series_release'),
        results: comeout
    }, {
        module: LineModule.only('Items', 'Create', 'MoreFirst'),
        MoreFirst: {
            style: 'episodes-small'
        }
    })

    comp.use({
        onCreate: function(){
            this.scroll.body(true).addClass('full-episodes')
        },
        onMore: Router.call.bind(Router, 'episodes', movie)
    })

    return comp
}

export default Episodes