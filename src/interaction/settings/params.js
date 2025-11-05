import Storage from '../../core/storage/storage'
import Arrays from '../../utils/arrays'
import Input from './input'
import Platform from '../../core/platform'
import Select from '../select'
import Controller from '../../core/controller'
import Subscribe from '../../utils/subscribe'
import Lang from '../../core/lang'
import Manifest from '../../core/manifest'

let values   = {}
let defaults = {}
let listener = Subscribe()

/**
 * Запуск
 */
function init(){
    if(Platform.is('tizen')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'tizen': 'Tizen',
        },'tizen')

        select('player_iptv',{
            'inner': '#{settings_param_player_inner}',
            'tizen': 'Tizen',
        },'tizen')

        select('player_torrent',{
            'inner': '#{settings_param_player_inner}',
            'tizen': 'Tizen',
        },'tizen')
    }
    if(Platform.is('orsay')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'orsay': 'Orsay',
        },'orsay')

        select('player_iptv',{
            'inner': '#{settings_param_player_inner}',
            'orsay': 'Orsay',
        },'orsay')

        select('player_torrent',{
            'inner': '#{settings_param_player_inner}',
            'orsay': 'Orsay',
        },'orsay')
    }
    else if(Platform.is('webos')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'webos': 'WebOS',
        },'inner')

        select('player_iptv',{
            'inner': '#{settings_param_player_inner}',
            'webos': 'WebOS',
        },'inner')

        select('player_torrent',{
            'inner': '#{settings_param_player_inner}',
            'webos': 'WebOS',
        },'inner')
    }
    else if (Platform.is('android')) {
        select('player', {
            'inner': '#{settings_param_player_inner}',
            'android': 'Android'
        }, 'android')

        select('player_iptv', {
            'inner': '#{settings_param_player_inner}',
            'android': 'Android'
        }, 'android')

        select('player_torrent', {
            'android': 'Android'
        }, 'android')

        trigger('internal_torrclient', false)
    }
    else if(Platform.desktop() && !Platform.macOS()){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'other': '#{settings_param_player_outside}',
        },'inner')

        select('player_iptv',{
            'inner': '#{settings_param_player_inner}',
            'other': '#{settings_param_player_outside}',
        },'inner')

        select('player_torrent',{
            'inner': '#{settings_param_player_inner}',
            'other': '#{settings_param_player_outside}',
        },'inner')
    }
    else if(Platform.macOS()){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'iina': 'IINA',
            'infuse': 'Infuse',
            'mpv': 'MPV',
            'nplayer': 'nPlayer',
            'tracyplayer': 'TracyPlayer',		
        },'inner')

        select('player_iptv',{
            'inner': '#{settings_param_player_inner}',
            'iina': 'IINA',
            'infuse': 'Infuse',
            'mpv': 'MPV',
            'nplayer': 'nPlayer',
            'tracyplayer': 'TracyPlayer',		
        },'inner')

        select('player_torrent',{
            'inner': '#{settings_param_player_inner}',
            'iina': 'IINA',
            'infuse': 'Infuse',
            'mpv': 'MPV',
            'nplayer': 'nPlayer',
            'tracyplayer': 'TracyPlayer',		
        },'inner')
    }
    else if(Platform.is('apple')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'ios': 'iOS',
            'vlc': 'VLC',
            'nplayer': 'nPlayer',
            'infuse': 'Infuse',
            'vidhub': 'Vidhub',
            'svplayer': 'SVPlayer',
            'tracyplayer': 'TracyPlayer',
            'senplayer': 'SenPlayer',	
        },'inner')

        select('player_iptv',{
            'inner': '#{settings_param_player_inner}',
            'ios': 'iOS',
            'vlc': 'VLC',
            'nplayer': 'nPlayer',
            'infuse': 'Infuse',
            'svplayer': 'SVPlayer',
            'tracyplayer': 'TracyPlayer',
            'senplayer': 'SenPlayer',		
        },'inner')

        select('player_torrent',{
            'inner': '#{settings_param_player_inner}',
            'ios': 'iOS',
            'vlc': 'VLC',
            'nplayer': 'nPlayer',
            'infuse': 'Infuse',
            'vidhub': 'Vidhub',
            'svplayer': 'SVPlayer',
            'tracyplayer': 'TracyPlayer',
            'senplayer': 'SenPlayer',
        },'inner')
    }
    else if(Platform.is('apple_tv')){
        select('player',{
            'tvos': '#{settings_param_player_inner_tvos} tvOS Universal',
            'tvosl': '#{settings_param_player_inner_tvos} tvOS Online',
            'tvosSelect': '#{settings_param_player_outside}',
            'vlc': 'VLC',
            'infuse': 'Infuse',
            'vidhub': 'Vidhub',
            'inner': '#{settings_param_player_inner}',
            'svplayer': 'SVPlayer'
        },'tvos')

        select('player_iptv',{
            'tvos': '#{settings_param_player_inner_tvos} tvOS Universal',
            'tvosl': '#{settings_param_player_inner_tvos} tvOS Online',
            'tvosSelect': '#{settings_param_player_outside}',
            'vlc': 'VLC',
            'infuse': 'Infuse',
            'vidhub': 'Vidhub',
            'inner': '#{settings_param_player_inner}',
            'svplayer': 'SVPlayer'
        },'inner')

        select('player_torrent',{
            'tvos': '#{settings_param_player_inner_tvos} tvOS Universal',
            'tvosSelect': '#{settings_param_player_outside}',
            'infuse': 'Infuse',
            'vidhub': 'Vidhub',
            'vlc': 'VLC',
            'inner': '#{settings_param_player_inner}',
            'svplayer': 'SVPlayer'
        },'tvos')
    }

    trigger('glass_style', Platform.screen('mobile'))
    trigger('advanced_animation', Platform.is('apple_tv') || Platform.is('browser') || Platform.desktop() || navigator.userAgent.toLowerCase().indexOf('shield') >= 0)

    let screensaver_types = {
        'nature': '#{settings_param_screensaver_nature}',
        'chrome': 'ChromeCast',
        'cub': 'CUB',
        'aerial': 'Aerial'
    }

    select('screensaver_type',screensaver_types,'aerial')

    select('keyboard_type', {
        'lampa': '#{settings_param_keyboard_lampa}',
        'integrate': '#{settings_param_keyboard_system}'
    }, Platform.screen('mobile') || Platform.is('apple_tv') || Platform.macOS() || Platform.desktop() || Platform.is('browser') ? 'integrate' : 'lampa')

    select('navigation_type', {
        'controll': '#{settings_param_navigation_remote}',
        'mouse': '#{settings_param_navigation_mouse}',
        'touch': '#{settings_param_navigation_touch}',
    }, Platform.is('browser') || Platform.desktop() ? 'mouse' : Platform.screen('mobile') ? 'touch' : 'controll')


    //язык и комбинации для поиска
    let langcode = Storage.get('language', 'ru')
    let langname = Lang.codes()[langcode]
    let selector = {
        'df': '#{settings_param_torrent_lang_orig}',
        'df_year': '#{settings_param_torrent_lang_orig} + #{torrent_parser_year}',
        'df_lg': '#{settings_param_torrent_lang_orig} + ' + langname,
        'df_lg_year': '#{settings_param_torrent_lang_orig} + '+langname+' + #{torrent_parser_year}',

        'lg': langname,
        'lg_year': langname + ' + #{torrent_parser_year}',
        'lg_df': langname + ' + #{settings_param_torrent_lang_orig}',
        'lg_df_year': langname + ' + #{settings_param_torrent_lang_orig} + #{torrent_parser_year}',
    }

    if(Arrays.getKeys(selector).indexOf(Storage.get('parse_lang', 'df')) == -1) Storage.set('parse_lang', 'df')

    select('parse_lang',selector,'df')

    select('tmdb_lang',Lang.codes(),'ru')

    // баг со старыми телеками, неправильно работает Utils.protocol()
    // let agent = navigator.userAgent.toLowerCase()
    // let versi = agent.match(/chrome\/(\d+)/)

    // versi = versi ? parseInt(versi[1]) : 60
    // versi = isNaN(versi) ? 60 : versi

    select('protocol', {
        'http': '#{settings_param_no}',
        'https': '#{settings_param_yes}',
    }, 'https')
}

