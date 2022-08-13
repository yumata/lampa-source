import Online from './component'

if(!Lampa.Lang){
    let lang_data = {}

    Lampa.Lang = {
        add: (data)=>{
            lang_data = data
        },
        translate: (key)=>{
            return lang_data[key] ? lang_data[key].ru : key
        }
    }
}

Lampa.Lang.add({
    online_nolink: {
        ru: 'Не удалось извлечь ссылку',
        uk: 'Неможливо отримати посилання',
        en: 'Failed to fetch link',
        zh: '获取链接失败'
    },
    online_waitlink: {
        ru: 'Работаем над извлечением ссылки, подождите...',
        uk: 'Працюємо над отриманням посилання, зачекайте...',
        en: 'Working on extracting the link, please wait...',
        zh: '正在提取链接，请稍候...'
    },
    online_balanser: {
        ru: 'Балансер',
        uk: 'Балансер',
        en: 'Balancer',
        zh: '平衡器'
    },
    helper_online_file: {
        ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
        uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
        en: 'Hold the "OK" key to bring up the context menu',
        zh: '按住“确定”键调出上下文菜单'
    },
    online_query_start: {
        ru: 'По запросу',
        uk: 'На запит',
        en: 'On request',
        zh: '根据要求'
    },
    online_query_end: {
        ru: 'нет результатов',
        uk: 'немає результатів',
        en: 'no results',
        zh: '没有结果'
    },
    title_online: {
        ru: 'Онлайн',
        uk: 'Онлайн',
        en: 'Online',
        zh: '在线的'
    },
    title_proxy: {
        ru: 'Прокси',
        uk: 'Проксі',
        en: 'Proxy',
        zh: '代理人'
    },
    online_proxy_title: {
        ru: 'Основной прокси',
        uk: 'Основний проксі',
        en: 'Main proxy',
        zh: '主要代理'
    },
    online_proxy_descr:{
        ru: 'Будет использоваться для всех балансеров',
        uk: 'Використовуватиметься для всіх балансерів',
        en: 'Will be used for all balancers',
        zh: '将用于所有平衡器'
    },
    online_proxy_placeholder: {
        ru: 'Например: http://proxy.com',
        uk: 'Наприклад: http://proxy.com',
        en: 'For example: http://proxy.com',
        zh: '例如：http://proxy.com'
    },
    filmix_param_add_title: {
        ru: 'Добавить ТОКЕН от Filmix',
        uk: 'Додати ТОКЕН від Filmix',
        en: 'Add TOKEN from Filmix',
        zh: '从 Filmix 添加 TOKEN'
    },
    filmix_param_add_descr: {
        ru: 'Добавьте ТОКЕН для подключения подписки',
        uk: 'Додайте ТОКЕН для підключення передплати',
        en: 'Add a TOKEN to connect a subscription',
        zh: '添加 TOKEN 以连接订阅'
    },
    filmix_param_placeholder: {
        ru: 'Например: nxjekeb57385b..',
        uk: 'Наприклад: nxjekeb57385b..',
        en: 'For example: nxjekeb57385b..',
        zh: '例如：nxjekeb57385b..'
    },
    filmix_param_add_device: {
        ru: 'Добавить устройство на Filmix',
        uk: 'Додати пристрій на Filmix',
        en: 'Add Device to Filmix',
        zh: '将设备添加到 Filmix'
    },
    filmix_modal_text: {
        ru: 'Введите его на странице https://filmix.ac/consoles в вашем авторизованном аккаунте!',
        uk: 'Введіть його на сторінці https://filmix.ac/consoles у вашому авторизованому обліковому записі!',
        en: 'Enter it at https://filmix.ac/consoles in your authorized account!',
        zh: '在您的授权帐户中的 https://filmix.ac/consoles 中输入！'
    },
    filmix_modal_wait: {
        ru: 'Ожидаем код',
        uk: 'Очікуємо код',
        en: 'Waiting for the code',
        zh: '我们正在等待代码'
    },
    filmix_copy_secuses: {
        ru: 'Код скопирован в буфер обмена',
        uk: 'Код скопійовано в буфер обміну',
        en: 'Code copied to clipboard',
        zh: '代码复制到剪贴板'
    },
    filmix_copy_fail: {
        ru: 'Ошибка при копировании',
        uk: 'Помилка при копіюванні',
        en: 'Copy error',
        zh: '复制错误'
    },
    filmix_nodevice: {
        ru: 'Устройство не авторизовано',
        uk: 'Пристрій не авторизований',
        en: 'Device not authorized',
        zh: '设备未授权'
    },
    title_status: {
        ru: 'Статус',
        uk: 'Статус',
        en: 'Status',
        zh: '地位'
    },
    online_voice_subscribe: {
        ru: 'Подписаться на перевод',
        uk: 'Підписатися на переклад',
        en: 'Subscribe to translation',
        zh: '订阅翻译'
    },
    online_voice_success: {
        ru: 'Вы успешно подписались',
        uk: 'Ви успішно підписалися',
        en: 'You have successfully subscribed',
        zh: '您已成功订阅'
    },
    online_voice_error: {
        ru: 'Возникла ошибка',
        uk: 'Виникла помилка',
        en: 'An error has occurred',
        zh: '发生了错误'
    }
})

