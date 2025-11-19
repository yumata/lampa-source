import Arrays from '../utils/arrays'

let rows = []

function add(row){
    if(typeof row == 'object' && typeof row.call == 'function'){
        if(rows.indexOf(row) == -1){
            rows.push(row)
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
    add,
    remove,
    call
}