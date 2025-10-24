import Template from './template'
import Cache from '../utils/cache'
import Arrays from '../utils/arrays'
import Platform from '../core/platform'
import Lang from '../core/lang'
import Storage from '../core/storage/storage'

let html = null

/**
 * Показать подсказку по управлению
 * @param {Object} params - Параметры
 * @param {string} params.name - Имя для кеша
 * @param {string} params.text - Текст подсказки
 * @param {string} params.button - Кнопка для подсветки (ok, up, down, left, right)
 * @param {number} params.interval - Интервал показа в минутах (по умолчанию 7 дней)
 * @return {void}
 */
function show(params = {}){
    if(html || !Platform.tv()) return

    Arrays.extend(params, {
        name: 'none',
        text: Lang.translate('remote_helper_long'),
        button: 'ok',
        interval: 60 * 24 * 7 // week
    })

    let cached_time = Storage.get('remote_helper', '{}')

    if(cached_time[params.name] && cached_time[params.name] + 1000 * 60 * params.interval > Date.now()) return

    html = Template.js('remote_helper', params)

    html.addClass('highlight--' + params.button)

    document.body.appendChild(html)

    setTimeout(()=>{
        html.addClass('active')

        setTimeout(()=>{
            html.removeClass('active')

            setTimeout(()=>{
                html.remove()
                html = null
            },500)
        },10000)
    },10)

    Storage.set('remote_helper', {
        ...cached_time,
        [params.name]: Date.now()
    })
}

export default {
    show
}