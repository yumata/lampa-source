import Arrays from '../../../../utils/arrays'
import Layer from '../../../../utils/layer'

class Module{
    onInit(){
        this.items   = []
        this.active  = 0

        Arrays.extend(this.params, {
            items: {
                mappging: 'grid',
                cols: 6,
                limit_view: 6,
                limit_collection: 36
            }
        })

        this.total_pages      = 1
        this.limit_view       = this.params.items.limit_view
        this.limit_collection = this.params.items.limit_collection
    }

    onCreate(){
        this.scroll.onScroll = this.emit.bind(this, 'scroll')

        this.body.addClass('mapping--' + this.params.items.mappging).addClass('cols--' + this.params.items.cols)
    }

    onAppend(item, element){
        let render = item.render(true)

        render.on('hover:focus', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)

            this.scroll.update(render)
        })

        render.on('hover:touch', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)
        })

        render.on('hover:enter', ()=> {
            this.last = render
        })

        if(element.params.on && typeof element.params.on == 'object'){
            for(let e in element.params.on){
                render.on(e, ()=> {
                    element.params.on[e].call(this, item, element)
                })
            }
        }

        this.body.append(render)
        
        this.items.push(item)
    }

    onBuild(data){
        if(!data.results.length) return this.empty()
        
        this.total_pages = data.total_pages || 1

        data.results.forEach(this.emit.bind(this, 'createAndAppend'))

        this.emit('scroll')
    }

    onScroll(){
        let colection = this.items.slice(Math.max(0, this.active - this.limit_view), this.active + this.limit_view)
        
        this.items.forEach(item=>{
            if(colection.indexOf(item) == -1){
                item.render(true).classList.remove('layer--render')
            }
            else{
                item.render(true).classList.add('layer--render')
            }
        })

        Navigator.setCollection(this.items.slice(Math.max(0, this.active - this.limit_collection), this.active + this.limit_collection).map(c=>c.render(true)))
        Navigator.focused(this.last)

        Layer.visible(this.scroll.render(true))
    }

    onDestroy(){
        Arrays.destroy(this.items)
    }
}

export default Module