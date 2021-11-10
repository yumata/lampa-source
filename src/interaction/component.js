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

//todo при переименовании компонентов может сломаться логика загрузки последнего стейта, т.к. в сторедже будет стейт со старым именем
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
    nocomponent
}

function create(object){
    if(component[object.component]){
        return new component[object.component](object)
    }
    else{
        return new component.nocomponent(object)
    }
}

function add(name, comp){
    component[name] = comp
}

function get(name){
    return component[name]
}

export default {
    create,
    add,
    get
}