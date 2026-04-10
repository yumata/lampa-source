import Template from "../../interaction/template"
import Controller from '../../core/controller'
import Utils from '../../utils/utils'
import Activity from '../../interaction/activity/activity'
import Lang from '../../core/lang'
import Select from '../../interaction/select'
import Emit from '../../utils/emit'
import TMDB from '../../core/api/sources/tmdb'
import Router from '../../core/router'
import Keys from '../../core/tmdb/keys'
import Warning from '../../interaction/warning'
import Modal from '../../interaction/modal'
import Storage from '../../core/storage/storage'

class Descriptiopn extends Emit{
    constructor(data) {
        super()

        this.data = data
        this.card = data.movie

        this.emit('init')
    }
    
    create(){
        this.html = Template.get('items_line',{title: Lang.translate('full_detail')})

        let media     = this.card.name ? 'tv' : 'movie'
        let countries = TMDB.parseCountries(this.card)
        let date      = (this.card.release_date || this.card.first_air_date || '') + ''

        this.body = Template.get('full_descr',{
            text: (this.card.overview || Lang.translate('full_notext')) + '<br><br>',
            relise: date.length > 3 ? Utils.parseTime(date).full : date.length > 0 ? date : Lang.translate('player_unknown'),
            budget: '$ ' + Utils.numberWithSpaces(this.card.budget || 0),
            countries: countries.join(', ')
        })

        let tags = this.body.find('.full-descr__tags')

        if(this.card.genres.length){
            tags.append(this.tag(Lang.translate('full_genre'), this.card.genres, (genre)=>{
                Activity.push({
                    url: genre.url || media,
                    title: Utils.capitalizeFirstLetter(genre.name),
                    component: this.card.source == 'cub' ? 'category' : 'category_full',
                    genres: genre.id,
                    source: this.card.source,
                    page: 1
                })
            }))
        }

        if(this.card.production_companies.length){
            tags.append(this.tag(Lang.translate('full_production'), this.card.production_companies, (company)=>{
                Router.call('company', {...company, card: this.card})
            }))
        }

        let key_tags = this.card.keywords ? (this.card.keywords.results || this.card.keywords.keywords) : []

        if(key_tags.length && key_tags.find){
            let tags_filter = key_tags.filter(key=>!Keys.adult.find(tag=>tag.indexOf(key.name.toLowerCase()) >= 0))
                tags_filter = tags_filter.filter(key=>!Keys.lgbt.find(tag=>tag.indexOf(key.name.toLowerCase()) >= 0))

            if(tags_filter.length){
                tags.append(this.tag(Lang.translate('full_keywords'), tags_filter, (key)=>{
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
        }

        if(!this.card.budget) $('.full--budget', this.body).remove()
        if(!countries.length) $('.full--countries', this.body).remove()

        this.body.find('.selector').on('hover:focus hover:enter hover:hover hover:touch',(e)=>{
            this.last = e.target
        })

        if(this.card.adult){
            let warning = new Warning({
                type: 'full-adult',
                title: Lang.translate('adult_content_title'),
                text: Lang.translate('adult_content_text_warning'),
                icon: '<svg><use xlink:href="#sprite-adult"></use></svg>',
                button: {
                    title: Lang.translate('title_watch')
                },
                onSelect: () => {
                    Modal.open({
                        title: Lang.translate('adult_content_title'),
                        size: 'small',
                        scroll: {
                            nopadding: true
                        },
                        html: $('<div class="about">' + Lang.translate('adult_content_text_modal') + '</div>'),
                        buttons: [
                            {
                                name: Lang.translate('adult_content_confirm'),
                                onSelect: () => {
                                    Modal.close()

                                    Controller.toggle('full_descr')

                                    Storage.set('adult_content_view', true)

                                    Lampa.Activity.refresh()
                                }
                            },
                            {
                                name: Lang.translate('adult_content_deny'),
                                onSelect: () => {
                                    Modal.close()

                                    Controller.toggle('full_descr')
                                }
                            }
                        ],
                        onBack: () => {
                            Modal.close()
                            
                            Controller.toggle('full_descr')
                        }
                    })
                }
            })

            $('.full-descr__left', this.body).append(warning.render())
        }

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

                this.emit('toggle')
            },
            update: ()=>{},
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else this.emit('left')
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

    render(js){
        return js ? this.html[0] : this.html
    }

    destroy(){
        this.body.remove()
        this.html.remove()

        this.emit('destroy')
    }
}

export default Descriptiopn