import Api from '../interaction/api'
import Manifest from '../utils/manifest'

function component(object){
    let comp = new Lampa.InteractionMain(object)

    comp.onLinesBuild = function(data){
        Manifest.plugins.forEach(plugin=>{
            if(plugin.onMain){
                let result = plugin.onMain(data)
                
                if(result.results.length) comp.append(result)
            }
        })
    }

    comp.create = function(){
        this.activity.loader(true)

        let next = Api.main(object,this.build.bind(this),this.empty.bind(this))

        if(typeof next == 'function') this.next = next

        return this.render()
    }

    return comp
}

export default component