/**
 * Переключатель
 * @param {string} name - название
 * @param {boolean} value_default - значение по дефолту
 */
function trigger(name,value_default){
    values[name] = {
        'true':'#{settings_param_yes}',
        'false':'#{settings_param_no}'
    }

    defaults[name] = value_default
}

/**
 * Выбрать
 * @param {string} name - название
 * @param {{key:string}} select_data - значение
 * @param {string} select_default_value - значение по дефолту
 */
function select(name, select_data, select_default_value){
    values[name] = select_data

    defaults[name] = select_default_value
}

/**
 * Биндит события на элемент
 * @param {object} elems
 */
function bind(elems, elems_html){
    elems.on('hover:enter',(event)=>{
        let elem = $(event.target)
        let type = elem.data('type')
        let name = elem.data('name')
        let onChange = elem.data('onChange')

        if(type == 'toggle'){
            let params   = values[name]
            let keys     = Arrays.isArray(params) ? params : Arrays.getKeys(params),
			    value    = Storage.get(name,defaults[name]) + '',
			    position = keys.indexOf(value)

                position++

                if(position >= keys.length) position = 0

                position = Math.max(0,Math.min(keys.length - 1, position))

                value = keys[position]

                Storage.set(name,value)

                update(elem,elems,elems_html)

                if(onChange) onChange(value)
        }

        if(type == 'input'){
            Input.edit({
                elem: elem,
                name: name,
                nomic: true,
                value: elem.data('string') ? window.localStorage.getItem(name) || defaults[name] : Storage.get(name,defaults[name]) + ''
            },(new_value)=>{
                Storage.set(name,new_value)

                update(elem,elems,elems_html)

                if(onChange) onChange(new_value)
            })
        }

        if(type == 'button'){
            listener.send('button',{
                name: name
            })

            if(onChange) onChange()
        }

        if(type == 'add'){
            Input.edit({
                value: '',
            },(new_value)=>{
                if(new_value && Storage.add(name, new_value)){
                    displayAddItem(elem, new_value)

                    listener.send('update_scroll')
                }
            })
        }

        if(type == 'select'){
            let params   = values[name]
            let value    = Storage.get(name,defaults[name]) + ''
            let items    = []

            for(let i in params){
                items.push({
                    title: Lang.translate(params[i]),
                    value: i,
                    selected: i == value
                })
            }

            let enabled = Controller.enabled().name

            Select.show({
                title: Lang.translate('title_choice'),
                items: items,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onSelect: (a)=>{
                    Storage.set(name,a.value)

                    update(elem,elems,elems_html)

                    Controller.toggle(enabled)

                    if(onChange) onChange(a.value)
                }
            })
        }
    }).on('hover:hover hover:touch',(e)=>{
        Navigator.focused(e.target)
    }).each(function(){
        if(!$(this).data('static')) update($(this),elems,elems_html)
    })

    if(elems.eq(0).data('type') == 'add'){
        displayAddList(elems.eq(0))
    }
}

