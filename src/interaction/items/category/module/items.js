import Arrays from '../../../../utils/arrays'
import Layer from '../../../../core/layer'
import Platform from '../../../../core/platform'

export default {
    onInit: function(){
        this.items   = []
        this.pages   = {}
        this.active  = 0

        Arrays.extend(this.params, {
            items: {
                mapping: 'grid',
                cols: 6,
                limit_view: 6,
                limit_collection: 36
            }
        })

        this.total_pages      = 1
        this.limit_view       = this.params.items.limit_view
        this.limit_collection = this.params.items.limit_collection
    },

    onCreate: function(){
        this.scroll.onScroll = this.emit.bind(this, 'scroll')

        this.body.addClass('mapping--' + this.params.items.mapping)
        
        this.params.items.mapping == 'grid' && this.body.addClass('cols--' + this.params.items.cols)
    },

    onAppend: function(item, element){
        let render = item.render(true)

        render.on('hover:focus', ()=> {
            this.scroll.update(render, this.params.items.mapping == 'list')
        })

        render.on('hover:touch hover:enter hover:focus', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)

            clearTimeout(this.scroll_timeout)
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

        if(!this.pages[this.object.page]) this.pages[this.object.page] = {items: []}

        this.pages[this.object.page].items.push(item)
    },

    onBuild: function(data){
        if(!data.results.length) return this.empty()
        
        this.total_pages = data.total_pages || 1

        data.results.forEach(this.emit.bind(this, 'createAndAppend'))

        this.emit('scroll')
    },

    onPageView: function(){
        let item = this.items[this.active]
        let page = 1
        let anyscroll

        if(item){
            for(let p in this.pages){
                this.pages[p].items.find(i=>i.data == item.data) && (page = p)
            }
        }

        for(let p in this.pages){
            let current = this.pages[p]
            let visible = p >= page - 1 && p - 1 <= page

            if(visible && current.removed){
                current.removed = false

                let frag = document.createDocumentFragment()

                current.items.forEach(i=> frag.appendChild(i.render(true)))
                current.items.forEach(i=> i.render(true).style.visibility = 'visible')

                current.placeholder.replaceWith(frag)
                current.placeholder = null

                anyscroll = true
            }
            else if(!visible && !current.removed){
                current.removed = true

                current.placeholder = document.createElement('div')
                current.placeholder.style.display = 'none'

                
                current.items[0].render(true).after(current.placeholder)
                current.items.forEach(i=>i.render(true).remove())
                
                anyscroll = true
            }
        }

        if(anyscroll && this.last) this.scroll.immediate(this.last, this.params.items.mapping == 'list')
    },

    onScroll: function(){
        clearTimeout(this.scroll_timeout)

        if(Platform.screen('tv')) this.scroll_timeout = setTimeout(this.emit.bind(this, 'pageView'), 300)
        
        Navigator.setCollection(this.items.slice(Math.max(0, this.active - this.limit_collection), this.active + this.limit_collection).map(c=>c.render(true)))
        Navigator.focused(this.last)

        Layer.visible(this.scroll.render(true))
    },

    onDestroy: function(){
        Arrays.destroy(this.items)

        this.pages = {}
        this.items = []
    }
}