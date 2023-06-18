import Component from './component'

// window.webapis = {
//     allshare: {
//         serviceconnector: {
//             createServiceProvider: function(good, err){
//                 good()
//             },
//             getServiceProvider: function(){
//                 return window.webapis.allshare.serviceconnector
//             },
//             getDeviceFinder: function(){
//                 return {
//                     getDeviceList: function(){
//                         return [{
//                             browse: (where, index, max, call)=>{
//                                 let root = [{
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "FOLDER",
//                                     title: "Следствие ведут знатоки (малые рипы)/Следствие ведут знатоки фильм 01 Черный маклер 745"
//                                 }]

//                                 let folder = [{
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "FOLDER",
//                                     title: "Moviews"
//                                 },
//                                 {
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "FOLDER",
//                                     title: "Moviews"
//                                 },
//                                 {
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "VIDEO",
//                                     title: "Super_Mario_Brosers.avi"
//                                 },{
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "VIDEO",
//                                     title: "Super_Mario_Brosers.avi"
//                                 },{
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "VIDEO",
//                                     title: "Super_Mario_Brosers.avi"
//                                 },{
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "VIDEO",
//                                     title: "Super_Mario_Brosers.avi"
//                                 },{
//                                     contentBuildType: "PROVIDER",
//                                     date: "2023-06-14",
//                                     duration: 0,
//                                     extension: "avi",
//                                     fileSize: 781084672,
//                                     height: 0,
//                                     isRootFolder: false,
//                                     itemType: "VIDEO",
//                                     title: "Super_Mario_Brosers.avi"
//                                 }]

//                                 call(where.isRootFolder ? root : folder)
//                             },
//                             deviceDomain: "LOCAL_NETWORK",
//                             deviceType: "MEDIAPROVIDER",
//                             iconArray: [],
//                             id: "uuid:cb14b8a3-c25f-e43b-596b-49b4643ff223+wlan0",
//                             ipAddress: "192.168.0.103",
//                             isSearchable: true,
//                             modelName: "dms 1.4",
//                             name: "Tor",
//                             nic: "192.168.0.102",
//                             rootFolder: {
//                                 isRootFolder: true,
//                                 title: 'Root',
//                             },
//                             search: ()=>{},
//                             subtype: ""
//                         }]
//                     },
//                     addDeviceDiscoveryListener: function(){
//                         return 23334
//                     },
//                     removeDeviceDiscoveryListener: function(){

//                     }
//                 }
//             }
//         }
//     }
// }

