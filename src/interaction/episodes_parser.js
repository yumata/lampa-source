// import Utils from "../utils/math.js";

function parse(data){
    let result = {
        hash_string: '',
        season: data.movie.number_of_seasons ? 1 : 0,
        episode: 0,
        serial: !!data.movie.number_of_seasons
    }

    const regexps = [
        /s(?<season>[0-9]+)\.?ep?(?<episode>[0-9]+)/i,
        /s(?<season>[0-9]{2})(?<episode>[0-9]+)/i,
        /s(?<season>[0-9]+)/i,
        /[ |\[(](?<season>[0-9]{1,2})x(?<episode>[0-9]+)/i,
        /[ |\[(](?<season>[0-9]{1,3}) of (?<episode>[0-9]+)/i,
        /ep(?<episode>[0-9]+)/i,
        /ep\.(?<episode>[0-9]+)/i,
        / - (?<episode>[0-9]+)/i,
        /\[(?<episode>[0-9]+)]/i,

    ]

    let match = undefined

    regexps.find((regexp)=> {
        match = data.path.split('/').pop().match(regexp)
        return match !== null
    })

    if (match && match.groups && match.groups.season)
        result.season  = parseInt(match.groups.season)

    if (match && match.groups && match.groups.episode) {
        if (data.movie.number_of_seasons && result.season === 0)
            result.season = 1;
        result.episode = parseInt(match.groups.episode)
    }

    if(result.episode == 0){
        let ep = parseInt(data.filename.slice(0,3))

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


// function patern(files, compare){
//     let dif = ''
//     let fin = files.find(f=>f.path == compare)
//     let inx = files.indexOf(fin)
//     let one = files[Math.max(0, inx - 1)].path

//     one.split('').forEach((k, i) => {
//         let w = compare[i]

//         if(w){
//             if(w !== k) dif += w
//         }
//     })

//     if(!dif) dif = '0'

//     if(dif.length >= 3) return 0

//     console.log({
//         one,
//         dif,
//         compare
//     })

//     let num = parseInt(dif)

//     if(isNaN(num)) num = 0

//     return num
// }

export default {
    parse,
    //patern
}