/**
 * Добавить дополнительное полу
 * @param {object} elem
 * @param {object} element
 */
function displayAddItem(elem, element){
    let name  = elem.data('name')
    let item  = $('<div class="settings-param selector"><div class="settings-param__name">'+element+'</div>'+'</div>')

    item.on('hover:long',()=>{
        let list = Storage.get(name,'[]')

        Arrays.remove(list, element)

        Storage.set(name, list)

        item.css({opacity: 0.5})
    })

    elem.after(item)
}

/**
 * Вывести дополнительные поля
 * @param {object} elem
 */
function displayAddList(elem){
    let list = Storage.get(elem.data('name'),'[]')

    list.forEach(element => {
        displayAddItem(elem, element)
    })

    listener.send('update_scroll')
}

/**
 * Обновляет значения на элементе
 * @param {object} elem
 */
function update(elem,elems,elems_html){
    let name = elem.data('name')

    let key = elem.data('string') ? window.localStorage.getItem(name) || defaults[name] : Storage.get(name, defaults[name] + '')
    let val = typeof values[name] == 'string' ? key : values[name][key] || values[name][defaults[name]]
    let plr = elem.attr('placeholder')

    if(!val && plr) val = plr

    elem.find('.settings-param__value').text(Lang.translate(val))

    let children = elem.data('children')

    if(children){
        let parent = elems_html ? elems_html.find('[data-parent="'+children+'"]') : elems.filter('[data-parent="'+children+'"]')
        let value  = elem.data('children-value')
        let visibl = value ? Storage.field(name) !== value : !Storage.field(name)

        if(elem.data('children-reverse')) visibl = !visibl

        parent.toggleClass('hide',visibl)

        parent.filter('[data-visible-value]').each(function(){
            $(this).toggleClass('hide', $(this).data('visible-value') !== key)
        })

        listener.send('update_scroll_position')
    }
}

