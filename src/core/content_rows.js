import Arrays from '../utils/arrays'
import Settings from '../interaction/settings/api'
import Storage from '../core/storage/storage'
import Lang from '../core/lang'

let rows = []
let component = 'content_rows'

function init(){
    Settings.addComponent({
        component,
        after: 'interface',
        icon: `<svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="12.3496" width="35.501" height="13.8008" rx="4.5" stroke="white" stroke-width="3"/>
            <rect x="6.82227" width="25.3564" height="3.87305" rx="1.93652" fill="white"/>
            <rect x="6.82227" y="34.6274" width="25.3564" height="3.87305" rx="1.93652" fill="white"/>
        </svg>`,
        name: Lang.translate('title_channels'),
    })

    Lampa.Settings.listener.follow('open', (e) => {
        if (e.name == 'main') settings()
    })
}

function settings(){
    Settings.removeParams(component)

    rows.filter(r => r.name).forEach(row=>{
        let name = component + '_' + (row.name || 'unknown')

        Settings.addParam({
            component,
            param: {
                name: name,
                type: 'trigger',
                default: true
            },
            field: {
                name: row.title || Lang.translate('extensions_no_name'),
            }
        })
    })
}

function add(row){
    if(typeof row == 'object' && typeof row.call == 'function'){
        if(rows.indexOf(row) == -1){
            rows.push(row)

            if(!row.name || !row.title){
                console.warn('Content row must have name and title', row)
            }
        }
    }
    else {
        console.warn('Content row must be an object with a call function', row)
    }
}

function remove(row){
    let index = rows.indexOf(row)

    if(index > -1){
        rows.splice(index, 1)
    }
}

function call(screen, params, calls){
    let stop = ['genres', 'keywords']

    if(stop.find(a=>params[a])) return

    rows.filter(row=>{
        return row.screen ? (Arrays.isArray(row.screen) ? row.screen.indexOf(screen) >= 0 : row.screen == screen) : false
    }).filter(row=>{
        return Storage.get(component + '_' + (row.name || 'unknown'), 'true')
    }).forEach((row)=>{
        let result = row.call(params, screen)

        if(Arrays.isArray(result)){
            result.forEach((callback, i)=>{
                if(typeof callback == 'function'){
                    Arrays.insert(calls, (row.index || 0) + i, callback)
                }
                else if(Arrays.isObject(callback)){
                    Arrays.insert(calls, (row.index || 0) + i, callback)
                }
            })
        }
        else if(Arrays.isObject(result)){
            Arrays.insert(calls, row.index || 0, result)
        }
        else if(typeof result == 'function'){
            Arrays.insert(calls, row.index || 0, result)
        }
    })
}

export default {
    init,
    add,
    remove,
    call
}