import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Input from './input'
import Platform from '../../utils/platform'
import Select from '../../interaction/select'
import Controller from '../../interaction/controller'
import Subscribe from '../../utils/subscribe'
import Lang from '../../utils/lang'

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
    }
    if(Platform.is('orsay')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'orsay': 'Orsay',
        },'inner')
    }
    else if(Platform.is('webos')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'webos': 'WebOS',
        },'inner')
    }
    else if (Platform.is('android')) {
        select('player', {
            'inner': '#{settings_param_player_inner}',
            'android': 'Android'
        }, 'android')

        trigger('internal_torrclient', false)
    }
    else if(Platform.is('nw')){
        select('player',{
            'inner': '#{settings_param_player_inner}',
            'other': '#{settings_param_player_outside}',
        },'inner')
    }
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
function bind(elems){
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

                update(elem)

                if(onChange) onChange(value)
        }

        if(type == 'input'){
            Input.edit({
                elem: elem,
                name: name,
                value: elem.data('string') ? window.localStorage.getItem(name) || defaults[name] : Storage.get(name,defaults[name]) + ''
            },(new_value)=>{
                Storage.set(name,new_value)

                update(elem)

                if(onChange) onChange(new_value)
            })
        }

        if(type == 'button'){
            listener.send('button',{
                name: name
            })
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

                    update(elem)

                    Controller.toggle(enabled)

                    if(onChange) onChange(a.value)
                }
            })
        }
    }).each(function(){
        if(!$(this).data('static')) update($(this))
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
function update(elem){
    let name = elem.data('name')

    let key = elem.data('string') ? window.localStorage.getItem(name) || defaults[name] : Storage.get(name, defaults[name] + '')
    let val = typeof values[name] == 'string' ? key : values[name][key] || values[name][defaults[name]]
    let plr = elem.attr('placeholder')

    if(!val && plr) val = plr

    elem.find('.settings-param__value').text(Lang.translate(val))
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
    'normal': '#{settings_param_interface_size_normal}'
},'normal')

select('poster_size',{
    'w200': '#{settings_param_poster_quality_low}',
    'w300': '#{settings_param_poster_quality_average}',
    'w500': '#{settings_param_poster_quality_high}'
},'w200')

select('parser_torrent_type',{
    'jackett': 'Jackett',
    'torlook': 'Torlook',
},'jackett')

select('torlook_parse_type',{
    'native': '#{settings_param_parse_directly}',
    'site': '#{settings_param_parse_api}',
},'native')

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
},'5')

select('player',{
    'inner': '#{settings_param_player_inner}'
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

select('screensaver_type',{
    'nature': '#{settings_param_screensaver_nature}',
    'chrome': 'ChromeCast'
},'chrome')

select('tmdb_lang',{
    'ru': '#{settings_param_lang_ru}',
    'uk': '#{settings_param_lang_uk}',
    'en': '#{settings_param_lang_en}',
},'ru')

select('parse_lang',{
    'df': '#{settings_param_torrent_lang_orig}',
    'ru': '#{settings_param_torrent_lang_ru}',
},'df')

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
},'hlsjs')


select('source',{
    'tmdb': 'TMDB',
    'ivi': 'IVI',
    'okko': 'OKKO',
    'cub': 'CUB',
},'tmdb')

select('start_page', {
    'main': '#{title_main}',
    'favorite@book': '#{title_book}',
    'favorite@like': '#{title_like}',
    'favorite@wath': '#{title_wath}',
    'favorite@history': '#{title_history}',
    'mytorrents': '#{title_mytorrents}',
    'last': '#{title_last}'
}, 'last')

select('scroll_type', {
    'css': 'CSS',
    'js': 'Javascript'
}, 'css')

select('card_views_type', {
    'preload': '#{settings_param_card_view_load}',
    'view': '#{settings_param_card_view_all}'
}, 'preload')

select('navigation_type', {
    'controll': '#{settings_param_navigation_remote}',
    'mouse': '#{settings_param_navigation_mouse}'
}, 'mouse')

select('keyboard_type', {
    'lampa': '#{settings_param_keyboard_lampa}',
    'integrate': '#{settings_param_keyboard_system}'
}, 'lampa')


select('time_offset', {
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
}, 'n0')


select('video_quality_default',{
    '480': '480p',
    '720': '720p',
    '1080': '1080p',
    '1440': '1440p',
    '2160': '2160p',
},'1080')



/**
 * Добовляем триггеры
 */
trigger('animation',true)
trigger('background',true)
trigger('torrserver_savedb',false)
trigger('torrserver_preload', false)
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
trigger('proxy_other', true)
trigger('parse_in_search', false)
trigger('subtitles_start', false)
trigger('helper', true)
trigger('light_version', false)
trigger('player_normalization', false)




/**
 * Добовляем поля
 */
select('jackett_url','','')
select('jackett_key','','')
select('torrserver_url','','')
select('torrserver_url_two','','')
select('torrserver_login','','')
select('torrserver_password','','')
select('parser_website_url','','')
select('torlook_site','','w41.torlook.info')
select('cloud_token','','')
select('account_email','','')
select('account_password','','')
select('device_name','','Lampa')
select('player_nw_path','','C:/Program Files/VideoLAN/VLC/vlc.exe')

export default {
    listener,
    init,
    bind,
    update,
    field,
    select,
    trigger
}