import Arrays from './arrays'

function Progress(need){
    let works  = []
    let result = []
    let loaded = 0

    this.append = function(call){
        if(Arrays.isArray(call)) works = works.concat(call)
        else if(typeof call == 'function') works.push(call)
    }

    this.start = function(complite){
        works.forEach((fun,i)=>{
            fun((data)=>{
                result[i] = data

                loaded++

                if(loaded == works.length) complite(result)
            })
        })
    }
}

export default Progress