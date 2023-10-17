function parse(data){
    let result = {
        hash_string: '',
        season: null,
        episode: null,
        serial: !!data.movie.number_of_seasons
    }

    let regexps = [
        [/\bs(\d+)\.?ep?(\d+)\b/i, 'season', 'episode'],
        [/\b(\d{1,2})[x\-](\d+)\b/i, 'season', 'episode'],
        [/\bs(\d{2})(\d{2,3})\b/i, 'season', 'episode'],
        [/season (\d+) episode (\d+)/i, 'season', 'episode'],
        [/сезон (\d+) серия (\d+)/i, 'season', 'episode'],
        [/(\d+) season (\d+) episode/i, 'season', 'episode'],
        [/(\d+) сезон (\d+) серия/i, 'season', 'episode'],
        [/episode (\d+)/i, 'episode'],
        [/серия (\d+)/i, 'episode'],
        [/(\d+) episode/i, 'episode'],
        [/(\d+) серия/i, 'episode'],
        [/season (\d+)/i, 'season'],
        [/сезон (\d+)/i, 'season'],
        [/(\d+) season/i, 'season'],
        [/(\d+) сезон/i, 'season'],
        [/\bs(\d+)\b/i, 'season'],
        [/\bep?\.?(\d+)\b/i, 'episode'],
        [/\b(\d{1,3}) of (\d+)/i, 'episode'],
        [/\b(\d{1,3}) из (\d+)/i, 'episode'],
        [/ - (\d{1,3})\b/i, 'episode'],
        [/\[(\d{1,3})\]/i, 'episode'],
    ]

    let folder_regexps = [
        [/season (\d+)/i, 'season'],
        [/сезон (\d+)/i, 'season'],
        [/(\d+) season/i, 'season'],
        [/(\d+) сезон/i, 'season'],
        [/\bs(\d+)\b/i, 'season'],
    ]

    let parts  = data.path.replace(/_/g, ' ').split('/')
    let fname  = parts.pop()
    let folder = parts.pop()

    regexps.forEach(regexp=>{
        let match = fname.match(regexp[0])

        if(match){
            let arr = regexp.slice(1)

            arr.forEach((a,i)=>{
                let v = match[i + 1]

                if(v && result[a] == null) result[a] = parseInt(v)
            })
        }
    })

    if(folder && result.season == null){
        folder_regexps.forEach(regexp=>{
            let match = folder.match(regexp[0])

            if(match){
                let arr = regexp.slice(1)

                arr.forEach((a,i)=>{
                    let v = match[i + 1]

                    if(v && result[a] == null) result[a] = parseInt(v)
                })
            }
        })
    }

    if(result.season == null) result.season = data.movie.number_of_seasons ? 1 : 0

    if(result.episode == null){
        let match = data.filename.replace(/_/g, ' ').trim().match(/^(\d{1,3})\b/i)

        result.episode = match ? parseInt(match[1]) : 0
    }

    if (!data.is_file) {
        if (data.movie.number_of_seasons) {
            result.hash_string = [result.season, result.season > 10 ? ':' : '', result.episode, data.movie.original_title].join('')
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