import Template from './template'
import Select from './select'
import Search from './search_input'
import Utils from '../utils/utils'
import Scroll from './scroll'
import Lang from '../core/lang'
import Activity from './activity/activity'
import Storage from '../core/storage/storage'

/**
 * Фильтр
 * @param {object} params - параметры фильтра
 * @param {string} params.search - текущий поисковый запрос
 * @param {object} params.movie - информация о фильме/сериале
 * @param {string} params.search_one - основной поисковый запрос
 * @param {string} params.search_two - дополнительный поисковый запрос
 * @returns {Filter} - экземпляр класса Filter
 */
function Filter(params = {}){
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
        let earlier = Storage.get('user_clarifys','{}')[params.movie.id]

        search.push({
            title: Lang.translate('filter_set_name'),
            query: ''
        })

        if(earlier){
            search.push({
                title: Lang.translate('search'),
                separator: true
            })

            earlier.map(a=>a).reverse().forEach((ear)=>{
                search.push({
                    title: ear,
                    query: ear,
                })
            })
        }

        if(params.movie.names && params.movie.names.length){
            search.push({
                title: Lang.translate('filter_alt_names'),
                separator: true
            })

            params.movie.names.forEach(n=>{
                search.push({
                    title: n,
                    query: n,
                })
            })
        }

        if(params.movie.alternative_titles && params.movie.alternative_titles.titles && params.movie.alternative_titles.titles.length){
            params.movie.alternative_titles.titles.forEach(a=>{
                if(['us',Storage.field('language')].indexOf(a.iso_3166_1.toLowerCase()) >= 0){
                    if(!search.find(s=>s.title == a.title)){
                        search.push({
                            title: a.title,
                            query: a.title,
                        })
                    }
                }
            })
        }

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

        let selected

        search.forEach(elem=>{
            elem.selected = elem.query == params.search && !selected

            if(elem.selected) selected = true
        })        

        Select.show({
            title: Lang.translate('filter_clarify'),
            items: search,
            onBack: this.onBack,
            onSelect: (a)=>{
                if(!a.query){
                    new Search({
                        input: params.search,
                        onSearch: (new_query)=>{
                            let earliers = Storage.get('user_clarifys','{}')

                            if(!earliers[params.movie.id]) earliers[params.movie.id] = []

                            if(earliers[params.movie.id].indexOf(new_query) == -1){
                                earliers[params.movie.id].push(new_query)

                                Storage.set('user_clarifys',earliers)
                            }

                            this.onSearch(new_query)
                        },
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
                if(!a.noselect) this.selected(where, a)

                if(a.items){
                    Select.show({
                        title: a.title,
                        items: a.items,
                        onBack: ()=>{
                            this.show(title, type)
                        },
                        onSelect: (b)=>{
                            if(!b) this.selected(a.items, b)

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

export default Filter