function resetTemplates(){
    Lampa.Template.add('online',`<div class="online selector">
        <div class="online__body">
            <div style="position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em">
                <svg style="height: 2.4em; width:  2.4em;" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="64" cy="64" r="56" stroke="white" stroke-width="16"/>
                    <path d="M90.5 64.3827L50 87.7654L50 41L90.5 64.3827Z" fill="white"/>
                </svg>
            </div>
            <div class="online__title" style="padding-left: 2.1em;">{title}</div>
            <div class="online__quality" style="padding-left: 3.4em;">{quality}{info}</div>
        </div>
    </div>`)

    Lampa.Template.add('online_folder',`<div class="online selector">
        <div class="online__body">
            <div style="position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em">
                <svg style="height: 2.4em; width:  2.4em;" viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="20" width="128" height="92" rx="13" fill="white"/>
                    <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"/>
                    <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"/>
                </svg>
            </div>
            <div class="online__title" style="padding-left: 2.1em;">{title}</div>
            <div class="online__quality" style="padding-left: 3.4em;">{quality}{info}</div>
        </div>
    </div>`)
}


const button = `<div class="full-start__button selector view--online" data-subtitle="v1.54">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
    <g xmlns="http://www.w3.org/2000/svg">
        <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" fill="currentColor"/>
        <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" fill="currentColor"/>
    </g></svg>

    <span>#{title_online}</span>
    </div>`

// нужна заглушка, а то при страте лампы говорит пусто
Lampa.Component.add('online', Online)

//то же самое
resetTemplates()

Lampa.Listener.follow('full',(e)=>{
    if(e.type == 'complite'){
        let btn = $(Lampa.Lang.translate(button))

        btn.on('hover:enter',()=>{
            resetTemplates()

            Lampa.Component.add('online', Online)

            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_online'),
                component: 'online',
                search: e.data.movie.title,
                search_one: e.data.movie.title,
                search_two: e.data.movie.original_title,
                movie: e.data.movie,
                page: 1
            })
        })

        e.object.activity.render().find('.view--torrent').after(btn)
    }
})


///////ONLINE/////////

Lampa.Params.select('online_proxy_all','','')
Lampa.Params.select('online_proxy_videocdn','','')
Lampa.Params.select('online_proxy_rezka','','')
Lampa.Params.select('online_proxy_kinobase','','')
Lampa.Params.select('online_proxy_collaps','','')
Lampa.Params.select('online_proxy_cdnmovies','','')

