import Utils from '../../../utils/utils'
import Register from '../../../interaction/register/register'
import RegisterModule from '../../../interaction/register/module/module'
import Line from '../../../interaction/items/line/line'
import LineModule from '../../../interaction/items/line/module/module'
import Lang from '../../../core/lang'


function MetadataTags(data){
    let meter = {
        title: Lang.translate('title_moods'),
        results: [],
        params: {
            items: {
                view: 10
            }
        }
    }

    let chart_data = data.metadata.moods || []

    chart_data.slice(0,10).forEach((key)=>{
        meter.results.push({
            title:  Utils.capitalizeFirstLetter(key.name),
            count: key.percent + '%'
        })
    })

    Utils.extendItemsParams(meter.results, {
        module: RegisterModule.toggle(RegisterModule.MASK.base, 'Line', 'Tag'),
        createInstance: (item)=>new Register(item)
    })

    let comp = Utils.createInstance(Line, meter, {
        module: LineModule.only('Items', 'Create')
    })

    return comp
}

export default MetadataTags