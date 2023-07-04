// import Utils from "../utils/math.js";

function parse(file_path, movie, is_file){
    let data = {
        hash_string: '',
        season: movie.number_of_seasons ? 1 : 0,
        episode: 0,
        serial: !!movie.number_of_seasons
    }

    const regexps = [
        /s(?<season>[0-9]+)\.?ep?(?<episode>[0-9]+)/i,
        /s(?<season>[0-9]{2})(?<episode>[0-9]+)/i,
        /[ |\[(](?<season>[0-9]{1,2})x(?<episode>[0-9]+)/i,
        /[ |\[(](?<season>[0-9]{1,3}) of (?<episode>[0-9]+)/i,
        /ep?(?<episode>[0-9]+)/i,
        / 0(?<episode>[0-9]+)/i,
        /\[(?<episode>[0-9]+)]/i,

    ]

    let match = undefined

    regexps.find((regexp)=> {
        match = file_path.match(regexp)
        return match !== null
    })

    if (match && match.groups && match.groups.season)
        data.season  = parseInt(match.groups.season)

    if (match && match.groups && match.groups.episode) {
        if (movie.number_of_seasons && data.season === 0)
            data.season = 1;
        data.episode = parseInt(match.groups.episode)
    }

    if (!is_file) {
        if (movie.number_of_seasons) {
            data.hash_string = [data.season, data.episode, movie.original_title].join('')
        } else if (movie.original_title && !data.serial) {
            data.hash_string = movie.original_title
        } else {
            data.hash_string = file_path
        }
    } else {
        data.hash_string = file_path
    }

    return data
}

export default {
    parse
}