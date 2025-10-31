import Utils from '../../utils/utils'
import Manifest from '../../core/manifest'
import Storage from '../../core/storage/storage'
import Platform from '../../core/platform'
import Timer from '../../core/timer'
import Metric from '../../services/metric'
import Arrays from '../../utils/arrays'

let played = {
    time: 0,
    prerolls: [],
    user: {}
}

let data_loaded = {
    ad: []
}

function init(){
    load()

    Timer.add(1000 * 60 * 10, load)
}

function load(){
    let pos = 1

    let request = ()=>{
        let domain = Manifest.soc_mirrors[pos]

        if(domain){
            $.ajax({
                url: Utils.protocol() + domain+'/api/ad/vast',
                type: 'GET',
                dataType: 'json',
                timeout: 10000,
                success: (data)=>{
                    if(data.ad && Arrays.isArray(data.ad)){
                        data_loaded.ad = data.ad

                        console.log('Ad','vast prerolls loaded', data_loaded.ad.length)
                    }
                    else{
                        console.log('Ad','wrong vast prerolls format from', domain)

                        pos++

                        request()
                    }
                },
                error: ()=>{
                    console.log('Ad','no load vast prerolls from', domain)

                    pos++

                    request()
                }
            })
        }
    }

    request()
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function whitoutGenres(whitout_genre){
    let movie        = Storage.get('activity', '{}').movie
    let movie_genres = []

    try{
        movie_genres = movie.genres.map(g=>g.id)

        let genres = whitout_genre.split(',').map(g=>parseInt(g))

        if(genres.length && movie.genres.find(g=>genres.find(gg=>gg == g.id))){
            return true
        }
    }
    catch(e){}
}

function pickTag(tags) {
    let total = tags.reduce((sum, t) => sum + t.impressions, 0)
    let rand  = Math.random() * total
    let acc   = 0
    let tag

    for (let i = 0; i < tags.length; i++) {
        tag = tags[i]

        acc += tag.impressions

        if (rand < acc) return tag
    }

    return tag
}

function orderTag(tags) {
    tags.sort((a, b) => b.impressions - a.impressions)

    return tags[0]
}

function filter(view, player_data){
    if(played.prerolls.length >= view.length) played.prerolls = []

    view = view.filter(v=>!played.prerolls.find(pr=>pr == v.name))

    if(!window.lampa_settings.developer.ads){
        view = view.filter(v=>whitoutGenres(v.whitout_genre) !== true)
        view = view.filter(v=>v.screen == (Platform.screen('tv') ? 'tv' : 'mobile') || v.screen == 'all')
        view = view.filter(v=>v.platforms.indexOf(Platform.get()) !== -1 || v.platforms.indexOf('all') !== -1 || !v.platforms.length)
        view = view.filter(v=>v.region.split(',').indexOf(player_data.ad_region) !== -1 || v.region.indexOf('all') !== -1 || !v.region.length)
    }

    console.log('Ad', 'filter view ', view)

    if(view.length){
        let preroll = orderTag(view)

        played.prerolls.push(preroll.name)

        return preroll
    }
    
    return null
}

function get(player_data){
    let preroll = data_loaded.ad.length ? filter(data_loaded.ad, player_data) : null

    Metric.counter('ad_manager_get', data_loaded.ad.length ? 1 : 0, preroll ? 'show' : 'none', player_data.ad_region)

    if(preroll){
        played.user[preroll.name]++

        return preroll
    }

    return null
}

export default {
    init,
    get
}