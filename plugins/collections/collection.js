import Api from './api'

function Collection(data, params = {}){
    this.data = data
    
    function remove(elem){
        if(elem) elem.remove()
    }

    this.build = function(){
        this.item  = Lampa.Template.js('cub_collection')
        this.img   = this.item.find('.card__img')
        this.icon  = this.item.find('.cub-collection-card__user-icon img')

        this.item.find('.card__title').text(Lampa.Utils.capitalizeFirstLetter(data.title))
        this.item.find('.cub-collection-card__items').text(data.items_count)
        this.item.find('.cub-collection-card__date').text(Lampa.Utils.parseTime(data.time).full)
        this.item.find('.cub-collection-card__views').text(Lampa.Utils.bigNumberToShort(data.views))
        this.item.find('.full-review__like-counter').text(Lampa.Utils.bigNumberToShort(data.liked))
        this.item.find('.cub-collection-card__user-name').text(data.username)
        
        this.item.addEventListener('visible',this.visible.bind(this))
    }
    
    /**
     * Загрузить картинку
     */
    this.image = function(){
        this.img.onload = ()=>{
            this.item.classList.add('card--loaded')
        }
    
        this.img.onerror = ()=>{
            this.img.src = './img/img_broken.svg'
        }

        this.icon.onload = ()=>{
            this.item.find('.cub-collection-card__user-icon').classList.add('loaded')
        }
    
        this.icon.onerror = ()=>{
            this.icon.src = './img/img_broken.svg'
        }
    }


    /**
     * Создать
     */
    this.create = function(){
        this.build()

        this.item.addEventListener('hover:focus',()=>{
            if(this.onFocus) this.onFocus(this.item, data)
        })

        this.item.addEventListener('hover:touch',()=>{
            if(this.onTouch) this.onTouch(this.item, data)
        })
        
        this.item.addEventListener('hover:hover',()=>{
            if(this.onHover) this.onHover(this.item, data)
        })

        this.item.addEventListener('hover:enter',()=>{
            Lampa.Activity.push({
                url: data.id,
                collection: data,
                title: Lampa.Utils.capitalizeFirstLetter(data.title),
                component: 'cub_collections_view',
                page: 1
            })
        })
        
        this.item.addEventListener('hover:long',()=>{
            let items = []
            let voited = Lampa.Storage.cache('collections_voited',100,[])

            if(voited.indexOf(data.id) == -1){
                items = [
                    {
                        title: '<span class="settings-param__label">+1</span> ' + Lampa.Lang.translate('title_like'),
                        like: 1
                    },
                    {
                        title: Lampa.Lang.translate('reactions_shit'),
                        like: -1
                    }
                ]
            }
            
            Lampa.Select.show({
                title: Lampa.Lang.translate('title_action'),
                items: items,
                onSelect: (item)=>{
                    Lampa.Controller.toggle('content')

                    Api.liked({id: data.id, dir: item.like},()=>{
                        voited.push(data.id)
    
                        Lampa.Storage.set('collections_voited', voited)

                        data.liked += item.like

                        this.item.find('.full-review__like-counter').text(Lampa.Utils.bigNumberToShort(data.liked))
                    
                        Lampa.Bell.push({text:Lampa.Lang.translate('discuss_voited')})
                    })
                },
                onBack: ()=>{
                    Lampa.Controller.toggle('content')
                }
            })
        })

        this.image()
    }

    /**
     * Загружать картинку если видна карточка
     */
    this.visible = function(){
        this.img.src  = Lampa.Api.img(data.backdrop_path, 'w500')
        this.icon.src = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/img/profiles/' + data.icon + '.png'

        if(this.onVisible) this.onVisible(this.item, data)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        this.img.src = ''

        remove(this.item)

        this.item = null

        this.img = null
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = function(js){
        return js ? this.item : $(this.item)
    }
}

export default Collection