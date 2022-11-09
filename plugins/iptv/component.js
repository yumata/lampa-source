import Api from './api'

function Component(object){
    let _self   = this
    let api     = new Api()
    //let event   = new Lampa.Event()
    let html    = $('<div></div>')
    let zone    = 0
    
    let select_playlist_url = ''

    let channels_list = []
    let channels_page = 0

    let element_last_focus
    let program_last_result = {
        id: 0,
        data: {}
    }

    let html_content  = Lampa.Template.get('iptv_content')
    let html_menu     = Lampa.Template.get('iptv_menu')
    let html_details  = Lampa.Template.get('iptv_details')
    let html_channels = Lampa.Template.get('iptv_channels')

    let scroll_menu     = new Lampa.Scroll({mask:true,over: true})
    let scroll_channels = new Lampa.Scroll({mask:true,over: true})
    let scroll_details  = new Lampa.Scroll({mask:true,over: true})
    let scroll_list

    scroll_channels.render().find('.scroll__body').addClass('notransition')

    
    this.create = function(){
        this.activity.loader(true)

        this.start = this.controllerList.bind(this)

        if(window.innerWidth < 767) this.empty()
        else {
            api.get('list').then(this.list.bind(this)).then(id=>api.get('playlist/'+id)).then(this.build.bind(this)).catch(this.empty.bind(this))
        }
        
        return this.render() 
    }

    this.background = function(){
        Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC')
    }

    this.getFavorites = function(){
        let favorites = Lampa.Storage.get('iptv_favorites',{})

        if(!favorites[select_playlist_url]){
            favorites[select_playlist_url] = []

            Lampa.Storage.set('iptv_favorites',favorites)
        }

        return favorites[select_playlist_url]
    }

    this.updateFavorites = function(channels){
        let favorites = Lampa.Storage.get('iptv_favorites',{})
            favorites[select_playlist_url] = channels

        Lampa.Storage.set('iptv_favorites',favorites)
    }

    this.list = function(data){
        return new Promise((resolve,reject)=>{
            if(data.list.length > 1){
                let html_list = Lampa.Template.get('iptv_list')

                if(scroll_list) scroll_list.destroy()

                scroll_list = new Lampa.Scroll({mask:true,over: true})

                html_list.find('.iptv-list__items').append(scroll_list.render())

                data.list.reverse().forEach((item)=>{
                    let li = $('<div class="iptv-list__item selector"><div class="iptv-list__item-name">'+(item.name || Lampa.Lang.translate('player_playlist'))+'</div><div class="iptv-list__item-url">'+item.url+'</div></div>')

                    li.on('hover:enter',()=>{
                        this.activity.loader(true)

                        select_playlist_url = item.url

                        resolve(item.id)
                    }).on('hover:focus',()=>{
                        scroll_list.update(li)
                    })

                    scroll_list.append(li)
                })

                html.append(html_list)

                this.activity.loader(false)

                this.start = this.controllerList.bind(this)

                this.activity.toggle()
            }
            else if(data.list.length == 1){
                select_playlist_url = data.list[0].url

                resolve(data.list[0].id)
            }
            else reject(Lampa.Lang.translate('iptv_playlist_empty'))
        })
    }

    this.empty = function(e){
        console.log(e)
        let empty = new Lampa.Empty(typeof e == 'string' ? {descr: '<div style="width: 60%; margin:0 auto; line-height: 1.4">' + e + '</div>'} : {})

        html.empty()

        html.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.program = function(title,list){
        let body = $(`
            <div class="iptv-details__program-body">
                <div class="iptv-details__program-title">${title}</div>
                <div class="iptv-details__program-list"></div>
            </div>
        `)

        list.forEach((item)=>{
            let li = $(`<div class="iptv-program selector">
                <div class="iptv-program__time">${Lampa.Utils.parseTime(item.start).time}</div>
                <div class="iptv-program__body">
                    <div class="iptv-program__title">${item.title}</div>
                </div>
            </div>`)

            li.on('hover:focus',(e, is_mouse)=>{
                element_last_focus = li[0]

                if(!is_mouse) scroll_details.update(li, true)
            })

            body.find('.iptv-details__program-list').append(li)
        })

        return body
    }

    this.details = function(channel){
        html_details.find('.iptv-details__title').text(channel.name)

        let prog = html_details.find('.iptv-details__program').empty()
        let load = $('<div class="iptv-details__program-loading">'+Lampa.Lang.translate('loading')+'...</div>')

        prog.append(load)

        scroll_details.reset()

        if(channel.id){
            let draw = (data)=>{
                if(data.result){
                    load.remove()

                    let now   = this.program(Lampa.Lang.translate('iptv_now'),data.result.slice(0,1))
                    let later = this.program(Lampa.Lang.translate('iptv_later'),data.result.slice(1))

                    prog.append(now).append(later)
                }
                else{
                    load.remove()
                }
            }

            if(program_last_result.name == channel.name) draw(program_last_result.data)
            else{
                let date   = new Date(),
                    time = date.getTime(),
                    ofst = parseInt((localStorage.getItem('time_offset') == null ? 'n0' : localStorage.getItem('time_offset')).replace('n',''))

                    date = new Date(time + (ofst * 1000 * 60 * 60))

                let offset = channel.name.match(/([+|-]\d)$/)

                if(offset && channel.similar){
                    date.setHours(date.getHours() + parseInt(offset[1]))
                }

                api.program({
                    channel_id: channel.id,
                    time: date.getTime()
                },(data)=>{
                    program_last_result.id   = channel.id
                    program_last_result.data = data
                    program_last_result.name = channel.name

                    if(offset && channel.similar){
                        data.result.forEach((item)=>{
                            item.start = item.start - (parseInt(offset[1]) * 3600000)
                            item.stop  = item.stop - (parseInt(offset[1]) * 3600000)
                        })
                    }
                    
                    draw(program_last_result.data)
                })
            }
        }
        else{
            load.remove()
        }
    }

    this.removeIco = function(channel){
        let ico = channel.data('ico')

        ico.onerror = null
        ico.onload  = null

        ico.src = ''
    }

    this.channelsDisplay = function(prev_focus, need_focus){
        let limit    = 20
        let position = channels_page*limit
        let start    = Math.max(0, position-limit)
        let channels = channels_list.slice(start,position+limit+4)
        let last_focus = 0
        let favorites = this.getFavorites()

        html_channels.find('.selector').each(function(){
            let channel = $(this)

            if(!channels.find(a=>a.index == channel.data('position'))){
                _self.removeIco(channel)

                channel.remove()
            }
        })

        let createPlaylist = (current)=>{
            let playlist = []
            let index = channels_list.indexOf(current)
            let start = Math.max(0,index - 50)
            let end   = 100 - (index - start)

            channels_list.slice(start, index + end).forEach((item)=>{
                let cell = {
                    title: item.name,
                    url: item.url,
                    tv: true,
                    callback: ()=>{
                        Lampa.Player.playlist(createPlaylist(item))
                    }
                }

                if(item.logo){
                    cell.icon = '<img style="height: auto !important" src="'+item.logo+'" />'
                    cell.template = 'selectbox_icon'
                }

                playlist.push(cell)
            })

            return playlist
        }

        channels.forEach(item=>{
            if(html_channels.find('[data-position="'+item.index+'"]').length) return

            let in_favorite = favorites.indexOf(item.name) >= 0

            let channel = $('<div class="iptv-channel selector" data-position="'+item.index+'"><div class="iptv-channel__body"><img src="" class="iptv-channel__ico" /></div></div>')
            let ico     = channel.find('.iptv-channel__ico')[0]

            ico.onerror = function(){
                channel.find('.iptv-channel__body').empty().append('<div class="iptv-channel__name">'+item.name+'</div>')
            }

            ico.onload = function(){
                channel.addClass('loaded')
            }

            channel.data('ico',ico)

            channel.toggleClass('favorite', in_favorite)

            channel.on('hover:enter',()=>{
                let playlist = createPlaylist(item)

                Lampa.Player.play({
                    title: item.name,
                    url: item.url,
                    tv: true
                })

                Lampa.Player.playlist(playlist)
            })

            channel.on('hover:long',()=>{
                Lampa.Select.show({
                    title: Lampa.Lang.translate('title_action'),
                    items: [
                        {
                            title: in_favorite ? Lampa.Lang.translate('iptv_remove_fav') : Lampa.Lang.translate('iptv_add_fav')
                        }
                    ],
                    onSelect: ()=>{
                        Lampa.Controller.toggle('content')

                        if(in_favorite){
                            Lampa.Arrays.remove(favorites, item.name)
                        }
                        else{
                            favorites.push(item.name)
                        }

                        in_favorite = !in_favorite

                        channel.toggleClass('favorite', in_favorite)

                        this.updateFavorites(favorites)

                        favorites = this.getFavorites()

                        html_menu.find('.favorites--menu-item').eq(0).data('update')()

                        Lampa.Controller.toggle('content')
                    },
                    onBack: ()=>{
                        Lampa.Controller.toggle('content')
                    }
                })
            })

            channel.on('hover:focus',(e, is_mouse)=>{
                let page = Math.round(item.index/limit)

                if(page != channels_page && !is_mouse){
                    channels_page = page

                    this.channelsDisplay(last_focus, item.index)
                }
                else{
                    if(!is_mouse) scroll_channels.update(channel)

                    this.details(item)

                    last_focus = item.index

                    element_last_focus = channel[0]

                    html_channels.find('.last--focus').removeClass('last--focus')

                    channel.addClass('last--focus')
                }
            })

            if(item.logo) ico.src = item.logo
            else ico.onerror()

            html_channels.append(channel)
        })

        html_channels.find('.selector').sort(function (a, b) {
            return $(a).attr('data-position') - $(b).attr('data-position')
        }).appendTo(html_channels)

        let focus = need_focus || 0

        Lampa.Controller.collectionSet(this.render())

        if(typeof need_focus !== 'undefined'){
            Lampa.Controller.collectionFocus(html_channels.find('[data-position="'+focus+'"]')[0],this.render())
        }
        else{
            scroll_channels.update(html_channels.find('[data-position="0"]'))

            this.details(channels[0])
        }
    }

    this.channels = function(channels){
        channels_list = channels.map((a,i)=>{a.index = i; return a})
        channels_page = 0

        html_channels.find('.selector').each(function(){
            _self.removeIco($(this))
        })

        html_channels.empty()

        scroll_channels.reset()

        this.channelsDisplay()
    }

    this.build = function(data){
        html.empty()

        html_menu.find('.iptv-menu__title').text(data.name || Lampa.Lang.translate('player_playlist'))

        let favorites = this.getFavorites()

        Lampa.Arrays.insert(data.playlist.menu,0,{
            name: Lampa.Lang.translate('settings_input_links'),
            count: favorites.length,
            favorites: true
        })

        data.playlist.menu.forEach((menu,i)=>{
            if(menu.count == 0 && !menu.favorites) return

            let li = $('<div class="iptv-menu__list-item selector">'+(menu.name || Lampa.Lang.translate('iptv_all_channels'))+'<span>'+menu.count+'</span></div>')

            if(menu.favorites){
                li.addClass('favorites--menu-item')

                li.data('update',()=>{
                    favorites = this.getFavorites()

                    menu.count = favorites.length

                    li.find('span').text(menu.count)
                })
            }
            
            li.on('hover:enter',(e, is_mouse)=>{
                if(menu.count == 0) return
                
                if(menu.favorites){
                    this.channels(data.playlist.channels.filter(a=>favorites.find(b=>b == a.name)))
                }
                else{
                    this.channels(menu.name ? data.playlist.channels.filter(a=>a.group == menu.name) : data.playlist.channels)
                }

                html_menu.find('.active').removeClass('active')

                li.addClass('active')

                Lampa.Controller.collectionFocus(li[0],html_menu)

                html_details.find('.iptv-details__group').text((menu.name || Lampa.Lang.translate('iptv_all_channels')))
            })

            li.on('hover:focus',()=>{
                scroll_menu.update(li,true)

                element_last_focus = li[0]

                html_menu.find('.last--focus').removeClass('last--focus')

                li.addClass('last--focus')
            })

            html_menu.find('.iptv-menu__list').append(li)
        })

        html_menu.find('.iptv-menu__list .selector').eq(favorites.length ? 0 : 1).trigger('hover:enter').trigger('hover:focus')

        scroll_menu.append(html_menu)
        scroll_menu.minus()

        scroll_channels.append(html_channels)
        scroll_channels.minus()

        scroll_details.append(html_details)
        scroll_details.minus()

        html_content.find('.iptv-content__menu').append(scroll_menu.render())
        html_content.find('.iptv-content__channels').append(scroll_channels.render())
        html_content.find('.iptv-content__details').append(scroll_details.render())

        html.append(html_content)

        this.activity.loader(false)

        this.start = this.controllerChannels.bind(this)

        this.activity.toggle()
    }

    this.back = function(){
        Lampa.Activity.backward()
    }

    this.toZone = function(dir){
        zone = Math.max(-1,Math.min(2,zone + dir))

        if(zone == -1){
            Lampa.Controller.toggle('menu')

            zone = 0
        }
        else if(zone == 0){
            let last = html_menu.find('.last--focus')

            Lampa.Controller.collectionSet(html_menu)

            Lampa.Controller.collectionFocus(last.length ? last[0] : false,html_menu)
        }
        else if(zone == 1){
            let last = html_channels.find('.last--focus')

            Lampa.Controller.collectionSet(html_channels)

            Lampa.Controller.collectionFocus(last.length ? last[0] : false,html_channels)
        }
        else{
            let any = html_details.find('.selector')

            Lampa.Controller.collectionSet(html_details)
                    
            Lampa.Controller.collectionFocus(any.length ? any[0] : false,html_details)
        }
    }

    this.controllerChannels = function(){
        if(Lampa.Activity.active().activity !== this.activity) return

        this.background()

        Lampa.Controller.add('content',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(element_last_focus,this.render())
            },
            left: ()=>{
                this.toZone(-1)
            },
            right: ()=>{
                this.toZone(1)
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Lampa.Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Lampa.Activity.replace()
            }
        })

        Lampa.Controller.toggle('content')
    }

    this.controllerList = function(){
        if(Lampa.Activity.active().activity !== this.activity) return

        this.background()

        Lampa.Controller.add('content',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(element_last_focus,this.render())
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Lampa.Controller.toggle('menu')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
                else Lampa.Controller.toggle('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Lampa.Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: this.back
        })

        Lampa.Controller.toggle('content')
    }

    this.start = function(){
        
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        api.destroy()
        
        html_channels.find('.selector').each(function(){
            _self.removeIco($(this))
        })

        scroll_menu.destroy()
        scroll_channels.destroy()
        scroll_details.destroy()

        if(scroll_list) scroll_list.destroy()

        channels_list = []

        html.empty()
    }
}

export default Component