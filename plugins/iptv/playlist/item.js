import DB from '../utils/db'
import Params from '../utils/params'

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
            DB.rewriteData('playlist','active',playlist.id).finally(()=>{
                this.listener.send('channels-load',playlist)
            })
        })
    }

    displaySettings(){
        let params = {
            update: ['always','hour','hour12','day','week','none'],
            loading: ['cub','lampa']
        }

        Lampa.Select.show({
            title: Lampa.Lang.translate('title_settings'),
            items: [
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
            ],
            onSelect: (a)=>{
                if(a.name){
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
                        Lampa.Noty.show('Кеш удален')
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