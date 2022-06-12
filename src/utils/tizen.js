import Account from './account'
import TMDB from './api/tmdb'
import Status from './status'
import Favorite from './favorite'
import Activity from '../interaction/activity'

/*
let tizen = {
    ApplicationControlData: ()=>{},
    ApplicationControl: ()=>{},
    application:{
        launchAppControl: ()=>{}
    }
}
*/

/**
 * Запуск
 */
function init(){
    if(typeof tizen !== 'undefined'){
        setInterval(lauchPick, 1000*60*10)

        lauchPick()

        deepLink()

        window.addEventListener('appcontrol', deepLink)

        try{
            console.log('Tizen','current id', tizen.application.getCurrentApplication().appInfo.id)
        }
        catch(e){}
    }
}

/**
 * Установить данные
 * @param {{sections:[{title:string,position:integer,tiles:[{cardToTile}]}]}} data 
 */
function setPick(data){
    let service_id = '0SG81L944v.service'

    let controll_data  = new tizen.ApplicationControlData('caller', ['ForegroundApp',JSON.stringify(data)])
    let controll_app   = new tizen.ApplicationControl( 'http://tizen.org/appcontrol/operation/pick', null, 'image/*', null, [controll_data])

    tizen.application.launchAppControl( 
        controll_app, 
        service_id, 
        ()=> { 
            console.log('Tizen','service','launch success')
        }, 
        (error)=> { 
            console.log('Tizen','service', 'error:', JSON.stringify(error))
        } 
    )
}

/**
 * Карточку в данные
 * @param {{title:string, name:string, poster_path:string, release_date:string}} card - карточка
 * @param {string} subtitle 
 * @returns {{title:string, subtitle:string, image_ratio:string, image_url:string, action_data:string, is_playable:boolean}}
 */
function cardToTile(card, subtitle){
    let relise = ((card.release_date || card.first_air_date || '0000') + '').slice(0,4)

    let elem = {
        title: card.title || card.name,
        subtitle: subtitle || relise,
        image_ratio: '1by1',
        image_url: card.poster ? card.poster : card.img ? card.img : 'http://imagetmdb.cub.watch/t/p/w300/'+card.poster_path,
        action_data: JSON.stringify(card), 
        is_playable: false
    }

    return elem
}

/**
 * Строим данные
 */
function lauchPick(){
    let data = {
        sections: []
    }

    console.log('Tizen','start pick')

    let status = new Status(3)
        status.onComplite = (result)=>{
            if(result.popular) data.sections.push(result.popular)
            if(result.continues) data.sections.push(result.continues)
            if(result.notice) data.sections.push(result.notice)

            console.log('Tizen','set sections', data.sections.length)
            
            if(data.sections.length) setPick(data)
        }

    Account.notice((notices)=>{
        let new_notices = notices.filter(n=>!n.viewed).slice(0,3)

        if(new_notices.length){
            let section = {
                title: 'Уведомления',
                tiles: [],
                position: 0
            }

            new_notices.forEach(noty => {
                let info = JSON.parse(noty.data)

                section.tiles.push(cardToTile(info.card,info.type == 'new_episode' ? 'Новая серия' : 'В качестве'))
            })

            status.append('notice',section)
        }
        else status.error()
    })

    TMDB.get('movie/popular',{},(result)=>{
        if(result.results.length){
            let section = {
                title: 'Популярные фильмы',
                position: 2,
                tiles: result.results.slice(0,10).map(c=>cardToTile(c))
            }

            status.append('popular',section)
        }
        else status.error()
    },status.error.bind(status))

    let continues = Favorite.continues('tv')

    if(continues.length){
        let section = {
            title: 'Продолжить просмотр',
            position: 1,
            tiles: continues.slice(0,7).map(c=>cardToTile(c))
        }

        status.append('continues',section)
    }
    else status.error()
}

/**
 * Перехват запроса на открытие карточки
 */
function deepLink(){
    let requestedAppControl = tizen.application.getCurrentApplication().getRequestedAppControl()

    if (requestedAppControl) {
        let appControlData = requestedAppControl.appControl.data; 

        for (var i = 0; i < appControlData.length; i++) { 
            if (appControlData[i].key == 'PAYLOAD') { 
                let action_data = JSON.parse(appControlData[i].value[0]).values
                let json = JSON.parse(action_data)

                window.start_deep_link = {
                    url: json.url,
                    component: 'full',
                    id: json.id,
                    method: json.name ? 'tv' : 'movie',
                    card: json,
                    source: json.source || 'tmdb'
                }

                if(window.appready){
                    Activity.push(window.start_deep_link)
                }

                console.log('Tizen','open deep link', window.start_deep_link)
            } 
        } 
    }
}

export default {
    init
}