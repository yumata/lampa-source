import Lang from '../core/lang'

let html
let destroyed = false

/**
 * Отображает прогресс загрузки приложения
 * @returns {void}
 */
function init(){
    html = $(`<div style="position: fixed; left: 0; top: 50%; right: 0; z-index: 101; text-align: center; padding-top: 6em; padding-top: 13vh;">
        <div style="font-size: 1.5em; line-height: 1.6" class="lp-step"></div>
        <div style="font-size: 0.9em; opacity: 0.5" class="lp-status"></div>
    </div>`)

    $('body').append(html)

    step(0)
}

/**
 * Обновляет шаг загрузки
 * @param {number} position - номер шага
 */
function step(position){
    if(destroyed) return
    
    html.find('.lp-step').text(Lang.translate('loading_progress_step_' + position))

    console.log('LoadingProgress', 'step:', position, Lang.translate('loading_progress_step_' + position))
}

/**
 * Обновляет статус загрузки
 * @param {string} text - текст статуса
 */
function status(text){
    if(destroyed) return

    html.find('.lp-status').text(text)

    console.log('LoadingProgress', 'status:', text)
}

/**
 * Удаляет прогресс загрузки
 * @returns {void}
 */
function destroy(){
    destroyed = true

    html.remove()
}

export default {
    init,
    step,
    status,
    destroy
}