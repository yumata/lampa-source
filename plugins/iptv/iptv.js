import Component from './component'


function startPlugin() {
    window.plugin_iptv_ready = true

    let manifest = {
        type: 'video',
        version: '1.2.5',
        name: 'IPTV',
        description: '',
        component: 'iptv',
    }
    
    Lampa.Manifest.plugins = manifest
    
    Lampa.Lang.add({
        iptv_noprogram: {
            ru: 'Нет программы',
            en: 'No program',
            uk: 'Немає програми',
            be: 'Няма праграмы',
            zh: '没有节目',
            pt: 'Nenhum programa'
        },
        iptv_noload_playlist: {
            ru: 'К сожалению, загрузка плейлиста не удалась. Возможно, ваш провайдер заблокировал загрузку из внешних источников.',
            en: 'Unfortunately, the playlist download failed. Your ISP may have blocked downloads from external sources.',
            uk: 'На жаль, завантаження плейлиста не вдалося. Можливо, ваш провайдер заблокував завантаження із зовнішніх джерел.',
            be: 'Нажаль, загрузка плэйліста не атрымалася. Магчыма, ваш правайдэр заблакаваў загрузку са знешніх крыніц.',
            zh: '不幸的是，播放列表下载失败。 您的 ISP 可能已阻止从外部来源下载。',
            pt: 'Infelizmente, o download da lista de reprodução falhou. Seu ISP pode ter bloqueado downloads de fontes externas.'
        },
        iptv_select_playlist: {
            ru: 'Выберите плейлист',
            en: 'Choose a playlist',
            uk: 'Виберіть плейлист',
            be: 'Выберыце плэйліст',
            zh: '选择一个播放列表',
            pt: 'Escolha uma lista de reprodução'
        },
        iptv_all_channels: {
            ru: 'Все каналы',
            en: 'All channels',
            uk: 'Усі канали',
            be: 'Усе каналы',
            zh: '所有频道',
            pt: 'Todos os canais'
        },
        iptv_add_fav: {
            ru: 'Добавить в избранное',
            en: 'Add to favorites',
            uk: 'Додати в обране',
            be: 'Дадаць у абранае',
            zh: '添加到收藏夹',
            pt: 'Adicionar aos favoritos'
        },
        iptv_remove_fav: {
            ru: 'Убрать из избранного',
            en: 'Remove from favorites',
            uk: 'Прибрати з вибраного',
            be: 'Прыбраць з абранага',
            zh: '从收藏夹中删除',
            pt: 'Remover dos favoritos'
        },
        iptv_playlist_empty: {
            ru: 'К сожалению, на данный момент вы не добавили ни одного плейлиста. Чтобы начать просмотр контента, пожалуйста, перейдите на страницу <span class="iptv-link">cub.watch/iptv</span> и добавьте хотя бы один плейлист.',
            en: 'Sorry, you haven\'t added any playlist yet. To start watching content, please go to <span class="iptv-link">cub.watch/iptv</span> and add at least one playlist.',
            uk: 'На жаль, на даний момент ви не додали жодного плейлиста. Щоб розпочати перегляд контенту, будь ласка, перейдіть на сторінку <span class="iptv-link">cub.watch/iptv</span> і додайте хоча б один плейлист.',
            be: 'Нажаль, на дадзены момант вы не дадалі ніводнага плэйліста. Каб пачаць прагляд кантэнту, калі ласка, перайдзіце на старонку <span class="iptv-link">cub.watch/iptv</span> і дадайце хаця б адзін плэйліст.',
            zh: '抱歉，您还没有添加任何播放列表。 要开始观看内容，请转到 <span class="iptv-link">cub.watch/iptv</span> 并添加至少一个播放列表。',
            pt: 'Desculpe, você ainda não adicionou nenhuma lista de reprodução. Para começar a assistir o conteúdo, acesse <span class="iptv-link">cub.watch/iptv</span> e adicione pelo menos uma lista de reprodução.'
        },
        iptv_select_playlist_text: {
            ru: 'Для того чтобы добавить свой плейлист, вам необходимо перейти на сайт <span class="iptv-link">cub.watch/iptv</span> и добавить плейлист от вашего провайдера.',
            en: 'In order to add your playlist, you need to go to <span class="iptv-link">cub.watch/iptv</span> and add a playlist from your provider.',
            uk: 'Щоб додати свій плейлист, вам необхідно перейти на сайт <span class="iptv-link">cub.watch/iptv</span> і додати плейлист від вашого провайдера.',
            be: 'Для таго каб дадаць свой плэйліст, вам неабходна перайсці на сайт <span class="iptv-link">cub.watch/iptv</span> і дадаць плэйліст ад вашага правайдэра.',
            zh: '要添加您的播放列表，您需要前往 <span class="iptv-link">cub.watch/iptv</span> 并添加来自您的提供商的播放列表。',
            pt: 'Para adicionar sua lista de reprodução, você precisa acessar <span class="iptv-link">cub.watch/iptv</span> e adicionar uma lista de reprodução do seu provedor.'
        },
        iptv_updated: {
            ru: 'Обновлено',
            en: 'Updated',
            uk: 'Оновлено',
            be: 'Абноўлена',
            zh: '更新',
            pt: 'Atualizada'
        },
        iptv_update: {
            ru: 'Обновление',
            en: 'Update',
            uk: 'Оновлення',
            be: 'Абнаўленне',
            zh: '更新',
            pt: 'Atualizar'
        },
        iptv_active: {
            ru: 'Активно',
            en: 'Actively',
            uk: 'Активно',
            be: 'Актыўна',
            zh: '积极地',
            pt: 'Ativamente'
        },
        iptv_yesterday: {
            ru: 'Вчера',
            en: 'Yesterday',
            uk: 'Вчора',
            be: 'Учора',
            zh: '昨天',
            pt: 'Ontem'
        },
        iptv_today: {
            ru: 'Сегодня',
            en: 'Today',
            uk: 'Сьогодні',
            be: 'Сёння',
            zh: '今天',
            pt: 'Hoje'
        },
        iptv_tomorrow: {
            ru: 'Завтра',
            en: 'Tomorrow',
            uk: 'Завтра',
            be: 'Заўтра',
            zh: '明天',
            pt: 'Amanhã'
        },
        iptv_loading: {
            ru: 'Метод загрузки',
            en: 'Download method',
            uk: 'Метод завантаження',
            be: 'Метад загрузкі',
            zh: '下载方式',
            pt: 'Método de download'
        },
        iptv_params_cub: {
            ru: 'CUB',
            en: 'CUB',
            uk: 'CUB',
            be: 'CUB',
            zh: 'CUB',
            pt: 'CUB'
        },
        iptv_params_lampa: {
            ru: 'Lampa',
            en: 'Lampa',
            uk: 'Lampa',
            be: 'Lampa',
            zh: 'Lampa',
            pt: 'Lampa'
        },
        iptv_remove_cache: {
            ru: 'Удалить кеш',
            en: 'Delete cache',
            uk: 'Видалити кеш',
            be: 'Выдаліць кэш',
            zh: '删除缓存',
            pt: 'Excluir cache'
        },
        iptv_remove_cache_descr: {
            ru: 'Удалить плейлист из кеша',
            en: 'Delete playlist from cache',
            uk: 'Видалити плейлист з кешу',
            be: 'Выдаліць плэйліст з кэшу',
            zh: '从缓存中删除播放列表',
            pt: 'Excluir lista de reprodução do cache'
        },
        iptv_params_always: {
            ru: 'Всегда',
            en: 'Always',
            uk: 'Завжди',
            be: 'Заўсёды',
            zh: '总是',
            pt: 'Sempre'
        },
        iptv_params_hour: {
            ru: 'Каждый час',
            en: 'Each hour',
            uk: 'Кожну годину',
            be: 'Кожную гадзіну',
            zh: '每小时',
            pt: 'Cada hora'
        },
        iptv_params_hour12: {
            ru: 'Каждые 12 часов',
            en: 'Every 12 hours',
            uk: 'Кожні 12 годин',
            be: 'Кожныя 12 гадзін',
            zh: '每12小时',
            pt: 'A cada 12 horas'
        },
        iptv_params_day: {
            ru: 'Ежедневно',
            en: 'Daily',
            uk: 'Щодня',
            be: 'Штодня',
            zh: '日常的',
            pt: 'Diário'
        },
        iptv_params_week: {
            ru: 'Еженедельно',
            en: 'Weekly',
            uk: 'Щотижня',
            be: 'Штотыдзень',
            zh: '每周',
            pt: 'Semanalmente'
        },
        iptv_params_none: {
            ru: 'Никогда',
            en: 'Never',
            uk: 'Ніколи',
            be: 'Ніколі',
            zh: '绝不',
            pt: 'Nunca'
        },
        iptv_update_app_title: {
            ru: 'Обновите приложение',
            en: 'Update the app',
            uk: 'Оновлення програми',
            be: 'Абнавіце дадатак',
            zh: '更新应用程序',
            pt: 'Atualize o aplicativo'
        },
        iptv_update_app_text: {
            ru: 'К сожалению, для работы плагина необходимо обновить вашу лампу путем ее перезагрузки. Она устарела и без этой процедуры плагин не будет функционировать.',
            en: 'Unfortunately, for the plugin to work, you need to update your lamp by rebooting it. It is outdated and without this procedure the plugin will not function.',
            uk: 'На жаль, для роботи плагіна необхідно оновити лампу шляхом її перезавантаження. Вона застаріла і без цієї процедури плагін не функціонуватиме.',
            be: 'Нажаль, для працы плагіна неабходна абнавіць вашу лямпу шляхам яе перазагрузкі. Яна састарэлая і без гэтай працэдуры плягін не будзе функцыянаваць.',
            zh: '不幸的是，要使插件正常工作，您需要通过重新启动来更新灯泡。 它已过时，如果没有此程序，插件将无法运行。',
            pt: 'Infelizmente, para que o plug-in funcione, você precisa atualizar sua lâmpada reiniciando-a. Está desatualizado e sem este procedimento o plugin não funcionará.'
        },
        iptv_param_sort_add: {
            ru: 'По добавлению',
            en: 'By addition',
            uk: 'За додаванням',
            be: 'Па даданні',
            zh: '按添加时间',
            pt: 'Por adição'
        },
        iptv_param_sort_name: {
            ru: 'По названию',
            en: 'By name',
            uk: 'За назвою',
            be: 'Па назве',
            zh: '按名称',
            pt: 'Por nome'
        },
        iptv_param_sort_view: {
            ru: 'По просмотрам',
            en: 'By views',
            uk: 'За переглядами',
            be: 'Па праглядах',
            zh: '按观看次数',
            pt: 'Por visualizações'
        },
        iptv_param_sort_favorite: {
            ru: 'Сортировать избранное',
            en: 'Sort by favorite',
            uk: 'Сортувати в обраному',
            be: 'Сартаваць па выбраным',
            zh: '按收藏排序',
            pt: 'Classificar por favoritos'
        },
        iptv_premium: {
            ru: 'Доступ к некоторым функциям возможен только при наличии подписки <b>CUB Premium</b>',
            en: 'Some features are only available with a <b>CUB Premium</b> subscription',
            uk: 'Доступ до деяких функцій можливий лише за наявності передплати <b>CUB Premium</b>',
            be: 'Доступ да некаторых функцый магчымы толькі пры наяўнасці падпіскі <b>CUB Premium</b>',
            zh: '某些功能仅适用于 <b>CUB Premium</b> 订阅',
            pt: 'Alguns recursos estão disponíveis apenas com uma assinatura <b>CUB Premium</b>'
        }
    })

    Lampa.Template.add('cub_iptv_content', `
        <div class="iptv-content">
            <div class="iptv-content__menu"></div>
            <div class="iptv-content__channels"></div>
            <div class="iptv-content__details"></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_menu', `
        <div class="iptv-menu">
            <div class="iptv-menu__body">
                <div class="iptv-menu__title"></div>
                <div class="iptv-menu__list"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_channels', `
        <div class="iptv-channels">
            
        </div>
    `)

    Lampa.Template.add('cub_iptv_details', `
        <div class="iptv-details layer--wheight">
            <div class="iptv-details__play"></div>
            <div class="iptv-details__title"></div>

            <div class="iptv-details__program">

            </div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_details_empty', `
        <div class="iptv-details-epmty endless endless-up">
            <div><span></span><span style="width: 60%"></span></div>
            <div><span></span><span style="width: 70%"></span></div>
            <div><span></span><span style="width: 40%"></span></div>
            <div><span></span><span style="width: 55%"></span></div>
            <div><span></span><span style="width: 30%"></span></div>
            <div><span></span><span style="width: 55%"></span></div>
            <div><span></span><span style="width: 30%"></span></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_playlist_item', `
        <div class="iptv-playlist-item selector layer--visible layer--render">
            <div class="iptv-playlist-item__body">
                <div class="iptv-playlist-item__name">
                    <div class="iptv-playlist-item__name-ico"><span></span></div>
                    <div class="iptv-playlist-item__name-text">est</div>
                </div>
                <div class="iptv-playlist-item__url"></div>
            </div>

            <div class="iptv-playlist-item__footer hide">
                <div class="iptv-playlist-item__details details-left"></div>
                <div class="iptv-playlist-item__details details-right"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_list', `
        <div class="iptv-list layer--wheight">
            <div class="iptv-list__ico">
                <svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>
                    <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="iptv-list__title"></div>
            <div class="iptv-list__text"></div>
            <div class="iptv-list__items"></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_list_empty', `
        <div class="iptv-list-empty selector">
            <div class="iptv-list-empty__text"></div>
        </div>
    `)

    Lampa.Template.add('cub_iptv_param_lock', `
        <div class="iptv-param-lock">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 401.998 401.998" xml:space="preserve"><path d="M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z" fill="currentColor"></path></svg>
        </div>
    `)

    Lampa.Template.add('cub_iptv_style', `
        <style>
        @@include('../plugins/iptv/css/style.css')
        </style>
    `)

    Lampa.Settings.listener.follow('open', function (e) {
        if(e.name == 'iptv'){
            if(!Lampa.Account.hasPremium()){
                let body = e.body.find('.scroll__body > div')

                let info = $(`<div class="settings-param selector" data-type="button" data-static="true">
                    <div class="settings-param__name">${Lampa.Lang.translate('account_premium_more')}</div>
                    <div class="settings-param__descr">${Lampa.Lang.translate('iptv_premium')}</div>
                </div>`)

                info.on('hover:enter',Lampa.Account.showCubPremium)

                body.prepend('<div class="settings-param-title"><span>'+Lampa.Lang.translate('title_settings')+'</span></div>')

                body.prepend(info)
            }
        }
    })


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
            if(window.lampa_settings.iptv) return Lampa.Activity.active().activity.component().playlist()

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

            $('.navigation-bar__body [data-action="main"]').unbind().on('click',()=>{
                Lampa.Activity.active().activity.component().playlist()
            })

            $('.navigation-bar__body [data-action="search"]').addClass('hide')
        } 

        
        Lampa.SettingsApi.addComponent({
            component: 'iptv',
            icon: `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>
                <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
            name: 'IPTV'
        })

        Lampa.SettingsApi.addParam({
            component: 'iptv',
            param: {
                name: 'iptv_favotite_sort',
                type: 'select',
                values: {
                    add: '#{iptv_param_sort_add}',
                    name: '#{iptv_param_sort_name}',
                    view: '#{iptv_param_sort_view}'
                },
                default: 'add'
            },
            field: {
                name: Lampa.Lang.translate('iptv_param_sort_favorite'),
            },
            onRender: (item)=>{
                if(!Lampa.Account.hasPremium()){
                    item.removeClass('selector')
                    
                    item.append(Lampa.Template.get('cub_iptv_param_lock'))
                }
            },
            onChange: ()=>{

            }
        })
    }

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