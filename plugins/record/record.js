import Component from './component'


function startPlugin() {
    window.plugin_record_ready = true

    Lampa.Lang.add({
        radio_station: {
            ru: 'Радиостанция',
            en: 'Radio station',
            uk: 'Радіостанція',
            be: 'Радыёстанцыя',
            zh: '广播电台',
            pt: 'Estação de rádio',
            bg: 'Радиостанция',
        },
        radio_add_station: {
            ru: 'Введите адрес радиостанции',
            en: 'Enter the address of the radio station',
            uk: 'Введіть адресу радіостанції',
            be: 'Увядзіце адрас радыёстанцыі',
            zh: '输入电台地址',
            pt: 'Digite o endereço da estação de rádio',
            bg: 'Въведете адреса на радиостанцията',
        },
        radio_load_error: {
            ru: 'Ошибка в загрузке потока',
            en: 'Error in stream loading',
            uk: 'Помилка завантаження потоку',
            be: 'Памылка ў загрузцы патоку',
            zh: '流加载错误',
            pt: 'Erro ao carregar a transmissão',
            bg: 'Грешка при зареждане на потока',
        }
    })

    let manifest = {
        type: 'audio',
        version: '1.1.1',
        name: Lampa.Lang.translate('radio_station'),
        description: '',
        component: 'radio',
    }
    
    Lampa.Manifest.plugins = manifest
    
    

    Lampa.Template.add('radio_content', `
        <div class="radio-content">
            <div class="radio-content__head">
                <div class="simple-button simple-button--invisible simple-button--filter selector button--catalog">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve">
                        <path fill="currentColor" d="M478.354,146.286H33.646c-12.12,0-21.943,9.823-21.943,21.943v321.829c0,12.12,9.823,21.943,21.943,21.943h444.709
                            c12.12,0,21.943-9.823,21.943-21.943V168.229C500.297,156.109,490.474,146.286,478.354,146.286z M456.411,468.114H55.589V190.171
                            h400.823V468.114z"/>
                        <path fill="currentColor" d="M441.783,73.143H70.217c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h371.566
                            c12.12,0,21.943-9.823,21.943-21.943C463.726,82.966,453.903,73.143,441.783,73.143z"/>
                        <path fill="currentColor" d="M405.211,0H106.789c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h298.423
                            c12.12,0,21.943-9.823,21.943-21.943C427.154,9.823,417.331,0,405.211,0z"/>
                    </svg>
                    <div class="hide"></div>
                </div>
                <div class="simple-button simple-button--invisible simple-button--filter selector button--add">
                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 512 512" xml:space="preserve">
                        <path d="M256 0C114.833 0 0 114.833 0 256s114.833 256 256 256 256-114.853 256-256S397.167 0 256 0zm0 472.341c-119.275 0-216.341-97.046-216.341-216.341S136.725 39.659 256 39.659 472.341 136.705 472.341 256 375.295 472.341 256 472.341z" fill="currentColor"></path>
                        <path d="M355.148 234.386H275.83v-79.318c0-10.946-8.864-19.83-19.83-19.83s-19.83 8.884-19.83 19.83v79.318h-79.318c-10.966 0-19.83 8.884-19.83 19.83s8.864 19.83 19.83 19.83h79.318v79.318c0 10.946 8.864 19.83 19.83 19.83s19.83-8.884 19.83-19.83v-79.318h79.318c10.966 0 19.83-8.884 19.83-19.83s-8.864-19.83-19.83-19.83z" fill="currentColor"></path>
                    </svg>
                </div>
                <div class="simple-button simple-button--invisible simple-button--filter selector button--search">
                    <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
                        <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>
                        <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>
                    </svg>
                    <div class="hide"></div>
                </div>
            </div>
            <div class="radio-content__body">
                <div class="radio-content__list"></div>
                <div class="radio-content__cover"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('radio_cover', `
        <div class="radio-cover">
            <div class="radio-cover__img-container">
                <div class="radio-cover__img-box">
                    <img src="https://www.radiorecord.ru/upload/iblock/507/close-up-image-fresh-spring-green-grass1.jpg" />
                </div>
            </div>

            <div class="radio-cover__title"></div>
            <div class="radio-cover__tooltip"></div>
        </div>
    `)

    Lampa.Template.add('radio_list_item', `
        <div class="radio-item selector layer--visible">
            <div class="radio-item__num"></div>
            <div class="radio-item__cover">
                <div class="radio-item__cover-box">
                    <img />
                </div>
            </div>
            <div class="radio-item__body">
                <div class="radio-item__title"></div>
                <div class="radio-item__tooltip"></div>
            </div>
            <div class="radio-item__icons">
                <div class="radio-item__icon-favorite">
                    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 477.534 477.534" xml:space="preserve">
                        <path fill="currentColor" d="M438.482,58.61c-24.7-26.549-59.311-41.655-95.573-41.711c-36.291,0.042-70.938,15.14-95.676,41.694l-8.431,8.909
                            l-8.431-8.909C181.284,5.762,98.662,2.728,45.832,51.815c-2.341,2.176-4.602,4.436-6.778,6.778
                            c-52.072,56.166-52.072,142.968,0,199.134l187.358,197.581c6.482,6.843,17.284,7.136,24.127,0.654
                            c0.224-0.212,0.442-0.43,0.654-0.654l187.29-197.581C490.551,201.567,490.551,114.77,438.482,58.61z M413.787,234.226h-0.017
                            L238.802,418.768L63.818,234.226c-39.78-42.916-39.78-109.233,0-152.149c36.125-39.154,97.152-41.609,136.306-5.484
                            c1.901,1.754,3.73,3.583,5.484,5.484l20.804,21.948c6.856,6.812,17.925,6.812,24.781,0l20.804-21.931
                            c36.125-39.154,97.152-41.609,136.306-5.484c1.901,1.754,3.73,3.583,5.484,5.484C453.913,125.078,454.207,191.516,413.787,234.226
                            z"/>
                    </svg>
                </div>
                <div class="radio-item__icon-play">
                    <svg width="22" height="25" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10.7679C22.3333 11.5377 22.3333 13.4622 21 14.232L3.75 24.1913C2.41666 24.9611 0.75 23.9989 0.75 22.4593L0.750001 2.5407C0.750001 1.0011 2.41667 0.0388526 3.75 0.808653L21 10.7679Z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
        </div>
    `)


    Lampa.Template.add('radio_player', `
        <div class="radio-player">
            <div>
                <div class="radio-player__cover"></div>
                <div class="radio-player__wave"></div>
            </div>
            <div class="radio-player__close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 329.269 329" xml:space="preserve">
                    <path d="M194.8 164.77 323.013 36.555c8.343-8.34 8.343-21.825 0-30.164-8.34-8.34-21.825-8.34-30.164 0L164.633 134.605 36.422 6.391c-8.344-8.34-21.824-8.34-30.164 0-8.344 8.34-8.344 21.824 0 30.164l128.21 128.215L6.259 292.984c-8.344 8.34-8.344 21.825 0 30.164a21.266 21.266 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25l128.21-128.214 128.216 128.214a21.273 21.273 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25 8.343-8.34 8.343-21.824 0-30.164zm0 0" fill="currentColor"></path>
                </svg>
            </div>
        </div>
    `)


    Lampa.Template.add('radio_style', `
        <style>
        @@include('../plugins/record/css/style.css')
        </style>
    `)




    function add(){
        let button = $(`<li class="menu__item selector">
            <div class="menu__ico">
                <svg width="38" height="31" viewBox="0 0 38 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="17.613" width="3" height="16.3327" rx="1.5" transform="rotate(63.4707 17.613 0)" fill="currentColor"/>
                    <circle cx="13" cy="19" r="6" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 11C0 8.79086 1.79083 7 4 7H34C36.2091 7 38 8.79086 38 11V27C38 29.2091 36.2092 31 34 31H4C1.79083 31 0 29.2091 0 27V11ZM21 19C21 23.4183 17.4183 27 13 27C8.58173 27 5 23.4183 5 19C5 14.5817 8.58173 11 13 11C17.4183 11 21 14.5817 21 19ZM30.5 18C31.8807 18 33 16.8807 33 15.5C33 14.1193 31.8807 13 30.5 13C29.1193 13 28 14.1193 28 15.5C28 16.8807 29.1193 18 30.5 18Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="menu__text">${manifest.name}</div>
        </li>`)

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: manifest.name,
                component: 'radio',
                page: 1
            })
        })

        $('.menu .menu__list').eq(0).append(button)

        $('body').append(Lampa.Template.get('radio_style',{},true))
    }

    Lampa.Component.add('radio', Component)

    if(window.appready) add()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add()
        })
    }
}

if(!window.plugin_record_ready) startPlugin()
