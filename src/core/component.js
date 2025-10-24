import main from '../components/main'
import full from '../components/full'
import category_full from '../components/category/full'
import category from '../components/category/main'
import actor from '../components/person'
import favorite from '../components/favorite'
import torrents from '../components/torrents'
import mytorrents from '../components/mytorrents'
import relise from '../components/relise'
import nocomponent from '../components/nocomponent'
import timetable from '../components/timetable'
import subscribes from '../components/subscribes'
import company from '../components/company'
import feed from '../components/feed'
import bookmarks from '../components/bookmarks'
import episodes from '../components/episodes'
import myperson from '../components/myperson'
import ai_facts from '../components/facts'
import ai_recommendations from '../components/recommendations'
import discuss from '../components/discuss'
import recomend from '../components/recomend'

let component = {
    main,
    full,
    category,
    category_full,
    actor,
    favorite,
    torrents,
    mytorrents,
    relise,
    nocomponent,
    timetable,
    subscribes,
    company,
    feed,
    bookmarks,
    episodes,
    myperson,
    ai_facts,
    ai_recommendations,
    discuss,
    recomend
}

/**
 * Создать компонент
 * @param {{component:string}} object 
 * @returns 
 */
function create(object){
    if(component[object.component]){
        try{
            return new component[object.component](object)
        }
        catch(e){
            console.log('Component','create error',e.stack)

            return new component.nocomponent(object)
        }
    }
    else{
        return new component.nocomponent(object)
    }
}

/**
 * Добавить компонент
 * @param {string} name 
 * @param {class} comp 
 */
function add(name, comp){
    component[name] = comp
}

/**
 * Получить компонент
 * @param {string} name 
 * @returns {class}
 */
function get(name){
    return component[name]
}

export default {
    create,
    add,
    get
}