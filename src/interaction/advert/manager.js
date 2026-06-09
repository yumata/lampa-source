import Premiere from './premiere'
import Extend from './extend'
import Preroll from './preroll'
import Banner from './banner'
import Platform from '../../core/platform'

function init(){
    Premiere.init()
    Extend.init()
    
    if(!Platform.is(['orsay', 'netcast'])){
        Preroll.init()
        Banner.init()
    }
}

export default {
    init
}