/**
 * Получить значение параметра
 * @param {string} name
 * @returns *
 */
function field(name){
    return Storage.get(name, defaults[name] + '')
}


/**
 * Добовляем селекторы
 */
select('interface_size',{
    'small': '#{settings_param_interface_size_small}',
    'normal': '#{settings_param_interface_size_normal}',
    'bigger': '#{settings_param_interface_size_bigger}'
},'normal')

select('navigation_type', {
    'controll': '#{settings_param_navigation_remote}',
    'mouse': '#{settings_param_navigation_mouse}',
    'touch': '#{settings_param_navigation_touch}',
}, 'controll')

select('poster_size',{
    'w200': '#{settings_param_poster_quality_low}',
    'w300': '#{settings_param_poster_quality_average}',
    'w500': '#{settings_param_poster_quality_high}'
},'w300')

select('parser_torrent_type',{
    'jackett': 'Jackett',
    'prowlarr': 'Prowlarr',
    'torrserver': 'TorrServer'
},'jackett')

select('jackett_interview',{
    'all': '#{settings_param_jackett_interview_all}',
    'healthy': '#{settings_param_jackett_interview_healthy}',
},'all')

select('background_type',{
    'complex': '#{settings_param_background_complex}',
    'simple': '#{settings_param_background_simple}',
    'poster': '#{settings_param_background_image}',
},'simple')

select('pages_save_total',{
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '10': '10',
    '20': '20',
},'5')

select('player',{
    'inner': '#{settings_param_player_inner}'
},'inner')

select('player_iptv',{
    'inner': '#{settings_param_player_inner}'
},'inner')

select('player_torrent',{
    'inner': '#{settings_param_player_inner}',
},'inner')

select('torrserver_use_link',{
    'one': '#{settings_param_link_use_one}',
    'two': '#{settings_param_link_use_two}'
},'one')

select('subtitles_size',{
    'small': '#{settings_param_subtitles_size_small}',
    'normal': '#{settings_param_subtitles_size_normal}',
    'large': '#{settings_param_subtitles_size_bigger}',
},'normal')

select('screensaver_time',{
    '1': '1',
    '2': '2',
    '5': '5',
    '10': '10',
},'5')


select('parse_lang',{
    'df': '#{settings_param_torrent_lang_orig}'
},'df')

select('parse_timeout',{
    '15': '15',
    '30': '30',
    '60': '60'
},'15')

select('player_rewind',{
    '5': '5',
    '10': '10',
    '15': '15',
    '20': '20',
    '30': '30',
    '50': '50',
    '100': '100'
},'20')

select('player_timecode',{
    'again': '#{settings_param_player_timecode_again}',
    'continue': '#{settings_param_player_timecode_continue}',
    'ask': '#{settings_param_player_timecode_ask}',
},'continue')

select('player_scale_method',{
    'transform': 'Transform',
    'calculate': '#{settings_param_player_scale_method}',
},'transform')

select('player_hls_method',{
    'application': '#{settings_param_player_hls_app}',
    'hlsjs': '#{settings_param_player_hls_js}',
},'application')


select('source',{
    'tmdb': 'TMDB',
    'cub': 'CUB',
},'tmdb')