function startPlugin() {
    window.plugin_client_dnla = true

    Lampa.Lang.add({
        client_dlna_search_device: {
            ru: 'Поиск устройств',
            en: 'Device search',
            uk: 'Пошук пристроїв',
            be: 'Пошук прылад',
            zh: '设备搜索',
            pt: 'Pesquisa de dispositivos'
        },
        client_dlna_nosuport: {
            ru: 'Ваш виджет не поддерживается, обновите виджет на новую версию',
            en: 'Your widget is not supported, update the widget to a newer version',
            uk: 'Віджет не підтримується, оновіть віджет на нову версію',
            be: 'Ваш віджэт не падтрымліваецца, абнавіце віджэт на новую версію',
            zh: '不支持您的小部件，请将小部件更新到较新版本',
            pt: 'Seu widget não é compatível, atualize o widget para uma versão mais recente'
        },
        client_dlna_all_device: {
            ru: 'Все устройства',
            en: 'All devices',
            uk: 'Усі пристрої',
            be: 'Усе прылады',
            zh: '所有设备',
            pt: 'Todos os dispositivos'
        }
    })

    let manifest = {
        type: 'plugin',
        version: '1.1.1',
        name: 'DLNA',
        description: '',
        component: 'client_dnla',
    }
    
    Lampa.Manifest.plugins = manifest
    
    Lampa.Template.add('client_dlna_main', `
        <div class="client-dlna-main">
            <div class="client-dlna-main__head client-dlna-head"></div>
            <div class="client-dlna-main__body"></div>
        </div>
    `)

    Lampa.Template.add('client_dlna_loading', `
        <div class="client-dlna-loading">
            <div class="client-dlna-loading__title"></div>
            <div class="client-dlna-loading__loader">
                <div class="broadcast__scan"><div></div></div>
            </div>
        </div>
    `)

    Lampa.Template.add('client_dlna_device', `
        <div class="client-dlna-device selector">
            <div class="client-dlna-device__body">
                <div class="client-dlna-device__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 128 128" xml:space="preserve">
                        <path d="M111.7 57.1V22.2c0-1.1-.5-2.3-1.4-2.9h-.1c-.6-.4-1.2-.6-2-.6H30.9c-2 0-3.5 1.5-3.5 3.5v31.9h34.9c2.8 0 5.1 2.4 5.1 5.2v15.5h27.5V61.4c0-2.4 1.9-4.2 4.2-4.2h12.6z" fill="currentColor"></path>
                        <path d="M96.8 67.6H128v33.2H96.8zM67.3 86.1h27.5v-9.2H67.3zM65.1 59.3c0-1.8-1.3-3.1-3-3.1h-56c-1.7 0-3 1.4-3 3.1v41.9h62zM0 106.1c0 1.7 1.3 3.1 3.1 3.1h62.2c1.7 0 3.1-1.3 3.1-3.1v-2.9H0zM125.8 59.3H99c-1.2 0-2.2.9-2.2 2.2v4.1H128v-4.1c0-1.3-.9-2.2-2.2-2.2zm-9.4 4.1h-7.9c-.6 0-1-.4-1-1s.4-1 1-1h7.9c.6 0 1 .4 1 1 .1.6-.3 1-1 1zm3.8 0h-.4c-.6 0-1-.4-1-1s.4-1 1-1h.4c.6 0 1 .4 1 1s-.4 1-1 1zM96.8 107.1c0 1.2.9 2.2 2.2 2.2h26.8c1.2 0 2.2-1 2.2-2.2V103H96.8zm11.6-2h7.9c.6 0 1 .4 1 1s-.4 1-1 1h-7.9c-.6 0-1-.4-1-1s.4-1 1-1zM81.7 93.7H78v-5.6H67.3v7.6h14.3c.6 0 1-.4 1-1 .1-.6-.3-1-.9-1z" fill="currentColor"></path>
                    </svg>
                </div>
                <div class="client-dlna-device__name"></div>
                <div class="client-dlna-device__ip"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('client_dlna_folder', `
        <div class="client-dlna-device selector">
            <div class="client-dlna-device__body">
                <div class="client-dlna-device__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 408 408" style="enable-background:new 0 0 512 512" xml:space="preserve">
                        <path d="M372 88.661H206.32l-33-39.24a5.001 5.001 0 0 0-4-1.8H36c-19.956.198-36.023 16.443-36 36.4v240c-.001 19.941 16.06 36.163 36 36.36h336c19.94-.197 36.001-16.419 36-36.36v-199c.001-19.941-16.06-36.162-36-36.36z" fill="currentColor"></path>
                    </svg>
                </div>
                <div class="client-dlna-device__name"></div>
            </div>
        </div>
    `)

    Lampa.Template.add('client_dlna_file', `
        <div class="client-dlna-file selector">
            <div class="client-dlna-file__body">
                <div class="client-dlna-file__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 477.867 477.867" xml:space="preserve">
                        <path d="M238.933 0C106.974 0 0 106.974 0 238.933s106.974 238.933 238.933 238.933 238.933-106.974 238.933-238.933C477.726 107.033 370.834.141 238.933 0zm100.624 246.546a17.068 17.068 0 0 1-7.662 7.662v.085L195.362 322.56c-8.432 4.213-18.682.794-22.896-7.638a17.061 17.061 0 0 1-1.8-7.722V170.667c-.004-9.426 7.633-17.07 17.059-17.075a17.068 17.068 0 0 1 7.637 1.8l136.533 68.267c8.436 4.204 11.867 14.451 7.662 22.887z" fill="currentColor"></path>
                    </svg>
                </div>
                <div class="client-dlna-file__name"></div>
                <div class="client-dlna-file__size"></div>
            </div>
        </div>
    `)

    Lampa.Template.add(manifest.component + '_style', `
        <style>
        @@include('../plugins/dlna/css/style.css')
        </style>
    `)


    try{
        webapis.allshare.serviceconnector.createServiceProvider(()=>{
            console.log('DLNA','connected')

            window.serviceProvider = webapis.allshare.serviceconnector.getServiceProvider()
        },(e)=>{
            console.log('DLNA','connect error:', e.message)
        })
    }
    catch(e){}



    function add(){
        //if(!Lampa.Platform.is('tizen')) return

        let button = $(`<li class="menu__item selector">
            <div class="menu__ico">
                <svg viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M256 0C114.833 0 0 114.833 0 256s114.833 256 256 256 256-114.833 256-256S397.167 0 256 0Zm0 472.341c-119.275 0-216.341-97.066-216.341-216.341S136.725 39.659 256 39.659c119.295 0 216.341 97.066 216.341 216.341S375.275 472.341 256 472.341z"/>
                    <circle cx="160" cy="250" r="60" fill="currentColor"/>
                    <circle cx="320" cy="150" r="60" fill="currentColor"/>
                    <circle cx="320" cy="350" r="60" fill="currentColor"/>
                    <path fill="currentColor" d="M35 135h270v30H35zm175.782 100h270v30h-270zM35 335h270v30H35z"/>
                </svg>
            </div>
            <div class="menu__text">${manifest.name}</div>
        </li>`)

        button.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: manifest.name,
                component: manifest.component,
                page: 1
            })
        })

        $('.menu .menu__list').eq(0).append(button)

        $('body').append(Lampa.Template.get(manifest.component + '_style',{},true))
    }

    Lampa.Component.add(manifest.component, Component)

    if(window.appready) add()
    else{
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') add()
        })
    }
}

if(!window.plugin_client_dnla) startPlugin()