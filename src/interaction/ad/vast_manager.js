import Utils from '../../utils/math'
import Manifest from '../../utils/manifest'
import DB from '../../utils/db'
import Storage from '../../utils/storage'
import Platform from '../../utils/platform'
import Metric from '../../utils/other/metric'

let db
let waited = 0

let played = {
    time: 0,
    prerolls: [],
    user: {}
}

let data_loaded = {
    ad: [],
    day_of_month: 1,
    days_in_month: 31,
    month: 0,
}

function init(){
    db = new DB('advast', ['data'], 1)
    db.openDatabase().catch(()=>console.log('Ad','error','no open database')).finally(load)

    setInterval(load, 1000*60*10)
}

function load(){
    let domain = Manifest.cub_domain

    $.ajax({
        url: Utils.protocol() + domain+'/api/ad/vast',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: (data)=>{
            data_loaded = data

            if(db.db){
                db.getDataAnyCase('data', 'month').then((month)=>{
                    if(month !== data_loaded.month){
                        db.rewriteData('data', 'user', {}).catch(()=>{}).finally(prepareUser)

                        db.rewriteData('data', 'month', data_loaded.month).catch(()=>{})
                    }
                    else prepareUser()
                })
            }
            else{
                prepareUser()
            }
        },
        error: ()=>{
            console.log('Ad','error','no load vast prerolls')
        }
    })
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

function prepareUser(){
    db.getDataAnyCase('data', 'user').then((user)=>{
        if(!user) user = {}
        
        console.log('Ad','user view',user)

        data_loaded.ad.forEach(p=>{
            if(!user[p.name]) user[p.name] = 0
        })

        played.user = user
    }).catch(()=>{
        data_loaded.ad.forEach(p=>{
            if(!played.user[p.name]) played.user[p.name] = 0
        })
    })
}

function filter(view, player_data){
    if(played.time < Date.now() - waited){
        played.prerolls = []
        played.time     = Date.now()
    }

    view = view.filter(v=>whitoutGenres(v.whitout_genre) !== true)
    view = view.filter(v=>v.screen == (Platform.screen('tv') ? 'tv' : 'mobile') || v.screen == 'all')
    view = view.filter(v=>!played.prerolls.find(pr=>pr == v.name))
    view = view.filter(v=>v.platforms.indexOf(Platform.get()) !== -1 || v.platforms.indexOf('all') !== -1 || !v.platforms.length)
    view = view.filter(v=>v.region.split(',').indexOf(player_data.ad_region) !== -1 || v.region.indexOf('all') !== -1 || !v.region.length)

    console.log('Ad', 'need view ', view)

    if(view.length){
        let preroll = view.length == 1 ? view[0] : view[random(0, view.length - 1)]

        played.prerolls.push(preroll.name)

        waited = 1000 * 60 * random(30, 80)

        return preroll
    }
    
    return null
}

function get(player_data){
    if(data_loaded.ad.length){
        let view = data_loaded.ad.filter(p=>{
            let need = Math.floor((data_loaded.day_of_month / data_loaded.days_in_month) * p.impressions)

            return need - played.user[p.name] > 0
        })

        let view_len = view.length
        let preroll  = filter(view, player_data)

        Metric.counter('ad_manager_get', view_len ? 1 : 0, preroll ? 'show' : 'none', player_data.ad_region)

        if(preroll){
            played.user[preroll.name]++

            db.rewriteData('data', 'user', played.user).catch(()=>{})

            return preroll
        }
    }

    return null
}

export default {
    init,
    get
}