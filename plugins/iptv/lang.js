function init(){
    let domain = Lampa.Manifest.cub_domain
    
    Lampa.Lang.add({
        iptv_noprogram: {
            ru: 'Нет программы',
            en: 'No program',
            uk: 'Немає програми',
            be: 'Няма праграмы',
            zh: '没有节目',
            pt: 'Nenhum programa',
            bg: 'Няма програми'
        },
        iptv_noload_playlist: {
            ru: 'К сожалению, загрузка плейлиста не удалась. Возможно, ваш провайдер заблокировал загрузку из внешних источников.',
            en: 'Unfortunately, the playlist download failed. Your ISP may have blocked downloads from external sources.',
            uk: 'На жаль, завантаження плейлиста не вдалося. Можливо, ваш провайдер заблокував завантаження із зовнішніх джерел.',
            be: 'Нажаль, загрузка плэйліста не атрымалася. Магчыма, ваш правайдэр заблакаваў загрузку са знешніх крыніц.',
            zh: '不幸的是，播放列表下载失败。 您的 ISP 可能已阻止从外部来源下载。',
            pt: 'Infelizmente, o download da lista de reprodução falhou. Seu ISP pode ter bloqueado downloads de fontes externas.',
            bg: 'За съжаление, свалянето на плейлистата се провали. Вашит доставчик може да блокира сваляне от външни източници.'
        },
        iptv_select_playlist: {
            ru: 'Выберите плейлист',
            en: 'Choose a playlist',
            uk: 'Виберіть плейлист',
            be: 'Выберыце плэйліст',
            zh: '选择一个播放列表',
            pt: 'Escolha uma lista de reprodução',
            bg: 'Изберете плейлист'
        },
        iptv_all_channels: {
            ru: 'Все каналы',
            en: 'All channels',
            uk: 'Усі канали',
            be: 'Усе каналы',
            zh: '所有频道',
            pt: 'Todos os canais',
            bg: 'Всички канали'
        },
        iptv_add_fav: {
            ru: 'Добавить в избранное',
            en: 'Add to favorites',
            uk: 'Додати в обране',
            be: 'Дадаць у абранае',
            zh: '添加到收藏夹',
            pt: 'Adicionar aos favoritos',
            bg: 'Добави в избрани'
        },
        iptv_remove_fav: {
            ru: 'Убрать из избранного',
            en: 'Remove from favorites',
            uk: 'Прибрати з вибраного',
            be: 'Прыбраць з абранага',
            zh: '从收藏夹中删除',
            pt: 'Remover dos favoritos',
            bg: 'Премахни от избрани'
        },
        iptv_playlist_empty: {
            ru: 'К сожалению, на данный момент вы не добавили ни одного плейлиста. Чтобы начать просмотр контента, пожалуйста, перейдите на страницу <span class="iptv-link">'+domain+'/iptv</span> и добавьте хотя бы один плейлист.',
            en: 'Sorry, you haven\'t added any playlist yet. To start watching content, please go to <span class="iptv-link">'+domain+'/iptv</span> and add at least one playlist.',
            uk: 'На жаль, на даний момент ви не додали жодного плейлиста. Щоб розпочати перегляд контенту, будь ласка, перейдіть на сторінку <span class="iptv-link">'+domain+'/iptv</span> і додайте хоча б один плейлист.',
            be: 'Нажаль, на дадзены момант вы не дадалі ніводнага плэйліста. Каб пачаць прагляд кантэнту, калі ласка, перайдзіце на старонку <span class="iptv-link">'+domain+'/iptv</span> і дадайце хаця б адзін плэйліст.',
            zh: '抱歉，您还没有添加任何播放列表。 要开始观看内容，请转到 <span class="iptv-link">'+domain+'/iptv</span> 并添加至少一个播放列表。',
            pt: 'Desculpe, você ainda não adicionou nenhuma lista de reprodução. Para começar a assistir o conteúdo, acesse <span class="iptv-link">'+domain+'/iptv</span> e adicione pelo menos uma lista de reprodução.',
            bg: 'Съжалявам, още не сте добавили никаква листа. За да почнете да гледате, моля идете на <span class="iptv-link">'+domain+'/iptv</span> и добавете поне една листа.'
        },
        iptv_select_playlist_text: {
            ru: 'Для того чтобы добавить свой плейлист, вам необходимо перейти на сайт <span class="iptv-link">'+domain+'/iptv</span> и добавить плейлист от вашего провайдера.',
            en: 'In order to add your playlist, you need to go to <span class="iptv-link">'+domain+'/iptv</span> and add a playlist from your provider.',
            uk: 'Щоб додати свій плейлист, вам необхідно перейти на сайт <span class="iptv-link">'+domain+'/iptv</span> і додати плейлист від вашого провайдера.',
            be: 'Для таго каб дадаць свой плэйліст, вам неабходна перайсці на сайт <span class="iptv-link">'+domain+'/iptv</span> і дадаць плэйліст ад вашага правайдэра.',
            zh: '要添加您的播放列表，您需要前往 <span class="iptv-link">'+domain+'/iptv</span> 并添加来自您的提供商的播放列表。',
            pt: 'Para adicionar sua lista de reprodução, você precisa acessar <span class="iptv-link">'+domain+'/iptv</span> e adicionar uma lista de reprodução do seu provedor.',
            bg: 'За да добавите ваша листа, трябва да отидете на <span class="iptv-link">'+domain+'/iptv</span> и да добавите листа от вашият доставчик на телевизия.'
        },
        iptv_updated: {
            ru: 'Обновлено',
            en: 'Updated',
            uk: 'Оновлено',
            be: 'Абноўлена',
            zh: '更新',
            pt: 'Atualizada',
            bg: 'Обновено'
        },
        iptv_update: {
            ru: 'Обновление',
            en: 'Update',
            uk: 'Оновлення',
            be: 'Абнаўленне',
            zh: '更新',
            pt: 'Atualizar',
            bg: 'Обновяване'
        },
        iptv_active: {
            ru: 'Активно',
            en: 'Actively',
            uk: 'Активно',
            be: 'Актыўна',
            zh: '积极地',
            pt: 'Ativamente',
            bg: 'Активно'
        },
        iptv_yesterday: {
            ru: 'Вчера',
            en: 'Yesterday',
            uk: 'Вчора',
            be: 'Учора',
            zh: '昨天',
            pt: 'Ontem',
            bg: 'Вчера'
        },
        iptv_today: {
            ru: 'Сегодня',
            en: 'Today',
            uk: 'Сьогодні',
            be: 'Сёння',
            zh: '今天',
            pt: 'Hoje',
            bg: 'Днес'
        },
        iptv_tomorrow: {
            ru: 'Завтра',
            en: 'Tomorrow',
            uk: 'Завтра',
            be: 'Заўтра',
            zh: '明天',
            pt: 'Amanhã',
            bg: 'Утре'
        },
        iptv_loading: {
            ru: 'Метод загрузки',
            en: 'Download method',
            uk: 'Метод завантаження',
            be: 'Метад загрузкі',
            zh: '下载方式',
            pt: 'Método de download',
            bg: 'Метод на зареждане'
        },
        iptv_params_cub: {
            ru: 'CUB',
            en: 'CUB',
            uk: 'CUB',
            be: 'CUB',
            zh: 'CUB',
            pt: 'CUB',
            bg: 'CUB'
        },
        iptv_params_lampa: {
            ru: 'Lampa',
            en: 'Lampa',
            uk: 'Lampa',
            be: 'Lampa',
            zh: 'Lampa',
            pt: 'Lampa',
            bg: 'Lampa'
        },
        iptv_remove_cache: {
            ru: 'Удалить кеш',
            en: 'Delete cache',
            uk: 'Видалити кеш',
            be: 'Выдаліць кэш',
            zh: '删除缓存',
            pt: 'Excluir cache',
            bg: 'Изтриване на кеш'
        },
        iptv_remove_cache_descr: {
            ru: 'Удалить плейлист из кеша',
            en: 'Delete playlist from cache',
            uk: 'Видалити плейлист з кешу',
            be: 'Выдаліць плэйліст з кэшу',
            zh: '从缓存中删除播放列表',
            pt: 'Excluir lista de reprodução do cache',
            bg: 'Изтрий плейлиста от кеша'
        },
        iptv_params_always: {
            ru: 'Всегда',
            en: 'Always',
            uk: 'Завжди',
            be: 'Заўсёды',
            zh: '总是',
            pt: 'Sempre',
            bg: 'Винаги'
        },
        iptv_params_hour: {
            ru: 'Каждый час',
            en: 'Each hour',
            uk: 'Кожну годину',
            be: 'Кожную гадзіну',
            zh: '每小时',
            pt: 'Cada hora',
            bg: 'Всеки час'
        },
        iptv_params_hour12: {
            ru: 'Каждые 12 часов',
            en: 'Every 12 hours',
            uk: 'Кожні 12 годин',
            be: 'Кожныя 12 гадзін',
            zh: '每12小时',
            pt: 'A cada 12 horas',
            bg: 'Всеки 12 часа'
        },
        iptv_params_day: {
            ru: 'Ежедневно',
            en: 'Daily',
            uk: 'Щодня',
            be: 'Штодня',
            zh: '日常的',
            pt: 'Diário',
            bg: 'Ежедневно'
        },
        iptv_params_week: {
            ru: 'Еженедельно',
            en: 'Weekly',
            uk: 'Щотижня',
            be: 'Штотыдзень',
            zh: '每周',
            pt: 'Semanalmente',
            bg: 'Седмично'
        },
        iptv_params_none: {
            ru: 'Никогда',
            en: 'Never',
            uk: 'Ніколи',
            be: 'Ніколі',
            zh: '绝不',
            pt: 'Nunca',
            bg: 'Никога'
        },
        iptv_update_app_title: {
            ru: 'Обновите приложение',
            en: 'Update the app',
            uk: 'Оновлення програми',
            be: 'Абнавіце дадатак',
            zh: '更新应用程序',
            pt: 'Atualize o aplicativo',
            bg: 'Обновни приложение'
        },
        iptv_update_app_text: {
            ru: 'К сожалению, для работы плагина необходимо обновить вашу лампу путем ее перезагрузки. Она устарела и без этой процедуры плагин не будет функционировать.',
            en: 'Unfortunately, for the plugin to work, you need to update your lamp by rebooting it. It is outdated and without this procedure the plugin will not function.',
            uk: 'На жаль, для роботи плагіна необхідно оновити лампу шляхом її перезавантаження. Вона застаріла і без цієї процедури плагін не функціонуватиме.',
            be: 'Нажаль, для працы плагіна неабходна абнавіць вашу лямпу шляхам яе перазагрузкі. Яна састарэлая і без гэтай працэдуры плягін не будзе функцыянаваць.',
            zh: '不幸的是，要使插件正常工作，您需要通过重新启动来更新灯泡。 它已过时，如果没有此程序，插件将无法运行。',
            pt: 'Infelizmente, para que o plug-in funcione, você precisa atualizar sua lâmpada reiniciando-a. Está desatualizado e sem este procedimento o plugin não funcionará.',
            bg: 'За съжаление, за да работи добавка, трябва да обновите вашата Lampa и да я рестартирате. Приложението не е актуално и без тази процедура добавката не може да работи'
        },
        iptv_param_sort_add: {
            ru: 'По добавлению',
            en: 'By addition',
            uk: 'За додаванням',
            be: 'Па даданні',
            zh: '按添加时间',
            pt: 'Por adição',
            bg: 'По добавяне'
        },
        iptv_param_sort_name: {
            ru: 'По названию',
            en: 'By name',
            uk: 'За назвою',
            be: 'Па назве',
            zh: '按名称',
            pt: 'Por nome',
            bg: 'По име'
        },
        iptv_param_sort_view: {
            ru: 'По просмотрам',
            en: 'By views',
            uk: 'За переглядами',
            be: 'Па праглядах',
            zh: '按观看次数',
            pt: 'Por visualizações',
            bg: 'По прегледи'
        },
        iptv_param_sort_favorite: {
            ru: 'Сортировать избранное',
            en: 'Sort by favorite',
            uk: 'Сортувати в обраному',
            be: 'Сартаваць па выбраным',
            zh: '按收藏排序',
            pt: 'Classificar por favoritos',
            bg: 'Сортиране по избрани'
        },
        iptv_premium: {
            ru: 'Доступ к некоторым функциям возможен только при наличии подписки <b>CUB Premium</b>',
            en: 'Some features are only available with a <b>CUB Premium</b> subscription',
            uk: 'Доступ до деяких функцій можливий лише за наявності передплати <b>CUB Premium</b>',
            be: 'Доступ да некаторых функцый магчымы толькі пры наяўнасці падпіскі <b>CUB Premium</b>',
            zh: '某些功能仅适用于 <b>CUB Premium</b> 订阅',
            pt: 'Alguns recursos estão disponíveis apenas com uma assinatura <b>CUB Premium</b>',
            bg: 'Достъпът до някои функции е наличен само чрез <b>CUB Premium</b> абонамент'
        },
        iptv_param_save_favorite: {
            ru: 'Метод хранения избранного',
            en: 'Favorite storage method',
            uk: 'Спосіб зберігання обраного',
            be: 'Метад захоўвання абранага',
            zh: '收藏存储方法',
            pt: 'Método de armazenamento favorito',
            bg: 'Начин на сърханение на фаворити'
        },
        iptv_param_save_favorite_url: {
            ru: 'По адресу канала',
            en: 'By channel URL',
            uk: 'За URL-адресою каналу',
            be: 'Па URL-адрэсе канала',
            zh: '按频道网址',
            pt: 'Por URL do canal',
            bg: 'По URL на канала'
        },
        iptv_param_save_favorite_name: {
            ru: 'По названию канала',
            en: 'By channel name',
            uk: 'За назвою каналу',
            be: 'Па назве канала',
            zh: '按频道名称',
            pt: 'Por nome do canal',
            bg: 'По име на канала'
        },
        iptv_param_use_db: {
            ru: 'Использовать базу данных',
            en: 'Use database',
            uk: 'Використовувати базу даних',
            be: 'Выкарыстоўваць базу дадзеных',
            zh: '使用数据库',
            pt: 'Utilizar banco de dados',
            bg: 'Използвайки база данни'
        },
        iptv_param_guide: {
            ru: 'Телегид',
            en: 'TV Guide',
            uk: 'Телегід',
            be: 'Тэлегід',
            zh: '电视指南',
            pt: 'Guia de TV',
            bg: 'Телевизионен справочник'
        },
        iptv_search_no_result: {
            ru: 'Нет результатов по запросу',
            en: 'No results found',
            uk: 'Немає результатів за запитом',
            be: 'Няма вынікаў па запыце',
            zh: '未找到结果',
            pt: 'Nenhum resultado encontrado',
            bg: 'Няма намерени резултати'
        },
        iptv_guide_status_update_wait: {
            ru: 'Идет процесс обновления, подождите...',
            en: 'Updating process in progress, please wait...',
            uk: 'Йде процес оновлення, зачекайте...',
            be: 'Ідзе працэс абнаўлення, калі ласка, пачакайце...',
            zh: '更新过程正在进行，请稍等...',
            pt: 'Processo de atualização em andamento, aguarde...',
            bg: 'Процесът на актуализация е в ход, моля изчакайте...'
        },
        iptv_guide_status_update: {
            ru: 'Идет обновление',
            en: 'Update in progress',
            uk: 'Йде оновлення',
            be: 'Ідзе абнаўленне',
            zh: '更新进行中',
            pt: 'Atualização em andamento',
            bg: 'Актуализация в ход'
        },
        iptv_guide_status_parsing: {
            ru: 'Парсинг',
            en: 'Parsing',
            uk: 'Аналіз',
            be: 'Аналіз',
            zh: '解析中',
            pt: 'Analisando',
            bg: 'Анализ'
        },
        iptv_guide_status_finish: {
            ru: 'Статус последнего обновления',
            en: 'Status of the last update',
            uk: 'Статус останнього оновлення',
            be: 'Статус апошняга абнаўлення',
            zh: '最后更新状态',
            pt: 'Estado da última atualização',
            bg: 'Състояние на последното обновление'
        },
        iptv_guide_status_channels: {
            ru: 'Каналов',
            en: 'Channels',
            uk: 'Каналів',
            be: 'Каналаў',
            zh: '频道',
            pt: 'Canais',
            bg: 'Канали'
        },
        iptv_guide_status_date: {
            ru: 'обновлено',
            en: 'updated',
            uk: 'оновлено',
            be: 'абноўлена',
            zh: '已更新',
            pt: 'atualizado',
            bg: 'обновено'
        },
        iptv_guide_status_noupdates: {
            ru: 'Еще нет обновлений',
            en: 'No updates yet',
            uk: 'Ще немає оновлень',
            be: 'Яшчэ няма абнаўленняў',
            zh: '暂无更新',
            pt: 'Ainda sem atualizações',
            bg: 'Все още няма актуализации'
        },
        iptv_guide_error_link: {
            ru: 'Укажите ссылку на телегид',
            en: 'Specify the TV guide link',
            uk: 'Вкажіть посилання на телегід',
            be: 'Пакажыце спасылку на тэлегід',
            zh: '请指定电视指南链接',
            pt: 'Indique o link do guia de TV',
            bg: 'Посочете връзката към телегида'
        },
        iptv_param_guide_custom_title: {
            ru: 'Использовать свою ссылку',
            en: 'Use your own link',
            uk: 'Використовуйте своє посилання',
            be: 'Выкарыстоўвайце сваю спасылку',
            zh: '使用您自己的链接',
            pt: 'Use seu próprio link',
            bg: 'Използвайте своята връзка'
        },
        iptv_param_guide_custom_descr: {
            ru: 'Укажите свою ссылку на телегид, если не хотите использовать телегид от CUB',
            en: 'Specify your TV guide link if you do not want to use the CUB TV guide',
            uk: 'Вкажіть своє посилання на телегід, якщо ви не хочете використовувати телегід від CUB',
            be: 'Пакажыце сваю спасылку на тэлегід, калі вы не хочаце выкарыстоўваць тэлегід ад CUB',
            zh: '如果您不想使用CUB电视指南，请指定您的电视指南链接',
            pt: 'Especifique seu link do guia de TV se não quiser usar o guia de TV da CUB',
            bg: 'Уточнете своята връзка към телегида, ако не искате да използвате този на CUB'
        },
        iptv_param_guide_url_descr: {
            ru: 'Укажите свою ссылку на телегид EPG',
            en: 'Specify your EPG TV guide link',
            uk: 'Вкажіть своє посилання на телегід EPG',
            be: 'Пакажыце сваю спасылку на тэлегід EPG',
            zh: '请指定您的电视指南EPG链接',
            pt: 'Especifique seu link do guia de TV EPG',
            bg: 'Уточнете своята връзка към телегида EPG'
        },
        iptv_param_guide_interval_title: {
            ru: 'Интервал обновления',
            en: 'Update Interval',
            uk: 'Інтервал оновлення',
            be: 'Інтэрвал абнаўлення',
            zh: '更新间隔',
            pt: 'Intervalo de atualização',
            bg: 'Интервал за актуализация'
        },
        iptv_param_guide_interval_descr: {
            ru: 'Через сколько часов обновлять телегид',
            en: 'How many hours to update the TV guide',
            uk: 'Через скільки годин оновлювати телегід',
            be: 'Праз колькі гадзін абнаўляць тэлегід',
            zh: '多少小时更新电视指南',
            pt: 'Quantas horas para atualizar o guia de TV',
            bg: 'През колко часа да актуализира телевизионния справочник'
        },
        iptv_param_guide_update_after_start: {
            ru: 'Обновить при запуске приложения',
            en: 'Update on application startup',
            uk: 'Оновити при запуску додатка',
            be: 'Абнавіць пры запуску прыкладання',
            zh: '启动应用时更新',
            pt: 'Atualizar ao iniciar o aplicativo',
            bg: 'Актуализация при стартиране на приложението'
        },
        iptv_param_guide_update_now: {
            ru: 'Обновить телегид',
            en: 'Update TV Guide Now',
            uk: 'Оновити телегід зараз',
            be: 'Абнавіць тэлегід зараз',
            zh: '立即更新电视指南',
            pt: 'Atualizar guia de TV agora',
            bg: 'Актуализирайте телевизионния справочник сега'
        },
        iptv_param_guide_save_title: {
            ru: 'Число дней хранения',
            en: 'Number of Days to Keep',
            uk: 'Кількість днів зберігання',
            be: 'Колькасць дзён захоўвання',
            zh: '保存天数',
            pt: 'Número de dias para manter',
            bg: 'Брой дни за запазване'
        },
        iptv_param_guide_save_descr: {
            ru: 'Сколько дней хранить телегид в кэше',
            en: 'How many days to keep the TV guide in the cache',
            uk: 'Скільки днів зберігати телегід у кеші',
            be: 'Колькі дзён захоўваць тэлегід у кэшы',
            zh: '在缓存中保存多少天的电视指南',
            pt: 'Quantos dias manter o guia de TV no cache',
            bg: 'За колко дни да се запази телевизионния справочник в кеша'
        },
        iptv_param_guide_update_custom: {
            ru: 'Вручную',
            en: 'Manual',
            uk: 'Вручну',
            be: 'Адзіначку',
            zh: '手动',
            pt: 'Manual',
            bg: 'Ръчно'
        },
        iptv_need_update_app: {
            ru: 'Обновите приложение до последней версии',
            en: 'Update the application to the latest version',
            uk: 'Оновіть програму до останньої версії',
            be: 'Абновіце прыкладанне да апошняй версіі',
            zh: '升级应用程序到最新版本',
            pt: 'Atualize o aplicativo para a versão mais recente',
            bg: 'Актуализирайте приложението до последната версия'
        },
        iptv_channel_lock: {
            ru: 'Заблокировать',
            en: 'Lock',
            uk: 'Заблокувати',
            be: 'Заблакаваць',
            zh: '锁定',
            pt: 'Bloquear',
            bg: 'Заключване'
        },
        iptv_channel_unlock: {
            ru: 'Разблокировать',
            en: 'Unlock',
            uk: 'Розблокувати',
            be: 'Разблакаваць',
            zh: '解锁',
            pt: 'Desbloquear',
            bg: 'Отключване'
        },
        iptv_about_text: {
            ru: 'Удобное приложение IPTV – откройте доступ к множеству каналов, фильмам и сериалам прямо на вашем телевизоре. Интуитивный интерфейс, легкая навигация, и безграничные возможности развлечений на вашем большом экране. Ваш личный портал в мир цифрового телевидения!',
            en: 'Convenient IPTV application - access a variety of channels, movies, and series directly on your television. Intuitive interface, easy navigation, and unlimited entertainment possibilities on your big screen. Your personal portal to the world of digital television!',
            uk: 'Зручний додаток IPTV - отримайте доступ до безлічі каналів, фільмів і серіалів прямо на вашому телевізорі. Інтуїтивний інтерфейс, легка навігація та необмежені можливості розваг на вашому великому екрані. Ваш особистий портал у світ цифрового телебачення!',
            be: 'Зручнае прыкладанне IPTV - атрымайце доступ да шматліканальнага тэлебачання, фільмаў і серыялаў проста на вашым тэлевізары. Інтуітыўны інтэрфейс, лёгкая навігацыя і неабмежаваныя магчымасці разваг на вашым вялікім экране. Ваш асабісты партал у свет цыфравага тэлебачання!',
            zh: '方便的IPTV应用程序-直接在您的电视上访问各种频道，电影和系列。直观的界面，简单的导航以及在您的大屏幕上无限的娱乐可能性。您数字电视世界的个人门户！',
            pt: 'Aplicativo IPTV conveniente - acesse uma variedade de canais, filmes e séries diretamente na sua televisão. Interface intuitiva, navegação fácil e possibilidades de entretenimento ilimitadas na sua tela grande. Seu portal pessoal para o mundo da televisão digital!',
            bg: 'Удобно приложение за IPTV - отворете достъп до множество канали, филми и сериали директно на вашия телевизор. Интуитивен интерфейс, лесна навигация и неограничени възможности за забавления на големия ви екран. Вашият личен портал към света на цифровата телевизия!'
        }
    })
}

export default {
    init
}