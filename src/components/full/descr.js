import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Utils from '../../utils/math'
import Activity from '../../interaction/activity'
import Modal from '../../interaction/modal'
import Api from '../../interaction/api'
import Arrays from '../../utils/arrays'
import Lang from '../../utils/lang'

function create(data, params = {}){
    let html,body,last
    
    this.create = function(){
        html = Template.get('items_line',{title: Lang.translate('full_detail')})

        let genres = data.movie.genres.map(a => {
            return '<div class="full-descr__tag selector" data-genre="'+a.id+'" data-url="'+a.url+'">'+Utils.capitalizeFirstLetter(a.name)+'</div>'
        }).join('')

        let companies = data.movie.production_companies.map(a => {
            return '<div class="full-descr__tag selector" data-company="'+a.id+'">'+Utils.capitalizeFirstLetter(a.name)+'</div>'
        }).join('')

        let countries = data.movie.production_countries.map(a => {
            return a.name
        }).join(', ')

        body = Template.get('full_descr',{
            text: (data.movie.overview || Lang.translate('full_notext')) + '<br><br>',
            genres: genres,
            companies: companies,
            relise: (data.movie.release_date || data.movie.first_air_date),
            budget: '$ ' + Utils.numberWithSpaces(data.movie.budget || 0),
            countries: countries
        })

        if(!genres)    $('.full--genres', body).remove()
        if(!companies) $('.full--companies', body).remove()

        body.find('.selector').on('hover:enter',(e)=>{
            let item = $(e.target)

            if(item.data('genre')){
                let tmdb = params.object.source == 'tmdb' || params.object.source == 'cub'

                Activity.push({
                    url: tmdb ? 'movie' : item.data('url'),
                    component: tmdb ? 'category' : 'category_full',
                    genres: item.data('genre'),
                    source: params.object.source,
                    page: 1
                })
            }
            if(item.data('company')){
                Api.clear()

                Modal.open({
                    title: Lang.translate('title_company'),
                    html: Template.get('modal_loading'),
                    size: 'medium',
                    onBack: ()=>{
                        Modal.close()
                        
                        Controller.toggle('full_descr')
                    }
                })

                Api.company({id: item.data('company')},(json)=>{
                    if(Controller.enabled().name == 'modal'){
                        Arrays.empty(json,{
                            homepage: '---',
                            origin_country: '---',
                            headquarters: '---'
                        })

                        Modal.update(Template.get('company',json))
                    }
                },()=>{

                })
            }
        }).on('hover:focus',(e)=>{
            last = e.target
        })

        html.find('.items-line__body').append(body)
    }

    this.toggle = function(){
        Controller.add('full_descr',{
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())
            },
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