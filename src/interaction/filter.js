import Template from './template'
import Select from './select'
import Search from './search'
import Utils from '../utils/math'
import Scroll from './scroll'
import Lang from '../utils/lang'
import Activity from './activity'

function create(params = {}){
    let line  = Template.get('filter').addClass('torrent-filter')
    let empty = $('<div class="empty__footer"><div class="simple-button selector">'+Lang.translate('filter_clarify_two')+'</div></div>')
    let data  = {
        sort: [],
        filter: []
    }

    let similars = []

    let buttons_scroll  = new Scroll({horizontal: true, nopadding: true})

    if(typeof params.search == 'string') line.find('.filter--search div').text(Utils.shortText(params.search,20)).removeClass('hide')

    function selectSearch(){
        let search = []
        let year   = ((params.movie ? params.movie.first_air_date || params.movie.release_date : '0000') + '').slice(0,4)

        search.push({
            title: Lang.translate('filter_set_name'),
            query: ''
        })

        search.push({
            title: Lang.translate('filter_combinations'),
            separator: true
        })

        if(similars.length){
            similars.forEach((sim)=>{
                search.push({
                    title: sim,
                    query: sim,
                })
            })
        }
        else{
            let combinations = []

            if(params.search_one){
                combinations.push(params.search_one)
                combinations.push(params.search_one + ' ' + year)

                if(params.search_two){
                    combinations.push(params.search_one + ' ' + params.search_two)
                    combinations.push(params.search_one + ' ' + params.search_two + ' ' + year)
                }
            }

            if(params.search_two){
                combinations.push(params.search_two)
                combinations.push(params.search_two + ' ' + year)

                if(params.search_one){
                    combinations.push(params.search_two + ' ' + params.search_one)
                    combinations.push(params.search_two + ' ' + params.search_one + ' ' + year)
                }
            }

            combinations.forEach(word=>{
                search.push({
                    title: word,
                    query: word,
                })
            })
        }

        search.forEach(elem=>{
            elem.selected = elem.query == params.search
        })        

        Select.show({
            title: Lang.translate('filter_clarify'),
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
        this.show(Lang.translate('filter_sorted'),'sort')
    })

    line.find('.filter--filter').on('hover:enter',()=>{
        this.show(Lang.translate('filter_filtred'),'filter')
    })

    buttons_scroll.append(line)

    this.addButtonBack = function(){
        if(params.movie && params.movie.id){
            line.prepend(Template.get('explorer_button_back'))
    
            line.find('.filter--back').on('hover:enter',()=>{
                if(Activity.all().length > 1){
                    Activity.back()
                }
                else{
                    Activity.push({
                        url: params.movie.url,
                        component: 'full',
                        id: params.movie.id,
                        method: params.movie.name ? 'tv' : 'movie',
                        card: params.movie,
                        source: params.movie.source
                    })
                }
            })
        }
    }

    this.show = function(title, type){
        let where = data[type]

        Select.show({
            title: title,
            items: where,
            onBack: this.onBack,
            onSelect: (a)=>{
                this.selected(where, a)

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

                            this.show(title, type)
                        },
                        onCheck: (b)=>{
                            this.onCheck(type,a,b)
                        }
                    })
                }
                else{
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
        return buttons_scroll.render()
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

    this.similar = function(sim){
        similars = sim

        return empty
    }

    this.sort = function(items, by){
        items.sort((c,b)=>{
            if(c[by] < b[by]) return 1
            if(c[by] > b[by]) return -1
            return 0
        })
    }

    this.chosen = function(type, select){
        line.find('.filter--'+type+' > div').html(Utils.shortText(select.join(', '), 25)).toggleClass('hide', select.length ? false : true)
    }

    this.destroy = function(){
        empty.remove()
        line.remove()

        buttons_scroll.destroy()

        empty = null
        line  = null
        data  = null
    }
}

export default create