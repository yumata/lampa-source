import main from '../components/main'
import full from '../components/full'
import category_full from '../components/category/full'
import category from '../components/category/main'
import actor from '../components/actor'
import favorite from '../components/favorite'
import torrents from '../components/torrents'

let component = {
    main,
    full,
    category,
    category_full,
    actor,
    favorite,
    torrents
}

function create(object){
    return new component[object.component](object)
}

export default create;