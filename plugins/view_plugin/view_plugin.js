function startPlugin() {
    window.view_plugin_ready = true

    function showList(){
        Lampa.Account.plugins((plugins)=>{
            let original = plugins.filter(plugin=>plugin.status).map(plugin=>plugin.url).concat(Lampa.Storage.get('plugins','[]').filter(plugin=>plugin.status).map(plugin=>plugin.url))
            let include  = []
    
            original.forEach(url=>{
                let encode = url
                
                if(!/[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}/.test(encode)){
                    encode = encode.replace(/\{storage_(\w+|\d+|_|-)\}/g,(match,key)=>{
                        return encodeURIComponent(Lampa.Base64.encode(localStorage.getItem(key) || ''))
                    })
    
                    let email = localStorage.getItem('account_email')
    
                    if(Lampa.Account.logged() &&  email) encode = Lampa.Utils.addUrlComponent(encode, 'email='+encodeURIComponent(Lampa.Base64.encode(email)))
    
                    encode = Lampa.Utils.addUrlComponent(encode, 'logged='+encodeURIComponent(Lampa.Account.logged() ? 'true' : 'false'))
                    encode = Lampa.Utils.addUrlComponent(encode, 'random='+Math.random())
                }
                
                include.push(encode)
            })
    
            Lampa.Select.show({
                title: 'Плагины',
                items: original.map((p,i)=>{return {title: ' ' + p, url: include[i]}}),
                onSelect: (select)=>{
                    let html = $('<div></div>')
                    let iframe = $('<iframe style="width: 100%; height: 28em; background: #fff; pointer-events: none; border: 0; border-radius: 0.3em"></iframe>')

                    html.append('<div style="margin-bottom: 1em">Адрес: '+select.url+'</div>')
                    html.append(iframe)

                    iframe.attr('src', select.url)

                    Lampa.Controller.toggle('content')

                    Lampa.Modal.open({
                        title: '',
                        size: 'large',
                        html: html,
                        onBack: ()=>{
                            Lampa.Modal.close()

                            Lampa.Controller.toggle('content')
                        }
                    })
                },
                onBack: ()=>{
                    Lampa.Controller.toggle('menu')
                }
            })
        })
    }


    Lampa.Template.add('trailer', `
        <div class="card selector card--trailer">
            <div class="card__view">
                <img src="./img/img_load.svg" class="card__img">
            </div>
            <div class="card__promo">
                <div class="card__promo-text">
                    <div class="card__title"></div>
                </div>
                <div class="card__details"></div>
            </div>
            <div class="card__play">
                <img src="./img/icons/player/play.svg">
            </div>
        </div>
    `)


    function add(){
        let button = $(`<li class="menu__item selector">
            <div class="menu__ico">
                <svg height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="21" height="21" rx="2" fill="white"></rect>
                    <mask id="path-2-inside-1_154:24" fill="white">
                    <rect x="2" y="27" width="17" height="17" rx="2"></rect>
                    </mask>
                    <rect x="2" y="27" width="17" height="17" rx="2" stroke="white" stroke-width="6" mask="url(#path-2-inside-1_154:24)"></rect>
                    <rect x="27" y="2" width="17" height="17" rx="2" fill="white"></rect>
                    <rect x="27" y="34" width="17" height="3" fill="white"></rect>
                    <rect x="34" y="44" width="17" height="3" transform="rotate(-90 34 44)" fill="white"></rect>
                </svg>
            </div>
            <div class="menu__text">Анализ</div>
        </li>`)

        button.on('hover:enter', showList)

        $('.menu .menu__list').eq(0).append(button)
    }

    if(window.appready) add()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add()
        })
    }
}

if(!window.view_plugin_ready) startPlugin()