import Utils from '../utils/utils'
import Manifest from './manifest'
import Lang from './lang'

function init(){
    if(!window.lampa_settings.iptv) return
    
    let components = ['tmdb','plugins','content_rows']
    let titles     = ['card_interfice_type']
    let params = ['light_version', 'card_interfice_type', 'card_interfice_reactions', 'player_timecode', 'pages_save_total', 'device_name', 'playlist_next', 'background_type', 'card_views_type', 'hide_outside_the_screen', 'card_interfice_cover', 'card_interfice_poster', 'start_page', 'source', 'card_quality', 'card_episodes', 'player']
    
    Lang.add({
        about_text: {
            ru: 'Наслаждайтесь любимыми телепередачами, фильмами и спортивными событиями на вашем устройстве с нашим приложением для просмотра IPTV каналов. Наше приложение просто в использовании и позволяет настроить список избранных каналов для быстрого доступа к любимым программам. Просматривайте телевизор в любое время и в любом месте, не пропуская ни одного важного момента благодаря нашему надежному и удобному IPTV приложению.',
            uk: 'Насолоджуйтесь улюбленими телепередачами, фільмами та спортивними подіями на вашому пристрої з нашим програмою для перегляду IPTV каналів. Наша програма просто у використанні та дозволяє налаштувати список вибраних каналів для швидкого доступу до улюблених програм. Переглядайте телевізор у будь-який час та в будь-якому місці, не пропускаючи жодного важливого моменту завдяки нашому надійному та зручному IPTV додатку.',
            be: 'Атрымлівайце асалоду ад любімымі тэлеперадачамі, фільмамі і спартыўнымі падзеямі на вашым прыладзе з нашым дадаткам для прагляду IPTV каналаў. Наша дадатак проста ў выкарыстанні і дазваляе наладзіць спіс абраных каналаў для хуткага доступу да любімых праграм. Праглядайце тэлевізар у любы час і ў любым месцы, не прапускаючы ніводнага важнага моманту дзякуючы нашаму надзейнаму і зручнаму IPTV з дадаткам.',
            en: 'Enjoy your favorite TV shows, movies and sports on your device with our IPTV channel viewer app. Our application is easy to use and allows you to set up your favorite channel list for quick access to your favorite programs. Watch TV anytime, anywhere without missing a single important moment thanks to our reliable and convenient IPTV application.',
            pt: 'Aproveite seus programas de TV, filmes e esportes favoritos em seu dispositivo com nosso aplicativo visualizador de canais IPTV. Nosso aplicativo é fácil de usar e permite que você configure sua lista de canais favoritos para acesso rápido aos seus programas favoritos. Assista TV a qualquer hora, em qualquer lugar, sem perder um único momento importante, graças ao nosso aplicativo IPTV confiável e conveniente.',
            zh: '使用我们的 IPTV 频道查看器应用程序在您的设备上欣赏您最喜爱的电视节目、电影和体育节目。 我们的应用程序易于使用，并允许您设置您最喜爱的频道列表，以便快速访问您最喜爱的节目。 借助我们可靠且方便的 IPTV 应用程序，随时随地观看电视，不会错过任何一个重要时刻。'
        },
        empty_title_two: {
            ru: 'Произошла ошибка',
            uk: 'Виникла помилка',
            be: 'Адбылася памылка',
            en: 'An error has occurred',
            pt: 'Оcorreu um erro',
            zh: '发生了错误'
        },
        empty_text_two: {
            ru: 'К сожалению, приложение не загружается. Рекомендуем попробовать перезагрузить его.',
            uk: 'На жаль, програма не завантажується. Рекомендуємо спробувати перезавантажити його.',
            be: 'Нажаль, прыкладанне не загружаецца. Рэкамендуем паспрабаваць перазагрузіць яго.',
            en: 'Unfortunately, the application does not load. We recommend that you try rebooting it.',
            pt: 'Infelizmente, o aplicativo não carrega. Recomendamos que você tente reiniciá-lo.',
            zh: '不幸的是，该应用程序未加载。 我们建议您尝试重新启动它。'
        }
    })


    window.iptvClearSettingsFunction = function(e) {
        titles.forEach(function(t) {
            var param = $('[data-name="' + t + '"]', e.body).prev()
            if (param.length && param.hasClass('settings-param-title')) param.remove()
        })

        $(components.map(function(c) {
            return '[data-component="' + c + '"]'
        }).join(','), e.body).remove()

        $(params.map(function(c) {
            return '[data-name="' + c + '"]'
        }).join(','), e.body).remove()
    }

    window.iptvClearFunction = function() {
        $('.menu .menu__list:eq(0)').empty()
        $('.head .open--notice, .head .open--search, .head .open--feed, .head .open--premium').addClass('hide')

        window.iptvClearFunction = function() {}
    }

    setTimeout(()=>{
        window.iptvClearFunction()
    },10)

    Lampa.Settings.listener.follow('open', window.iptvClearSettingsFunction)

    Utils.putScript([Utils.protocol() + Manifest.cub_domain + '/plugin/iptv'], function () {
        console.log('IPTV', 'load from lampa','complite')
    }, function () {
        console.log('IPTV', 'load from lampa','error')
    }, function () {
        console.log('IPTV', 'load from lampa','success')
    }, false)
}

export default {
    init
}