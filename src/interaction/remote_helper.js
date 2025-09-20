import Template from './template'
import Cache from '../utils/cache'
import Arrays from '../utils/arrays'
import Platform from '../core/platform'

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
    if(html || !Platform.tv() || !Cache.db) return

    Arrays.extend(params, {
        name: 'none',
        text: 'Удерживайте кнопку для вызова меню',
        button: 'ok',
        interval: 60 * 24 * 7 // week
    })

    let cache_name = 'remote_helper_' + params.name

    Cache.getDataAnyCase('other', cache_name, params.interval).then(cached_time=>{
        if(cached_time) return

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

        Cache.rewriteData('other', cache_name, Date.now())
    })
}

export default {
    show
}