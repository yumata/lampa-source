import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Activity from '../../interaction/activity'
import Lang from '../../utils/lang'
import Select from '../../interaction/select'
import Emit from '../../utils/emit'
import TMDB from '../../utils/api/tmdb'

class Descriptiopn extends Emit{
    constructor() {
        super()

        this.movie = Activity.props().get('movie')

        this.emit('init')
    }
    
    create(){
        this.html = Template.get('items_line',{title: Lang.translate('full_detail')})

        let media     = this.movie.name ? 'tv' : 'movie'
        let countries = TMDB.parseCountries(this.movie)
        let date      = (this.movie.release_date || this.movie.first_air_date || '') + ''

        this.body = Template.get('full_descr',{
            text: (this.movie.overview || Lang.translate('full_notext')) + '<br><br>',
            relise: date.length > 3 ? Utils.parseTime(date).full : date.length > 0 ? date : Lang.translate('player_unknown'),
            budget: '$ ' + Utils.numberWithSpaces(this.movie.budget || 0),
            countries: countries.join(', ')
        })

        let tags = this.body.find('.full-descr__tags')

        if(this.movie.genres.length){
            tags.append(this.tag(Lang.translate('full_genre'), this.movie.genres, (genre)=>{
                Activity.push({
                    url: genre.url || media,
                    title: Utils.capitalizeFirstLetter(genre.name),
                    component: this.movie.source == 'cub' ? 'category' : 'category_full',
                    genres: genre.id,
                    source: this.movie.source,
                    page: 1
                })
            }))
        }

        if(this.movie.production_companies.length){
            tags.append(this.tag(Lang.translate('full_production'), this.movie.production_companies, (company)=>{
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

        let key_tags = this.movie.keywords ? (this.movie.keywords.results || this.movie.keywords.keywords) : []

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

        if(!this.movie.budget) $('.full--budget', this.body).remove()
        if(!countries.length) $('.full--countries', this.body).remove()

        this.body.find('.selector').on('hover:focus hover:enter hover:hover hover:touch',(e)=>{
            this.last = e.target
        })

        this.html.find('.items-line__body').append(this.body)

        this.emit('create')
    }

    tag(name, items, call){
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
    
    toggle(){
        let controller = {
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(this.last, this.render())
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
                else this.emit('down')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else this.emit('up')
            },
            back: this.emit.bind(this, 'back')
        }

        this.emit('controller', controller)

        Controller.add('full_descr', controller)

        Controller.toggle('full_descr')
    }

    render(){
        return this.html
    }

    destroy(){
        this.body.remove()
        this.html.remove()

        this.emit('destroy')
    }
}

export default Descriptiopn