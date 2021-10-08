import Template from './template'
import Select from './select'
import Search from './search'

function create(params = {}){
    let line  = Template.get('filter')
    let empty = $('<div class="simple-button selector" style="margin: 2em auto 0 auto">Уточнить поиск</div>')
    let data  = {
        sort: [],
        filter: []
    }

    empty.on('hover:enter',()=>{
        new Search({
            input: params.search,
            onSearch: this.onSearch,
            onBack: this.onBack
        })
    })

    line.find('.filter--search').on('hover:enter',()=>{
        new Search({
            input: params.search,
            onSearch: this.onSearch,
            onBack: this.onBack
        })
    })

    line.find('.filter--sort').on('hover:enter',()=>{
        this.show('Сортировать','sort')
    })

    line.find('.filter--filter').on('hover:enter',()=>{
        this.show('Фильтр','filter')
    })

    this.show = function(title, type){
        let where = data[type]

        Select.show({
            title: title,
            items: where,
            onBack: this.onBack,
            onSelect: (a)=>{
                if(a.items){
                    Select.show({
                        title: a.title,
                        items: a.items,
                        onBack: ()=>{
                            this.show(title, type)
                        },
                        onSelect: (b)=>{
                            this.selected(a.items, b)

                            this.onSelect(type,a,b)
                        }
                    })
                }
                else{
                    this.selected(where, a)

                    this.onSelect(type,a)
                }
            }
        })
    }

    this.selected = function(items, a){
        items.forEach(element => {
            element.selected = false
        })

        a.selected = true
    }

    this.render = function(){
        return line
    }

    this.append = function(add){
        html.find('.files__body').append(add)
    }

    this.empty = function(){
        return empty
    }

    this.toggle = function(){
        line.find('.filter--sort').toggleClass('selector',data.sort.length ? true : false).toggleClass('hide',data.sort.length ? false : true)
        line.find('.filter--filter').toggleClass('selector',data.filter.length ? true : false).toggleClass('hide',data.filter.length ? false : true)
    }

    this.set = function(type, items){
        data[type] = items

        this.toggle()
    }

    this.get = function(type){
        return data[type]
    }

    this.sort = function(items, by){
        items.sort((c,b)=>{
            if(c[by] < b[by]) return 1
            if(c[by] > b[by]) return -1
            return 0
        })
    }

    this.destroy = function(){
        empty.remove()
        line.remove()

        empty = null
        line  = null
        data  = null
    }
}

export default create