import Utils from '../../../utils/utils'
import Register from '../../../interaction/register/register'
import RegisterModule from '../../../interaction/register/module/module'
import Line from '../../../interaction/items/line/line'
import LineModule from '../../../interaction/items/line/module/module'
import Lang from '../../../core/lang'


function MetadataChart(data){
    let result = {
        title: Lang.translate('title_metadata'),
        results: []
    }

    let fields = [
        {
            name: 'humor',
            color: '#f7e74a'
        },
        {
            name: 'violence',
            color: '#f74a4a'
        },
        {
            name: 'fear',
            color: '#e2b2ff'
        },
        {
            name: 'tension',
            color: '#45c1ff'
        },
        {
            name: 'romance',
            color: '#f74aa3'
        },
        {
            name: 'sadness',
            color: '#f7a34a'
        },
        {
            name: 'pace',
            color: '#4af74a'
        },
        {
            name: 'importance',
            color: '#8ffff6'
        },
        {
            name: 'action',
            color: '#ff8124'
        },
        {
            name: 'sex',
            color: '#f74af7'
        },
        {
            name: 'profanity',
            color: '#ff6262'
        }
    ]

    let chart_data = data.metadata.review || []

    chart_data.forEach((meter)=>{
        let color = fields.find((f) => f.name == meter.name)?.color || '#fff'

        let chart = {
            bars: meter.values.map((v) => {
                return (v || 0) / 10 * 100
            }),
            threshold: 70,
            threshold_color: color
        }
        
        meter.title = Lang.translate('title_meta_' + meter.name)
        meter.limit = 10
        meter.count = meter.avg
        meter.icon  = '<svg style="color: ' + color + '"><use xlink:href="#sprite-meta-' + meter.name + '"></use></svg>'
        meter.chart = chart
    })

    result.results = chart_data

    Utils.extendItemsParams(result.results, {
        module: RegisterModule.toggle(RegisterModule.MASK.base, 'Line', 'Chart', 'Icon'),
        createInstance: (item)=>new Register(item)
    })

    let comp = Utils.createInstance(Line, result, {
        module: LineModule.only('Items', 'Create')
    })

    return comp
}

export default MetadataChart