import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Input from './input'
import Platform from '../../utils/platform'

let values   = {}
let defaults = {}

function init(){
    if(Platform.is('tizen')){
        select('player',{
            'inner': 'Встроенный',
            'tizen': 'Tizen',
        },'tizen')
    }
    else if(Platform.is('webos')){
        select('player',{
            'inner': 'Встроенный',
            'webos': 'WebOS',
        },'inner')
    }
    else if (Platform.is('android')) {
        select('player', {
            'inner': 'Встроенный',
            'android': 'Android'
        }, 'android')

        trigger('internal_torrclient', false)
    }

    Storage.set('player_size','default') //делаем возврат на нормальный масштаб видео
}

/**
 * Переключатель
 * @param {String} name - название
 * @param {Boolean} _default - значение по дефолту
 */
function trigger(name,_default){
    values[name] = {
        'true':'Да',
        'false':'Нет'
    }

    defaults[name] = _default
}

/**
 * Выбрать
 * @param {String} name - название
 * @param {*} _select - значение
 * @param {String} _default - значение по дефолту
 */
function select(name, _select, _default){
    values[name] = _select

    defaults[name] = _default
}

/**
 * Биндит события на элемент
 * @param {*} elems 
 */
function bind(elems){
    elems.on('hover:enter',(event)=>{
        let elem = $(event.target)
        let type = elem.data('type')
        let name = elem.data('name')

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
        }

        if(type == 'input'){
            Input.edit({
                elem: elem,
                name: name,
                value: Storage.get(name,defaults[name]) + ''
            },(new_value)=>{
                Storage.set(name,new_value)

                update(elem)
            })
        }
    }).each(function(){
        update($(this))
    })
}

/**
 * Обновляет значения на элементе
 * @param {*} elem 
 */
function update(elem){
    let name = elem.data('name')

    let key = Storage.get(name, defaults[name] + '')
    let val = typeof values[name] == 'string' ? key : values[name][key] || values[name][defaults[name]]
    let plr = elem.attr('placeholder')

    if(!val && plr) val = plr

    elem.find('.settings-param__value').text(val)
}

/**
 * Получить значение параметра
 * @param {String} name 
 * @returns *
 */
function field(name){
    return Storage.get(name, defaults[name] + '')
}

/**
 * Добовляем селекторы
 */
select('interface_size',{
    'small': 'Меньше',
    'normal': 'Нормальный'
},'normal')

select('parser_torrent_type',{
    'jackett': 'Jackett',
    'torlook': 'Torlook',
},'jackett')

select('torlook_parse_type',{
    'native': 'Напрямую',
    'site': 'Через API сайта',
},'native')

select('background_type',{
    'complex': 'Сложный',
    'simple': 'Простой',
    'poster': 'Картинка',
},'complex')

select('pages_save_total',{
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
},'5')

select('player',{
    'inner': 'Встроенный'
},'inner')

select('torrserver_use_link',{
    'one': 'Основную',
    'two': 'Дополнительную'
},'one')

select('subtitles_size',{
    'small': 'Маленькие',
    'normal': 'Обычные',
    'large': 'Большие',
},'normal')

select('screensaver_type',{
    'movie': 'Фильмы',
    'nature': 'Природа',
},'movie')

select('tmdb_lang',{
    'ru': 'Русский',
    'en': 'Английский',
},'ru')

select('parse_lang',{
    'df': 'Оригинал',
    'ru': 'Русский',
},'df')

select('player_timecode',{
    'again': 'Начать с начала',
    'continue': 'Продолжить',
},'continue')

select('player_scale_method',{
    'transform': 'Transform',
    'calculate': 'Рассчитать',
},'transform')

select('source',{
    'tmdb': 'TMDB',
    'ivi': 'IVI',
    'okko': 'OKKO',
},'tmdb')

select('start_page', {
    'main': 'Главная',
    'last': 'Последняя'
}, 'main')

/**
 * Добовляем тригеры
 */
trigger('animation',true)
trigger('background',true)
trigger('torrserver_savedb',false)
trigger('torrserver_preload', false);
trigger('parser_use',false)
trigger('torrserver_auth',false)
trigger('mask',true)
trigger('playlist_next',true)
trigger('internal_torrclient', true)
trigger('subtitles_stroke', true);
trigger('subtitles_backdrop', false);
trigger('screensaver', true)

/**
 * Добовляем поля
 */
select('jackett_url','','jac.red')
select('jackett_key','','')
select('torrserver_url','','')
select('torrserver_url_two','','')
select('torrserver_login','','')
select('torrserver_password','','')
select('parser_website_url','','')
select('torlook_site','','w41.torlook.info')

export default {
    init,
    bind,
    update,
    field
}