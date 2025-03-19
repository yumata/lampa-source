import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Activity from '../../interaction/activity'
import Api from '../../interaction/api'
import Lang from '../../utils/lang'
import Select from '../../interaction/select'

function create(data, params = {}){
    let html,body,last
    
    this.create = function(){
        html = Template.get('items_line',{title: Lang.translate('full_detail')})

        let media = data.movie.number_of_seasons ? 'tv' : 'movie'
        let countries = Api.sources.tmdb.parseCountries(data.movie)
        let date = (data.movie.release_date || data.movie.first_air_date || '') + ''

        body = Template.get('full_descr',{
            text: (data.movie.overview || Lang.translate('full_notext')) + '<br><br>',
            relise: date.length > 3 ? Utils.parseTime(date).full : date.length > 0 ? date : Lang.translate('player_unknown'),
            budget: '$ ' + Utils.numberWithSpaces(data.movie.budget || 0),
            countries: countries.join(', ')
        })

        let tags = body.find('.full-descr__tags')

        if(data.movie.genres.length){
            tags.append(this.tag(Lang.translate('full_genre'), data.movie.genres, (genre)=>{
                Activity.push({
                    url: genre.url || media,
                    title: Utils.capitalizeFirstLetter(genre.name),
                    component: params.object.source == 'cub' ? 'category' : 'category_full',
                    genres: genre.id,
                    source: params.object.source,
                    page: 1
                })
            }))
        }

        if(data.movie.production_companies.length){
            tags.append(this.tag(Lang.translate('full_production'), data.movie.production_companies, (company)=>{
                Activity.push({
                    url: company.url || media,
                    component: 'company',
                    title: Lang.translate('title_company'),
                    id: company.id,
                    source: params.object.source,
                    page: 1
                })
            }))
        }

        let key_tags = data.movie.keywords ? (data.movie.keywords.results || data.movie.keywords.keywords) : []

        if(key_tags.length){
            tags.append(this.tag(Lang.translate('full_keywords'), key_tags, (key)=>{
                Activity.push({
                    url: 'discover/' + media,
                    title: Utils.capitalizeFirstLetter(key.name),
                    keywords: key.id,
                    component: 'category_full',
                    source: 'tmdb',
                    page: 1
                })
            }))
        }

        if(!data.movie.budget) $('.full--budget', body).remove()
        if(!countries.length) $('.full--countries', body).remove()

        body.find('.selector').on('hover:focus',(e)=>{
            last = e.target

            //this.onScroll(e.target)
        })

        html.find('.items-line__body').append(body)
    }

    this.tag = function(name, items, call){
        let elem = $(`<div class="tag-count selector">
            <div class="tag-count__name">${name}</div>
            <div class="tag-count__count">${items.length}</div>
        </div>`)
    
        elem.on('hover:enter',()=>{
            let select = items.map(a=>{
                return {
                    title: Utils.capitalizeFirstLetter(a.name),
                    elem: a
                }
            })
    
            Select.show({
                title: name,
                items: select,
                onSelect: (a)=>{
                    this.toggle()
    
                    call(a.elem)
                },
                onBack: ()=>{
                    this.toggle()
                }
            })
        })
    
        return elem
    }

    this.toggle = function(){
        Controller.add('full_descr',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())

                if(this.onToggle) this.onToggle(this)

                //if(last && !$(last).hasClass('full-descr__text')) this.onScroll(last)
            },
            update: ()=>{},
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
                else this.onDown()
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else this.onUp()
            },
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('full_descr')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        body.remove()
        html.remove()

        html = null
        body = null
    }
}

export default create