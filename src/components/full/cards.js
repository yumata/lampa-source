import Utils from '../../utils/math'
import Line from '../../interaction/items/line/full'
import LineModule from '../../interaction/items/line/module/module'
import Router from '../../core/router'


function Cards(data){
    let comp = Utils.createInstance(Line, data, {
        module: LineModule.toggle(LineModule.MASK.base, 'More'),
    })

    comp.use({
        onInstance: function(item, data){
            item.use({
                onEnter: Router.call.bind(Router, 'full', data)
            })
        }
    })

    return comp
}

export default Cards