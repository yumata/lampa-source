import Component from './component'
import Guide from './utils/guide'
import Templates from './templates'
import Settings from './settings'
import Lang from './lang'
import EPG from './utils/epg'
import MainChannel from './utils/main_channel'


function startPlugin() {
    window.plugin_iptv_ready = true

    let manifest = {
        type: 'video',
        version: '1.2.8',
        name: 'IPTV',
        description: '',
        component: 'iptv',
        onMain: (data)=>{
            if(!Lampa.Storage.field('iptv_view_in_main')) return {results: []}

            let playlist = Lampa.Arrays.clone(Lampa.Storage.get('iptv_play_history_main_board','[]')).reverse()

            return {
                results: playlist,
                title: Lampa.Lang.translate('title_continue'),
                nomore: true,
                line_type: 'iptv',
                cardClass: (item)=>{
                    return new MainChannel(item, playlist)
                }
            }
        }
    }
    
    Lampa.Manifest.plugins = manifest

    if(Lampa.Manifest.app_digital >= 300){
        Lampa.ContentRows.add({
            index: 1,
            screen: ['main'],
            call: (params, screen)=>{
                if(!Lampa.Storage.field('iptv_view_in_main')) return

                let playlist = Lampa.Arrays.clone(Lampa.Storage.get('iptv_play_history_main_board','[]')).reverse()

                // возвращаем функцию с коллбеком
                return function(call){
                    playlist.forEach(item=>{
                        item.params = {
                            createInstance: (item)=>new MainChannel(item, playlist)
                        }
                    })

                    call({
                        results: playlist,
                        title: Lampa.Lang.translate('title_continue'),
                    })
                }
            }
        })
    }

    function add(){
        let button = $(`<li class="menu__item selector">
            <div class="menu__ico">
                <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="8" width="34" height="21" rx="3" stroke="currentColor" stroke-width="3"/>
                    <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="menu__text">${window.lampa_settings.iptv ? Lampa.Lang.translate('player_playlist') : 'IPTV'}</div>
        </li>`)

        button.on('hover:enter', function () {
            if(window.lampa_settings.iptv){
                if(Lampa.Activity.active().component == 'iptv') return Lampa.Activity.active().activity.component().playlist()
            }

            Lampa.Activity.push({
                url: '',
                title: 'IPTV',
                component: 'iptv',
                page: 1
            })
        })

        $('.menu .menu__list').eq(0).append(button)

        $('body').append(Lampa.Template.get('cub_iptv_style',{},true))

        if(window.lampa_settings.iptv){
            $('.head .head__action.open--search').addClass('hide')

            $('.head .head__action.open--premium').remove()
            $('.head .head__action.open--feed').remove()

            $('.navigation-bar__body [data-action="main"]').unbind().on('click',()=>{
                Lampa.Activity.active().activity.component().playlist()
            })

            $('.navigation-bar__body [data-action="search"]').addClass('hide')
        }
    }

    Lang.init()

    Templates.init()

    Settings.init()

    EPG.init()

    Guide.init()

    Lampa.Component.add('iptv', Component)

    if(window.lampa_settings.iptv){
        Lampa.Storage.set('start_page','last')

        window.start_deep_link = {component: 'iptv'}
    }

    if(window.appready) add()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add()
        })
    }
}

if(!window.plugin_iptv_ready) startPlugin()
