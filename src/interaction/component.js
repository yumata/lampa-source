import main from '../components/main'
import full from '../components/full'
import category_full from '../components/category/full'
import category from '../components/category/main'
import actor from '../components/person'
import favorite from '../components/favorite'
import torrents from '../components/torrents'
import mytorrents from '../components/mytorrents'
import relise from '../components/relise'
import collections from '../components/collections/main'
import collections_view from '../components/collections/view'
import nocomponent from '../components/nocomponent'
import timetable from '../components/timetable'

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
    collections,
    collections_view,
    nocomponent,
    timetable
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
            return new component.nocomponent(object)
        }
    }
    else{
        return new component.nocomponent(object)
    }
}

/**
 * Добавить
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