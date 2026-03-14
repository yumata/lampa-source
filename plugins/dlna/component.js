function Component(object){
    let html = Lampa.Template.js('client_dlna_main'),
        head = html.find('.client-dlna-main__head'),
        body = html.find('.client-dlna-main__body')

    let listener_id, deviceFinder, scroll, tree

    this.create = function(){
        this.activity.loader(true)

        if(window.serviceProvider){
            scroll = new Lampa.Scroll({mask: true, over: true})

            scroll.minus(head)

            body.append(scroll.render(true))

            try{
                deviceFinder = serviceProvider.getDeviceFinder()

                listener_id = deviceFinder.addDeviceDiscoveryListener({
                    ondeviceadded: this.drawDevices.bind(this),
                    ondeviceremoved: this.drawDevices.bind(this)
                })
            }
            catch(e){
                console.log('DLNA', 'getDeviceFinder error: ', e.message)
            }
            
            this.drawDevices()
        } 
        else{
            let empty = new Lampa.Empty({
                descr: Lampa.Lang.translate('client_dlna_nosuport')
            })

            html.empty()

            html.append(empty.render(true))

            this.start = empty.start.bind(empty)
        }

        this.activity.loader(false)
    }

    this.drawDevices = function(){
        let devices = []
        
        try{
            devices = deviceFinder.getDeviceList("MEDIAPROVIDER")
        }
        catch(e){
            console.log('DLNA', 'getDeviceList error: ', e.message)
        }

        scroll.clear()
        scroll.reset()
    
        if(devices.length){
            devices.forEach(element => {
                let item = Lampa.Template.js('client_dlna_device')

                item.find('.client-dlna-device__name').text(element.name)
                item.find('.client-dlna-device__ip').text(element.ipAddress)

                item.on('hover:enter',()=>{
                    tree = {
                        device: element,
                        tree: [element.rootFolder]
                    }

                    this.displayFolder()
                })

                item.on('hover:focus',()=>{
                    scroll.update(item)
                })

                scroll.append(item)
            })
        }
        else{
            this.drawLoading(Lampa.Lang.translate('client_dlna_search_device'))
        }

        this.drawHead()

        this.activity.toggle()
    }

    this.drawLoading = function(text){
        scroll.clear()
        scroll.reset()

        Lampa.Controller.clear()

        let load = Lampa.Template.js('client_dlna_loading')
            load.find('.client-dlna-loading__title').text(text)

        scroll.append(load)
    }

    this.drawFolder = function(elems){
        scroll.clear()
        scroll.reset()

        let folders = elems.filter(a=>a.itemType == 'FOLDER')
        let files   = elems.filter(a=>a.itemType == 'VIDEO')

        folders.forEach(element=>{
            let item = Lampa.Template.js('client_dlna_folder')

            item.find('.client-dlna-device__name').text(element.title)

            item.on('hover:enter',()=>{
                tree.tree.push(element)

                this.displayFolder()
            })

            item.on('hover:focus',()=>{
                scroll.update(item)
            })

            scroll.append(item)
        })

        if(files.length){
            let spl = document.createElement('div')
                spl.addClass('client-dlna-main__split')
                spl.text(Lampa.Lang.translate('title_files'))

            scroll.append(spl)

            files.forEach(element=>{
                let item = Lampa.Template.js('client_dlna_file')
    
                item.find('.client-dlna-file__name').text(element.title)
                item.find('.client-dlna-file__size').text(Lampa.Utils.bytesToSize(element.fileSize))
    
                item.on('hover:enter',()=>{
                    let video = {
                        title: element.title,
                        url: element.itemUri
                    }

                    Lampa.Player.play(video)
                    Lampa.Player.playlist([video])
                })
    
                item.on('hover:focus',()=>{
                    scroll.update(item)
                })
    
                scroll.append(item)
            })
        }

        this.drawHead()

        this.activity.toggle()
    }

    this.drawHead = function(){
        head.empty()

        let nav = []

        if(tree){
            let device_item = document.createElement('div')
                device_item.addClass('client-dlna-head__device')

            let icon = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 128 128" xml:space="preserve">
                <path d="M111.7 57.1V22.2c0-1.1-.5-2.3-1.4-2.9h-.1c-.6-.4-1.2-.6-2-.6H30.9c-2 0-3.5 1.5-3.5 3.5v31.9h34.9c2.8 0 5.1 2.4 5.1 5.2v15.5h27.5V61.4c0-2.4 1.9-4.2 4.2-4.2h12.6z" fill="currentColor"></path>
                <path d="M96.8 67.6H128v33.2H96.8zM67.3 86.1h27.5v-9.2H67.3zM65.1 59.3c0-1.8-1.3-3.1-3-3.1h-56c-1.7 0-3 1.4-3 3.1v41.9h62zM0 106.1c0 1.7 1.3 3.1 3.1 3.1h62.2c1.7 0 3.1-1.3 3.1-3.1v-2.9H0zM125.8 59.3H99c-1.2 0-2.2.9-2.2 2.2v4.1H128v-4.1c0-1.3-.9-2.2-2.2-2.2zm-9.4 4.1h-7.9c-.6 0-1-.4-1-1s.4-1 1-1h7.9c.6 0 1 .4 1 1 .1.6-.3 1-1 1zm3.8 0h-.4c-.6 0-1-.4-1-1s.4-1 1-1h.4c.6 0 1 .4 1 1s-.4 1-1 1zM96.8 107.1c0 1.2.9 2.2 2.2 2.2h26.8c1.2 0 2.2-1 2.2-2.2V103H96.8zm11.6-2h7.9c.6 0 1 .4 1 1s-.4 1-1 1h-7.9c-.6 0-1-.4-1-1s.4-1 1-1zM81.7 93.7H78v-5.6H67.3v7.6h14.3c.6 0 1-.4 1-1 .1-.6-.3-1-.9-1z" fill="currentColor"></path>
            </svg>`

            icon += '<span>'+tree.device.name+'</span>'

            device_item.html(icon)

            nav.push(device_item)

            tree.tree.forEach(folder=>{
                if(folder.isRootFolder) return

                let folder_item = document.createElement('div')
                    folder_item.text(folder.title)
                    folder_item.addClass('client-dlna-head__folder')

                nav.push(folder_item)
            })
        }
        else{
            let empty_item = document.createElement('div')
                empty_item.addClass('client-dlna-head__device')

            let icon = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 128 128" xml:space="preserve">
                <path d="M111.7 57.1V22.2c0-1.1-.5-2.3-1.4-2.9h-.1c-.6-.4-1.2-.6-2-.6H30.9c-2 0-3.5 1.5-3.5 3.5v31.9h34.9c2.8 0 5.1 2.4 5.1 5.2v15.5h27.5V61.4c0-2.4 1.9-4.2 4.2-4.2h12.6z" fill="currentColor"></path>
                <path d="M96.8 67.6H128v33.2H96.8zM67.3 86.1h27.5v-9.2H67.3zM65.1 59.3c0-1.8-1.3-3.1-3-3.1h-56c-1.7 0-3 1.4-3 3.1v41.9h62zM0 106.1c0 1.7 1.3 3.1 3.1 3.1h62.2c1.7 0 3.1-1.3 3.1-3.1v-2.9H0zM125.8 59.3H99c-1.2 0-2.2.9-2.2 2.2v4.1H128v-4.1c0-1.3-.9-2.2-2.2-2.2zm-9.4 4.1h-7.9c-.6 0-1-.4-1-1s.4-1 1-1h7.9c.6 0 1 .4 1 1 .1.6-.3 1-1 1zm3.8 0h-.4c-.6 0-1-.4-1-1s.4-1 1-1h.4c.6 0 1 .4 1 1s-.4 1-1 1zM96.8 107.1c0 1.2.9 2.2 2.2 2.2h26.8c1.2 0 2.2-1 2.2-2.2V103H96.8zm11.6-2h7.9c.6 0 1 .4 1 1s-.4 1-1 1h-7.9c-.6 0-1-.4-1-1s.4-1 1-1zM81.7 93.7H78v-5.6H67.3v7.6h14.3c.6 0 1-.4 1-1 .1-.6-.3-1-.9-1z" fill="currentColor"></path>
            </svg>`

            icon += '<span>'+Lampa.Lang.translate('client_dlna_all_device')+'</span>'

            empty_item.html(icon)

            nav.push(empty_item)
        }

        for(let i = 0; i < nav.length; i++){
            if(i > 0){
                let spl = document.createElement('div')
                    spl.addClass('client-dlna-head__split')

                head.append(spl)
            }

            head.append(nav[i])
        }
    }

    this.displayFolder = function(){
        let device = tree.device
        let folder = tree.tree[tree.tree.length - 1]

        this.drawLoading(Lampa.Lang.translate('loading'))

        device.browse(folder, 0, 10, this.drawFolder.bind(this), ()=>{
            Lampa.Noty.show(Lampa.Lang.translate('torrent_parser_empty'))

            tree.tree.pop()

            this.displayFolder()
        })
    }

    this.back = function(){
        if(tree){
            if(tree.tree.length > 1){
                tree.tree.pop()

                this.displayFolder()

                
            }
            else{
                tree = false

                this.drawDevices()
            }
        }
        else{
            Lampa.Activity.backward()
        }
    }

    this.background = function(){
        Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC')
    }

    this.start = function(){
        if(Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return

        this.background()

        Lampa.Controller.add('content',{
            invisible: true,
            toggle: ()=>{
                Lampa.Controller.collectionSet(html)
                Lampa.Controller.collectionFocus(false,html)
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Lampa.Controller.toggle('menu')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Lampa.Controller.toggle('head')
            },
            right: ()=>{
                Navigator.move('right')
            },
            down: ()=>{
                Navigator.move('down')
            },
            back: this.back.bind(this)
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
        if(deviceFinder) deviceFinder.removeDeviceDiscoveryListener(listener_id)
        
        if(scroll) scroll.destroy()

        html.remove()
    }
}

export default Component