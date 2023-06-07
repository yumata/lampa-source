import Api from './utils/api'
import Favorites from './utils/favorites'
import Player from './utils/player'

function Component(){
    let last, scroll, filtred = [],page = 0
    let html = document.createElement('div')

    let img_bg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC'

    this.create = function(){
        this.activity.loader(true)

        Api.list().then(result=>{
            this.data = result.result

            filtred = this.data.stations

            this.build()
        }).catch((e)=>{
            this.data = {
                stations: []
            }

            this.build()
        })

        return this.render() 
    }

    this.background = function(){
        Lampa.Background.immediately(last ? last.background || img_bg : img_bg)
    }

    this.build = function(){
        html.append(Lampa.Template.js('radio_content'))

        scroll = new Lampa.Scroll({mask: true, over: true})

        scroll.onEnd = ()=>{
            page++

            this.next()
        }

        html.find('.radio-content__list').append(scroll.render(true))
        html.find('.radio-content__cover').append(Lampa.Template.js('radio_cover'))

        scroll.minus(html.find('.radio-content__head'))

        this.buildCatalog()
        this.buildSearch()
        this.buildAdd()
        this.display()

        Lampa.Layer.update(html)

        this.activity.loader(false)
    }

    this.clearButtons = function(category, search){
        let btn_catalog = html.find('.button--catalog')
        let btn_search  = html.find('.button--search')

        btn_catalog.find('div').addClass('hide').text('')
        btn_search.find('div').addClass('hide').text('')

        if(category){
            btn_catalog.find('div').removeClass('hide').text(category)
        }
        else{
            btn_search.find('div').removeClass('hide').text(search)
        }
    }

    this.buildCatalog = function(){
        let btn   = html.find('.button--catalog')
        let items = []
        let favs  = Favorites.get().length

        items.push({
            title: Lampa.Lang.translate('settings_input_links'),
            ghost: !favs,
            noenter: !favs,
            favorite: true
        })

        if(this.data.stations.length){
            this.data.genre.forEach(g=>{
                items.push({
                    title: g.name,
                    id: g.id
                })
            })
        }

        if(favs){
            filtred = Favorites.get()

            this.clearButtons(items[0].title, false)
        }

        btn.on('hover:enter',()=>{
            Lampa.Select.show({
                title: Lampa.Lang.translate('title_catalog'),
                items: items,
                onSelect: (a)=>{
                    if(a.favorite){
                        filtred = Favorites.get()
                    }
                    else{
                        filtred = this.data.stations.filter(s=>{
                            return s.genre.find(g=>g.id == a.id)
                        })
                    }

                    this.clearButtons(a.title, false)

                    this.display()
                },
                onBack: ()=>{
                    Lampa.Controller.toggle('content')
                }
            })
        })
    }

    this.buildAdd = function(){
        let btn = html.find('.button--add')

        btn.on('hover:enter',()=>{
            Lampa.Input.edit({
                title: Lampa.Lang.translate('radio_add_station'),
                free: true,
                nosave: true,
                nomic: true,
                value: ''
            },(url)=>{
                if(url){
                    Favorites.add({
                        user: true,
                        stream: url,
                        title: Lampa.Lang.translate('radio_station')
                    })

                    filtred = Favorites.get()

                    this.clearButtons(Lampa.Lang.translate('settings_input_links'), false)

                    this.display()
                }
                else{
                    Lampa.Controller.toggle('content')
                }
            })
        })
    }

    this.buildSearch = function(){
        let btn = html.find('.button--search')

        btn.on('hover:enter',()=>{
            Lampa.Input.edit({
                free: true,
                nosave: true,
                nomic: true,
                value: ''
            },(val)=>{
                if(val){
                    val = val.toLowerCase()

                    filtred = this.data.stations.filter(s=>{
                        return s.title.toLowerCase().indexOf(val) >= 0 || s.tooltip.toLowerCase().indexOf(val) >= 0
                    })

                    this.clearButtons(false, val)

                    this.display()
                }
                else{
                    Lampa.Controller.toggle('content')
                }
            })
        })
    }

    this.display = function(){
        scroll.clear()
        scroll.reset()

        last = false
        page = 0

        this.cover({
            title: '',
            tooltip: ''
        })

        if(filtred.length) this.next()
        else{
            for(let i = 0; i < 3; i++){
                let empty = Lampa.Template.js('radio_list_item')

                empty.addClass('empty--item')
                empty.style.opacity = 1 - 0.3 * i

                scroll.append(empty)
            }

            Lampa.Layer.visible(scroll.render(true))
        }

        this.activity.toggle()
    }

    this.next = ()=>{
        let views = 10
        let start = page * views

        filtred.slice(start, start + views).forEach(this.append.bind(this))

        Lampa.Layer.visible(scroll.render(true))
    }

    this.play = (station)=>{
        let player = new Player(station)
            player.create()

        document.body.addClass('ambience--enable')

        Lampa.Controller.add('content',{
            invisible: true,
            toggle: ()=>{
                Lampa.Controller.collectionSet(html)
                Lampa.Controller.collectionFocus(false,html)
            },
            back: ()=>{
                document.body.removeClass('ambience--enable')

                player.destroy()

                this.activity.toggle()
            }
        })

        Lampa.Controller.toggle('content')
    }

    this.append = function(station){
        let item = Lampa.Template.js('radio_list_item')

        item.find('.radio-item__num').text((filtred.indexOf(station) + 1).pad(2))

        item.find('.radio-item__title').text(station.title)
        item.find('.radio-item__tooltip').text(station.tooltip || station.stream)

        item.background = station.bg_image_mobile || img_bg

        let img_box = item.find('.radio-item__cover-box')
        let img_elm = item.find('img')

        img_elm.onload = ()=>{
            img_box.addClass('loaded')
        }

        img_elm.onerror = ()=>{
            img_elm.src = './img/icons/menu/movie.svg'

            img_box.addClass('loaded-icon')
        }

        img_elm.src = station.bg_image_mobile

        item.on('hover:focus hover:hover',()=>{
            this.cover(station)

            Lampa.Background.change(item.background)

            last = item
        })

        item.on('hover:focus',()=>{
            scroll.update(item)
        })

        item.on('hover:enter',()=>{
            this.play(station)
        })

        item.on('hover:long',()=>{
            if(station.user){
                Lampa.Select.show({
                    title: Lampa.Lang.translate('menu_settings'),
                    items: [
                        {
                            title: Lampa.Lang.translate('extensions_change_name'),
                            change: 'title'
                        },
                        {
                            title: Lampa.Lang.translate('extensions_change_link'),
                            change: 'stream'
                        },
                        {
                            title: Lampa.Lang.translate('extensions_remove'),
                            remove: true
                        }
                    ],
                    onSelect: (a)=>{
                        if(a.remove){
                            Favorites.remove(station)

                            item.remove()

                            last = false

                            Lampa.Controller.toggle('content')
                        }
                        else{
                            Lampa.Input.edit({
                                free: true,
                                nosave: true,
                                nomic: true,
                                value: station[a.change] || ''
                            },(val)=>{
                                if(val){
                                    station[a.change] = val

                                    Favorites.update(station)

                                    this.cover(station)

                                    item.find('.radio-item__' + (a.change == 'title' ? 'title' : 'tooltip')).text(val) 
                                }
                                
                                Lampa.Controller.toggle('content')
                            })
                        }
                    },
                    onBack: ()=>{
                        Lampa.Controller.toggle('content')
                    }
                })
            }
            else{
                Favorites.toggle(station)

                item.toggleClass('favorite', Boolean(Favorites.find(station)))
            }
        })

        item.toggleClass('favorite', Boolean(Favorites.find(station)))

        if(!last) last = item

        if(Lampa.Controller.own(this)) Lampa.Controller.collectionAppend(item)

        scroll.append(item)
    }

    this.cover = function(station){
        html.find('.radio-cover__title').text(station.title || '')
        html.find('.radio-cover__tooltip').text(station.tooltip || '')

        let img_box = html.find('.radio-cover__img-box')
        let img_elm = img_box.find('img')

        img_box.removeClass('loaded loaded-icon')

        img_elm.onload = ()=>{
            img_box.addClass('loaded')
        }

        img_elm.onerror = ()=>{
            img_elm.src = './img/icons/menu/movie.svg'

            img_box.addClass('loaded-icon')
        }

        img_elm.src = station.bg_image_mobile
    }

    this.start = function(){
        if(Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return

        this.background()

        Lampa.Controller.add('content',{
            link: this,
            invisible: true,
            toggle: ()=>{
                Lampa.Controller.collectionSet(html)
                Lampa.Controller.collectionFocus(last,html)
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Lampa.Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Lampa.Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            back: ()=>{
                Lampa.Activity.backward()
            }
        })

        Lampa.Controller.toggle('content')
    }


    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        if(scroll) scroll.destroy()
        
        html.remove()
    }
}

export default Component