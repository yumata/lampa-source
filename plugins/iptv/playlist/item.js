import DB from '../utils/db'
import Params from '../utils/params'
import Pilot from '../utils/pilot'

class PlaylistItem{
    constructor(playlist){
        this.playlist = playlist
        this.item     = Lampa.Template.js('cub_iptv_playlist_item')
        this.footer   = this.item.find('.iptv-playlist-item__footer')
        this.params   = {}

        Params.get(playlist.id).then(params=>{
            this.params = params

            this.drawFooter()
        })

        let name = playlist.name || '---'

        this.item.find('.iptv-playlist-item__url').text(playlist.url)
        this.item.find('.iptv-playlist-item__name-text').text(name)
        this.item.find('.iptv-playlist-item__name-ico span').text(name.slice(0,1).toUpperCase())

        this.item.on('hover:long',this.displaySettings.bind(this)).on('hover:enter',()=>{
            if(this.deleted) return

            Pilot.notebook('playlist', playlist.id)
            
            DB.rewriteData('playlist','active',playlist.id).finally(()=>{
                this.listener.send('channels-load',playlist)
            })
        })

        this.item.on('update', ()=>{
            Params.get(playlist.id).then(params=>{
                this.params = params
    
                this.drawFooter()
            })
        })
    }

    displaySettings(){
        if(this.deleted) return

        let params = {
            update: ['always','hour','hour12','day','week','none'],
            loading: ['cub','lampa']
        }

        let menu = []

        menu = menu.concat([
            {
                title: Lampa.Lang.translate('iptv_update'),
                subtitle: Params.value(this.params, 'update'),
                name: 'update'
            },
            {
                title: Lampa.Lang.translate('iptv_loading'),
                subtitle: Params.value(this.params, 'loading'),
                name: 'loading'
            },
            {
                title: Lampa.Lang.translate('iptv_remove_cache'),
                subtitle: Lampa.Lang.translate('iptv_remove_cache_descr')
            }
        ])

        if(this.playlist.custom){
            menu = menu.concat([
                {
                    title: Lampa.Lang.translate('more'),
                    separator: true
                },
                {
                    title: Lampa.Lang.translate('extensions_change_link'),
                    name: 'change_url'
                },
                {
                    title: Lampa.Lang.translate('extensions_remove'),
                    name: 'delete'
                }
            ])
        }

        Lampa.Select.show({
            title: Lampa.Lang.translate('title_settings'),
            items: menu,
            onSelect: (a)=>{
                if(a.name == 'change_url'){
                    Lampa.Input.edit({
                        title: Lampa.Lang.translate('iptv_playlist_add_set_url'),
                        free: true,
                        nosave: true,
                        value: this.playlist.url
                    },(value)=>{
                        if(value){
                            let list = Lampa.Storage.get('iptv_playlist_custom','[]')
                            let item = list.find(n=>n.id == this.playlist.id)

                            if(item && item.url !== value){
                                item.url = value

                                Lampa.Storage.set('iptv_playlist_custom',list)

                                this.item.find('.iptv-playlist-item__url').text(value)

                                Lampa.Noty.show(Lampa.Lang.translate('iptv_playlist_lick_changed'))
                            }
                        }
        
                        Lampa.Controller.toggle('content')
                    })
                }
                else if(a.name == 'delete'){
                    Lampa.Modal.open({
                        title: '',
                        align: 'center',
                        html: $('<div class="about">'+Lampa.Lang.translate('iptv_confirm_delete_playlist')+'</div>'),
                        buttons: [
                            {
                                name: Lampa.Lang.translate('settings_param_no'),
                                onSelect: ()=>{
                                    Lampa.Modal.close()
                
                                    Lampa.Controller.toggle('content')
                                }
                            },
                            {
                                name: Lampa.Lang.translate('settings_param_yes'),
                                onSelect: ()=>{
                                    let list = Lampa.Storage.get('iptv_playlist_custom','[]')

                                    Lampa.Arrays.remove(list, list.find(n=>n.id == this.playlist.id))

                                    Lampa.Storage.set('iptv_playlist_custom',list)

                                    Lampa.Noty.show(Lampa.Lang.translate('iptv_playlist_deleted'))

                                    Lampa.Modal.close()
                
                                    Lampa.Controller.toggle('content')

                                    this.item.style.opacity = 0.3

                                    this.deleted = true
                                }
                            }
                        ]
                    })
                }
                else if(a.name){
                    let keys = params[a.name]
                    let items = []

                    keys.forEach(k=>{
                        items.push({
                            title: Lampa.Lang.translate('iptv_params_' + k),
                            selected: this.params[a.name] == k,
                            value: k
                        })
                    })

                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_settings'),
                        items: items,
                        onSelect: (b)=>{
                            this.params[a.name] = b.value

                            Params.set(this.playlist.id, this.params).then(this.drawFooter.bind(this)).catch((e)=>{
                                Lampa.Noty.show(e)
                            }).finally(this.displaySettings.bind(this))
                        },
                        onBack: this.displaySettings.bind(this)
                    })
                }
                else{
                    DB.deleteData('playlist', this.playlist.id).finally(()=>{
                        Lampa.Noty.show(Lampa.Lang.translate('iptv_cache_clear'))
                    })

                    Lampa.Controller.toggle('content')
                }
            },
            onBack: ()=>{
                Lampa.Controller.toggle('content')
            }
        })
    }

    drawFooter(){
        this.footer.removeClass('hide')

        function label(where, name, value){
            let leb_div = document.createElement('div')
            let leb_val = document.createElement('span')
            
            leb_div.addClass('iptv-playlist-item__label')
            
            if(name) leb_div.text(name + ' - ')

            leb_val.text(value)

            leb_div.append(leb_val)

            where.append(leb_div)
        }

        DB.getDataAnyCase('playlist','active').then(active=>{
            let details_left  = this.item.find('.details-left').empty()
            let details_right = this.item.find('.details-right').empty()

            if(active && active == this.playlist.id) label(details_left, '',Lampa.Lang.translate('iptv_active'))
            
            label(details_left, Lampa.Lang.translate('iptv_update'), Params.value(this.params, 'update'))
            label(details_left, Lampa.Lang.translate('iptv_loading'), Params.value(this.params, 'loading'))
            label(details_right, Lampa.Lang.translate('iptv_updated'),Lampa.Utils.parseTime(this.params.update_time).briefly)
        })
    }

    render(){
        return this.item
    }
}

export default PlaylistItem