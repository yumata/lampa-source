import Utils from '../../utils/math'
import Manifest from '../../utils/manifest'
import DB from '../../utils/db'
import Storage from '../../utils/storage'
import Platform from '../../utils/platform'

let db
let waited = 0

let played = {
    time: 0,
    prerolls: []
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
                        db.rewriteData('data', 'user', {}).catch(()=>{})

                        db.rewriteData('data', 'month', data_loaded.month).catch(()=>{})
                    }
                })
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

function filter(view, player_data, resolve){
    if(played.time < Date.now() - waited){
        played.prerolls = []
        played.time     = Date.now()
    }

    view = view.filter(v=>whitoutGenres(v.whitout_genre) !== true)
    view = view.filter(v=>v.screen == (Platform.screen('tv') ? 'tv' : 'mobile') || v.screen == 'all')
    view = view.filter(v=>!played.prerolls.find(pr=>pr == v.name))
    view = view.filter(v=>v.platforms.indexOf(Platform.get()) !== -1 || v.platforms.indexOf('all') !== -1 || !v.platforms.length)

    if(!window.god_enabled) view = view.filter(v=>v.region.split(',').indexOf(player_data.ad_region) !== -1 || v.region.indexOf('all') !== -1 || !v.region.length)

    console.log('Ad', 'need view ', view)

    if(view.length){
        let preroll = view.length == 1 ? view[0] : view[random(0, view.length - 1)]

        played.prerolls.push(preroll.name)

        waited = 1000 * 60 * random(30, 80)

        resolve(preroll)
    }
    else resolve()
}

function get(player_data){
    return new Promise((resolve, reject)=>{
        if(data_loaded.ad.length){
            if(db.db){
                db.getDataAnyCase('data', 'user').then((user)=>{
                    if(!user) user = {}
                    
                    console.log('Ad','user view',user)

                    data_loaded.ad.forEach(p=>{
                        if(!user[p.name]) user[p.name] = 0
                    })

                    let view = data_loaded.ad.filter(p=>{
                        let need = Math.floor((data_loaded.day_of_month / data_loaded.days_in_month) * p.impressions)

                        return need - user[p.name] > 0
                    })

                    filter(view, player_data, (preroll)=>{
                        if(preroll){
                            user[preroll.name]++

                            db.rewriteData('data', 'user', user).catch(()=>{})
                        }

                        resolve(preroll)
                    })
                }).catch(()=>{
                    filter(data_loaded.ad, player_data, resolve)
                })
            }
            else{
                filter(data_loaded.ad, player_data, resolve)
            }
        }
        else resolve()
    })
}

export default {
    init,
    get
}