Lampa.Template.add('settings_proxy',`<div>
    <div class="settings-param selector" data-type="input" data-name="online_proxy_all" placeholder="#{online_proxy_placeholder}">
        <div class="settings-param__name">#{online_proxy_title}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{online_proxy_descr}</div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="online_proxy_videocdn" placeholder="#{online_proxy_placeholder}">
        <div class="settings-param__name">Videocdn</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="online_proxy_rezka" placeholder="#{online_proxy_placeholder}">
        <div class="settings-param__name">Rezka</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="online_proxy_kinobase" placeholder="#{online_proxy_placeholder}">
        <div class="settings-param__name">Kinobase</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="online_proxy_collaps" placeholder="#{online_proxy_placeholder}">
        <div class="settings-param__name">Collaps</div>
        <div class="settings-param__value"></div>
    </div>

    <div class="settings-param selector" data-type="input" data-name="online_proxy_cdnmovies" placeholder="#{online_proxy_placeholder}">
        <div class="settings-param__name">Cdnmovies</div>
        <div class="settings-param__value"></div>
    </div>
</div>`)

Lampa.Listener.follow('app', function (e) {
    if(e.type =='ready' && Lampa.Settings.main && !Lampa.Settings.main().render().find('[data-component="proxy"]').length){
        let field = $(Lampa.Lang.translate(`<div class="settings-folder selector" data-component="proxy">
            <div class="settings-folder__icon">
                <svg height="46" viewBox="0 0 42 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="26.5" width="39" height="18" rx="1.5" stroke="white" stroke-width="3"/>
                <circle cx="9.5" cy="35.5" r="3.5" fill="white"/>
                <circle cx="26.5" cy="35.5" r="2.5" fill="white"/>
                <circle cx="32.5" cy="35.5" r="2.5" fill="white"/>
                <circle cx="21.5" cy="5.5" r="5.5" fill="white"/>
                <rect x="31" y="4" width="11" height="3" rx="1.5" fill="white"/>
                <rect y="4" width="11" height="3" rx="1.5" fill="white"/>
                <rect x="20" y="14" width="3" height="7" rx="1.5" fill="white"/>
                </svg>
            </div>
            <div class="settings-folder__name">#{title_proxy}</div>
        </div>`))
        
        Lampa.Settings.main().render().find('[data-component="more"]').after(field)
        Lampa.Settings.main().update()
    }
})

///////FILMIX/////////

let network  = new Lampa.Reguest()
let api_url  = 'http://filmixapp.cyou/api/v2/'
let user_dev = '?user_dev_apk=1.1.3&user_dev_id=' + Lampa.Utils.uid(16) + '&user_dev_name=Xiaomi&user_dev_os=11&user_dev_vendor=Xiaomi&user_dev_token='
let ping_auth

Lampa.Params.select('filmix_token','','')

Lampa.Template.add('settings_filmix',`<div>
    <div class="settings-param selector" data-name="filmix_token" data-type="input" placeholder="#{filmix_param_placeholder}">
        <div class="settings-param__name">#{filmix_param_add_title}</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">#{filmix_param_add_descr}</div>
    </div>
    <div class="settings-param selector" data-name="filmix_add" data-static="true">
        <div class="settings-param__name">#{filmix_param_add_device}</div>
    </div>
</div>`)


Lampa.Storage.listener.follow('change',(e)=>{
    if(e.name == 'filmix_token'){
        if(e.value) checkPro(e.value)
        else{
            Lampa.Storage.set("filmix_status", {})

            showStatus()
        }
    }
})

