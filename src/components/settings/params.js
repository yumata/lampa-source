import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Input from './input'

let values   = {}
let defaults = {}

function trigger(name,_default){
    values[name] = {
        'true':'Да',
        'false':'Нет'
    }

    defaults[name] = _default
}

function select(name, _select, _default){
    values[name] = _select

    defaults[name] = _default
}

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

function update(elem){
    let name = elem.data('name')

    let key = Storage.get(name, defaults[name] + '')
    let val = typeof values[name] == 'string' ? key : values[name][key] || values[name][defaults[name]]
    let plr = elem.attr('placeholder')

    if(!val && plr) val = plr

    elem.find('.settings-param__value').text(val)
}

function field(name){
    return Storage.get(name, defaults[name] + '')
}

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





trigger('animation',true)
trigger('background',true)
trigger('torrserver_savedb',false)
trigger('torrserver_preload', false)
trigger('parser_use',false)
trigger('torrserver_auth',false)
trigger('mask',true)


select('jackett_url','','jac.red')
select('jackett_key','','')
select('torrserver_url','','')
select('torrserver_login','','')
select('torrserver_password','','')
select('parser_website_url','','')
select('torlook_site','','w41.torlook.info')

export default {
    bind,
    update,
    field
}