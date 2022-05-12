import Online from './component'

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


const button = `<div class="full-start__button selector view--online" data-subtitle="Оригинал с pastebin v1.48">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
    <g xmlns="http://www.w3.org/2000/svg">
        <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" fill="currentColor"/>
        <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" fill="currentColor"/>
    </g></svg>

    <span>Онлайн</span>
    </div>`

// нужна заглушка, а то при страте лампы говорит пусто
Lampa.Component.add('online', Online)

//то же самое
resetTemplates()

Lampa.Listener.follow('full',(e)=>{
    if(e.type == 'complite'){
        let btn = $(button)

        btn.on('hover:enter',()=>{
            resetTemplates()

            Lampa.Component.add('online', Online)

            Lampa.Activity.push({
                url: '',
                title: 'Онлайн' ,
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


///////FILMIX/////////

let network  = new Lampa.Reguest()
let api_url  = 'http://filmixapp.cyou/api/v2/'
let user_dev = '?user_dev_apk=1.1.3&user_dev_id=' + Lampa.Utils.uid(16) + '&user_dev_name=Xiaomi&user_dev_os=11&user_dev_vendor=Xiaomi&user_dev_token='
let ping_auth

Lampa.Params.select('filmix_token','','')

Lampa.Template.add('settings_filmix',`<div>
    <div class="settings-param selector" data-name="filmix_token" data-type="input" placeholder="Например: nxjekeb57385b..">
        <div class="settings-param__name">Добавить ТОКЕН от Filmix</div>
        <div class="settings-param__value"></div>
        <div class="settings-param__descr">Добавьте ТОКЕН для подключения подписки</div>
    </div>
    <div class="settings-param selector" data-name="filmix_add" data-static="true">
        <div class="settings-param__name">Добавить устройство на Filmix</div>
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
                <svg height="44" viewBox="0 0 27 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10.1385V44H9.70312V29.0485H23.7656V19.2233H9.70312V15.6634C9.70312 11.8188 12.6562 9.39806 15.8906 9.39806H27V0H9.70312C5.20312 0 0 3.41748 0 10.1385Z" fill="white"/>
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

            let modal = $('<div><div class="broadcast__text">Введите его на странице https://filmix.ac/consoles в вашем авторизованном аккаунте!</div><div class="broadcast__device selector" style="text-align: center">Ожидаем код...</div><br><div class="broadcast__scan"><div></div></div></div></div>')

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
                        Lampa.Noty.show('Код скопирован в буфер обмена')
                    }, ()=> {
                        Lampa.Noty.show('Ошибка при копировании')
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
    let info   = 'Устройство не авторизовано'

    if (status.login){
        if (status.is_pro)           info = status.login + ' - PRO до - ' + status.pro_date
        else if (status.is_pro_plus) info = status.login + ' - PRO_PLUS до - ' + status.pro_date
        else                         info = status.login + ' - NO PRO'
    }

    let field  = $(`
        <div class="settings-param" data-name="filmix_status" data-static="true">
            <div class="settings-param__name">Статус</div>
            <div class="settings-param__value">${info}</div>
        </div>`)

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