select('start_page', {
    'main': '#{title_main}',
    'favorite@bookmarks': '#{settings_input_links}',
    'favorite@history': '#{title_history}',
    'mytorrents': '#{title_mytorrents}',
    'last': '#{title_last}'
}, 'main')

select('scroll_type', {
    'css': 'CSS',
    'js': 'Javascript'
}, 'css')

select('card_views_type', {
    'preload': '#{settings_param_card_view_load}',
    'view': '#{settings_param_card_view_all}'
}, 'preload')

select('keyboard_type', {
    'lampa': '#{settings_param_keyboard_lampa}',
    'integrate': '#{settings_param_keyboard_system}'
}, 'lampa')

select('card_interfice_type', {
    'old': '#{settings_param_card_interface_old}',
    'new': '#{settings_param_card_interface_new}'
}, 'new')

select('glass_opacity', {
    'easy': '#{settings_param_glass_easy}',
    'medium': '#{settings_param_glass_medium}',
    'blacked': '#{settings_param_glass_blacked}'
}, 'easy')

select('interface_sound_level', {
    '100': '100',
    '80': '80',
    '60': '60',
    '40': '40',
    '20': '20',
}, '60')

select('time_offset', {
    'n-10': '-10',
    'n-9': '-9',
    'n-8': '-8',
    'n-7': '-7',
    'n-6': '-6',
    'n-5': '-5',
    'n-4': '-4',
    'n-3': '-3',
    'n-2': '-2',
    'n-1': '-1',
    'n0': '0',
    'n1': '1',
    'n2': '2',
    'n3': '3',
    'n4': '4',
    'n5': '5',
    'n6': '6',
    'n7': '7',
    'n8': '8',
    'n9': '9',
    'n10': '10',
}, 'n0')


select('video_quality_default',{
    '480': '480p',
    '720': '720p',
    '1080': '1080p',
    '1440': '1440p',
    '2160': '2160p',
},'1080')


select('player_launch_trailers',{
    'inner': '#{settings_param_player_inner}',
    'youtube': 'YouTube',
},'inner')

let mirrors_select = {}

Manifest.cub_mirrors.forEach((mirror)=>{
    mirrors_select[mirror] = mirror
})

select('cub_domain', mirrors_select, Manifest.cub_domain)

/**
 * Добовляем триггеры
 */
trigger('animation',true)
trigger('background',true)
trigger('torrserver_savedb',false)
trigger('torrserver_preload', true)
trigger('parser_use',false)
trigger('cloud_use',false)
trigger('account_use',false)
trigger('torrserver_auth',false)
trigger('mask',true)
trigger('playlist_next',true)
trigger('internal_torrclient', true)
trigger('subtitles_stroke', true)
trigger('subtitles_backdrop', false)
trigger('screensaver', true)
trigger('proxy_tmdb', true)
trigger('proxy_tmdb_auto', true)
trigger('proxy_other', true)
trigger('parse_in_search', false)
trigger('subtitles_start', false)
trigger('helper', true)
trigger('light_version', false)
trigger('player_normalization', false)
trigger('card_quality', true)
trigger('card_episodes', true)
trigger('card_interfice_poster', true)
trigger('glass_style', false)
trigger('black_style', false)
trigger('hide_outside_the_screen', true)
trigger('card_interfice_cover', true)
trigger('card_interfice_reactions', true)
trigger('cache_images', false)
trigger('interface_sound_play', false)
trigger('request_caching', true)



/**
 * Добовляем поля
 */
select('jackett_url','','')
select('jackett_key','','')
select('prowlarr_url','','');
select('prowlarr_key','','');
select('torrserver_url','','')
select('torrserver_url_two','','')
select('torrserver_login','','')
select('torrserver_password','','')
select('parser_website_url','','')
select('cloud_token','','')
select('account_email','','')
select('account_password','','')
select('device_name','','Lampa')
select('player_nw_path','','C:/Program Files/VideoLAN/VLC/vlc.exe')
select('tmdb_proxy_api','','')
select('tmdb_proxy_image','','')

export default {
    listener,
    init,
    bind,
    update,
    field,
    select,
    trigger,
    values: values,
    defaults: defaults
}
