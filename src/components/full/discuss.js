import Utils from '../../utils/utils'
import Discuss from '../../interaction/discuss/discuss'
import DiscussModule from '../../interaction/discuss/module/module'
import Line from '../../interaction/items/line/line'
import LineModule from '../../interaction/items/line/module/module'
import Arrays from '../../utils/arrays'
import Router from '../../core/router'

function Discussions(data){
    data.total_pages = 3

    Utils.extendItemsParams(data.results, {
        module: DiscussModule.only('Line', 'Read'),
        createInstance: (item)=>new Discuss(item)
    })

    Arrays.insert(data.results, 0, {
        params: {
            module: DiscussModule.only('Add'),
            createInstance: (item)=>new Discuss(item)
        }
    })

    let comp = Utils.createInstance(Line, data, {
        module: LineModule.only('Items', 'Create', 'More')
    })

    comp.use({
        onMore: Router.call.bind(Router, 'discuss', data.movie),
    })

    return comp
}

export default Discussions