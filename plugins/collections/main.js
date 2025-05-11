import Api from './api'

function component(object){
    let comp = new Lampa.InteractionMain(object)

    comp.create = function(){
        this.activity.loader(true)

        Api.main(object,(data)=>{
            this.build(data)
        },this.empty.bind(this))

        return this.render()
    }

    comp.onMore = function(data){
        Lampa.Activity.push({
            url: data.category,
            title: data.title,
            component: 'cub_collections_collection',
            page: 1
        })
    }

    return comp
}

export default component