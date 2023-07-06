function parse(data){
    let result = {
        hash_string: '',
        season: data.movie.number_of_seasons ? 1 : 0,
        episode: 0,
        serial: !!data.movie.number_of_seasons
    }

    let regexps = [
        [/s([0-9]+)\.?ep?([0-9]+)/i,'season', 'episode'],
        [/s([0-9]{2})([0-9]+)/i, 'season', 'episode'],
        [/s([0-9]+)/i, 'season'],
        [/[ |\[(]([0-9]{1,2})x([0-9]+)/i, 'season', 'episode'],
        [/[ |\[(]([0-9]{1,3}) of ([0-9]+)/i, 'season', 'episode'],
        [/ep([0-9]+)/i, 'episode'],
        [/ep\.([0-9]+)/i, 'episode'],
        [/ - ([0-9]+)/i, 'episode'],
        [/\[([0-9]+)]/i, 'episode'],
    ]

    regexps.forEach(regexp=>{
        let match = data.path.split('/').pop().match(regexp[0])

        if(match){
            let arr = regexp.slice(1)

            arr.forEach((a,i)=>{
                let v = match[i + 1]

                if(v) result[a] = parseInt(v)
            })
        }
    })

    if(result.episode == 0){
        let ep = parseInt(data.filename.trim().slice(0,3).replace(/[a-z]/gi,''))

        if(!isNaN(ep)) result.episode = ep
    }

    if (!data.is_file) {
        if (data.movie.number_of_seasons) {
            result.hash_string = [result.season, result.episode, data.movie.original_title].join('')
        } else if (data.movie.original_title && !result.serial) {
            result.hash_string = data.movie.original_title
        } else {
            result.hash_string = data.path
        }
    } else {
        result.hash_string = data.path
    }

    return result
}


export default {
    parse
}