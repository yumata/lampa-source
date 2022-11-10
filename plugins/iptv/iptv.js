import Component from './component'

Lampa.Lang.add({
    iptv_select_playlist: {
        ru: 'Выберите плейлист',
        uk: 'Виберіть плейлист',
        be: 'Выберыце плэйліст',
    },
    iptv_all_channels: {
        ru: 'Все каналы',
        uk: 'Усі канали',
        be: 'Усе каналы',
    },
    iptv_now: {
        ru: 'Сейчас',
        uk: 'Зараз',
        be: 'Цяпер',
    },
    iptv_later: {
        ru: 'Потом',
        uk: 'Потім',
        be: 'Потым',
    },
    iptv_add_fav: {
        ru: 'Добавить в избранное',
        uk: 'Додати в обране',
        be: 'Дадаць у абранае',
    },
    iptv_remove_fav: {
        ru: 'Убрать из избранного',
        uk: 'Прибрати з вибраного',
        be: 'Прыбраць з абранага',
    },
    iptv_playlist_empty: {
        ru: 'Вы не добавили ни одного плейлиста. Пожалуйста, добавьте хотя бы один плейлист на странице http://cub.watch/iptv',
        uk: 'Ви не додали жодного плейлиста. Будь ласка, додайте хоча б один плейлист на сторінці http://cub.watch/iptv',
        be: 'Вы не дадалі жаднага плэйліста. Калі ласка, дадайце хаця б адзін плэйліст на старонцы http://cub.watch/iptv',
    }
})

function startPlugin() {
    window.plugin_iptv_ready = true

    Lampa.Component.add('iptv', Component)

    Lampa.Template.add('iptv_content', `
        <div class="iptv-content">
            <div class="iptv-content__menu"></div>
            <div class="iptv-content__channels"></div>
            <div class="iptv-content__details"></div>
        </div>
    `)

    Lampa.Template.add('iptv_menu', `
        <div class="iptv-menu">
            <div class="iptv-menu__body">
                <div class="iptv-menu__title"></div>
                <div class="iptv-menu__list"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('iptv_channels', `
        <div class="iptv-channels">
            
        </div>
    `)

    Lampa.Template.add('iptv_details', `
        <div class="iptv-details">
            <div class="iptv-details__group"></div>
            <div class="iptv-details__title"></div>

            <div class="iptv-details__program">

            </div>
        </div>
    `)

    Lampa.Template.add('iptv_list', `
        <div class="iptv-list layer--height">
            <div class="iptv-list__ico">
                <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>
                    <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="iptv-list__title">#{iptv_select_playlist}</div>
            <div class="iptv-list__items"></div>
        </div>
    `)

    Lampa.Template.add('iptv_style', `
        <style>
        @@include('../plugins/iptv/css/style.css')
        </style>
    `)

    function add(){
        let button = $(`<li class="menu__item selector" data-action="iptv">
                <div class="menu__ico">
                    <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="8" width="34" height="21" rx="3" stroke="currentColor" stroke-width="3"/>
                        <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                        <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="menu__text">IPTV</div>
            </li>`)

            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'IPTV',
                    component: 'iptv',
                    page: 1
                })
            })

            $('.menu .menu__list').eq(0).append(button)

            $('body').append(Lampa.Template.get('iptv_style',{},true))
    }

    if(window.appready) add()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add()
        })
    }
}

if(!window.plugin_iptv_ready && Lampa.Manifest.app_digital >= 154) startPlugin()