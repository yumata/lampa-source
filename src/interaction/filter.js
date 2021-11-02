import Template from './template'
import Select from './select'
import Search from './search'
import Utils from '../utils/math'

function create(params = {}){
    let line  = Template.get('filter')
    let empty = $('<div class="simple-button selector" style="margin: 2em auto 0 auto">Уточнить поиск</div>')
    let data  = {
        sort: [],
        filter: []
    }

    function selectSearch(){
        let selected = params.search_one == params.search ? 0 : params.search_two == params.search ? 1 : -1
        let search   = []

        if(params.search_one){
            search.push({
                title: params.search_one,
                query: params.search_one,
                selected: selected == 0
            })
        }

        if(params.search_two){
            search.push({
                title: params.search_two,
                query: params.search_two,
                selected: selected == 1
            })
        }

        search.push({
            title: 'Указать название',
            selected: selected == -1,
            query: ''
        })

        Select.show({
            title: 'Уточнить',
            items: search,
            onBack: this.onBack,
            onSelect: (a)=>{
                if(!a.query){
                    new Search({
                        input: params.search,
                        onSearch: this.onSearch,
                        onBack: this.onBack
                    })
                }
                else{
                    this.onSearch(a.query)
                }
            }
        })
    }

    empty.on('hover:enter',selectSearch.bind(this))

    line.find('.filter--search').on('hover:enter',selectSearch.bind(this))

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
                        },
                        onCheck: (b)=>{
                            this.onCheck(type,a,b)
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

    this.chosen = function(type, select){
        line.find('.filter--'+type+' > div').text(Utils.shortText(select.join(', '), 25)).toggleClass('hide', select.length ? false : true)
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