function languageCode(value){
    return String(value || '').toLowerCase().split(/[-_]/)[0]
}

function selectLogo(logos, language){
    if(!Array.isArray(logos) || !logos.length) return false

    let preferred = languageCode(language)
    let ordered = [preferred, 'en', null].filter((code, index, list)=>code !== '' && list.indexOf(code) === index)

    for(let i = 0; i < ordered.length; i++){
        let code = ordered[i]
        let logo = logos.find(item => code === null ? !item.iso_639_1 : languageCode(item.iso_639_1) === code)

        if(logo && logo.file_path) return logo
    }

    return logos.find(item => item.file_path) || false
}

export {
    languageCode,
    selectLogo
}