Lampa.Listener.follow('app', function (e) {
    if(e.type =='ready' && Lampa.Settings.main && !Lampa.Settings.main().render().find('[data-component="filmix"]').length){
        let field = $(`<div class="settings-folder selector" data-component="filmix">
            <div class="settings-folder__icon">
                <svg height="57" viewBox="0 0 58 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20.3735V45H26.8281V34.1262H36.724V26.9806H26.8281V24.3916C26.8281 21.5955 28.9062 19.835 31.1823 19.835H39V13H26.8281C23.6615 13 20 15.4854 20 20.3735Z" fill="white"/>
                <rect x="2" y="2" width="54" height="53" rx="5" stroke="white" stroke-width="4"/>
                </svg>
            </div>
            <div class="settings-folder__name">Filmix</div>
        </div>`)
        
        Lampa.Settings.main().render().find('[data-component="more"]').after(field)
        Lampa.Settings.main().update()
    }
})


Lampa.Settings.listener.follow('open', function (e) {
    if(e.name == 'filmix'){
        e.body.find('[data-name="filmix_add"]').unbind('hover:enter').on('hover:enter',()=>{
            let user_code  = ''
            let user_token = ''

            let modal = $('<div><div class="broadcast__text">'+Lampa.Lang.translate('filmix_modal_text')+'</div><div class="broadcast__device selector" style="text-align: center">'+Lampa.Lang.translate('filmix_modal_wait')+'...</div><br><div class="broadcast__scan"><div></div></div></div></div>')

            Lampa.Modal.open({
                title: '',
                html: modal,
                onBack: ()=> {
                    Lampa.Modal.close()

                    Lampa.Controller.toggle('settings_component')

                    clearInterval(ping_auth)
                },
                onSelect: ()=> {
                    Lampa.Utils.copyTextToClipboard(user_code, ()=> {
                        Lampa.Noty.show(Lampa.Lang.translate('filmix_copy_secuses'))
                    }, ()=> {
                        Lampa.Noty.show(Lampa.Lang.translate('filmix_copy_fail'))
                    })
                }
            })

            ping_auth = setInterval(()=> {
                checkPro(user_token, ()=>{
                    Lampa.Modal.close()

                    clearInterval(ping_auth)

                    Lampa.Storage.set("filmix_token", user_token)

                    e.body.find('[data-name="filmix_token"] .settings-param__value').text(user_token)

                    Lampa.Controller.toggle('settings_component')
                })
            }, 10000)

            network.clear()
            network.timeout(10000)

            network.quiet(api_url + 'token_request' + user_dev, (found)=> {
                if (found.status == 'ok') {
                    user_token = found.code
                    user_code  = found.user_code

                    modal.find('.selector').text(user_code)
                    //modal.find('.broadcast__scan').remove()
                }
                else{
                    Lampa.Noty.show(found)
                }
            },(a, c)=>{
                Lampa.Noty.show(network.errorDecode(a, c))
            })
        })

        showStatus()
    }
})




function showStatus(){
    let status = Lampa.Storage.get("filmix_status", '{}')
    let info   = Lampa.Lang.translate('filmix_nodevice')

    if (status.login){
        if (status.is_pro)           info = status.login + ' - PRO '+Lampa.Lang.translate('filter_rating_to')+' - ' + status.pro_date
        else if (status.is_pro_plus) info = status.login + ' - PRO_PLUS '+Lampa.Lang.translate('filter_rating_to')+' - ' + status.pro_date
        else                         info = status.login + ' - NO PRO'
    }

    let field  = $(Lampa.Lang.translate(`
        <div class="settings-param" data-name="filmix_status" data-static="true">
            <div class="settings-param__name">#{title_status}</div>
            <div class="settings-param__value">${info}</div>
        </div>`))

    $('.settings [data-name="filmix_status"]').remove()
    $('.settings [data-name="filmix_add"]').after(field)
}

function checkPro(token, call) {
    network.clear()
    network.timeout(8000)
    network.silent(api_url + 'user_profile' + user_dev + token, function (json) {
        if (json) {
            if(json.user_data) {
                Lampa.Storage.set("filmix_status", json.user_data)

                if(call) call()
            } 
            else {
                Lampa.Storage.set("filmix_status", {})
            }

            showStatus()
        }
    }, function (a, c) {
        Lampa.Noty.show(network.errorDecode(a, c))
    })
}