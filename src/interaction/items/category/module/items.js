import Arrays from '../../../../utils/arrays'
import Layer from '../../../../core/layer'
import Platform from '../../../../core/platform'
import Controller from '../../../../core/controller'

export default {
    onInit: function(){
        this.items   = []
        this.pages   = {}
        this.active  = 0
        this.added   = 0
        this.screen  = Platform.screen('tv')
        this.loaded  = []

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
        this.scroll.onScroll     = this.emit.bind(this, 'scroll')
        this.scroll.onAnimateEnd = ()=>{
            // Скрываем/показываем страницы
            this.emit('pageView')

            // Обновляем навигатор
            this.emit('scroll')
        }

        this.body.addClass('mapping--' + this.params.items.mapping)
        
        this.params.items.mapping == 'grid' && this.body.addClass('cols--' + this.params.items.cols)
    },

    onAppend: function(item, element){
        let render = item.render(true)

        render.on('hover:touch hover:enter hover:focus', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)
        })

        render.on('hover:focus', ()=> {
            this.scroll.update(render, this.params.items.mapping == 'list')
        })

        if(element.params.on && typeof element.params.on == 'object'){
            for(let e in element.params.on){
                render.on(e, ()=> {
                    element.params.on[e].call(this, item, element)
                })
            }
        }

        this.frament.appendChild(render)
        
        this.items.push(item)

        this.added++

        let page = Math.ceil(this.added / 60) // 60 - количество элементов на странице

        if(!this.pages[page]) this.pages[page] = {items: []}

        this.pages[page].items.push(item)
    },

    onBuild: function(data){
        if(!data.results.length) return this.empty()
        
        this.total_pages = data.total_pages || 1

        this.loaded.push(data.results)

        this.emit('pushLoaded')

        this.emit('scroll')
    },

    onPushLoaded: function(){
        let add = this.loaded.shift()

        if(add && add.length){
            this.frament = document.createDocumentFragment()

            add.forEach(this.emit.bind(this, 'createAndAppend'))

            this.body.append(this.frament)
        }
    },

    onPageView: function(){
        let item = this.items[this.active]
        let page = 1
        let anyscroll

        let item_position   = 0
        let scroll_position = this.screen ? 0 : this.scroll.render(true).scrollTop

        if(item){
            for(let p in this.pages){
                this.pages[p].items.find(i=>i.data == item.data) && (page = p)
            }
        }

        // Надо получить позицию до изменений
        if(this.last) item_position = this.screen ? this.last.getBoundingClientRect().top : this.last.offsetTop

        for(let p in this.pages){
            let current = this.pages[p]
            let visible = p >= page - 1 && p - 1 <= page

            // Если страница видна, но была удалена, то вставляем её обратно
            if(visible && current.removed){
                current.removed = false

                let frag = document.createDocumentFragment()

                current.items.forEach(i=> frag.appendChild(i.render(true)))
                current.items.forEach(i=> i.render(true).style.visibility = 'visible')

                current.placeholder.replaceWith(frag)
                current.placeholder = null

                anyscroll = true
            }
            // Если страница не видна, то удаляем её из DOM
            else if(!visible && !current.removed){
                current.removed = true

                current.placeholder = document.createElement('div')
                current.placeholder.style.display = 'none'

                
                current.items[0].render(true).after(current.placeholder)
                current.items.forEach(i=>i.render(true).remove())
                
                anyscroll = true
            }
        }

        // Если было удаление или добавление страниц, то надо подвинуть скролл
        if(anyscroll && this.last){
            if(this.screen){
                this.scroll.shift(this.last.getBoundingClientRect().top - item_position)
            }
            else{
                this.scroll.render(true).scrollTop = scroll_position + (this.last.offsetTop - item_position)
            }
        }
    },

    onScroll: function(){
        // Грузим элементы которые ожидают своей очереди
        this.emit('pushLoaded')

        if(Controller.own(this)){
            Navigator.setCollection(this.items.slice(Math.max(0, this.active - this.limit_collection), this.active + this.limit_collection).map(c=>c.render(true)))
            Navigator.focused(this.last)
        }

        Layer.visible(this.scroll.render(true))
    },

    onResize: function(){
        if(this.last) this.scroll.update(this.last, this.params.items.mapping == 'list')
    },

    onDestroy: function(){
        Arrays.destroy(this.items)

        this.pages = {}
        this.items = []
        this.loaded = []
    }
}