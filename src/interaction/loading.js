import Controller from '../core/controller'
import Lang from '../core/lang'
import DeviceInput from './device_input'

let callback_cancel,
    controller_enabled,
    loader,
    timer

/**
 * Отображает слой загрузки с возможностью отмены
 * @param {function} on_cancel - вызывается при отмене загрузки
 * @param {string} text - текст загрузки
 * @returns {void}
 */
function start(on_cancel, text){
    callback_cancel = on_cancel

    controller_enabled = Controller.enabled().name

    loader = $(`<div class="loading-layer">
        <div class="loading-layer__box">
            <div class="loading-layer__text">${Lang.translate('loading')}</div>
            <div class="loading-layer__ico"></div>
        </div>
    </div>`)

    if(text) loader.find('.loading-layer__text').text(text)

    loader.on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)) cancel()
    })

    clearTimeout(timer)

    timer = setTimeout(()=>{
        $('body').append(loader)
    },500)
    

    toggle()
}

/**
 * Переключает контроллер на слой загрузки
 * @returns {void}
 */
function toggle(){
    Controller.add('loading',{
        invisible: true,
        toggle: ()=>{
            Controller.clear()
        },
        back: cancel,
        up: cancel,
        down: cancel,
        left: cancel,
        right: cancel
    })
    
    Controller.toggle('loading')
}

/**
 * Вызывает колбэк отмены загрузки
 * @returns {void}
 */
function cancel(){
    if(callback_cancel) callback_cancel()
}

/**
 * Удаляет слой загрузки и восстанавливает контроллер
 * @returns {void}
 */
function stop(){
    if(loader) loader.remove()

    clearTimeout(timer)

    if(controller_enabled) Controller.toggle(controller_enabled)
}

/**
 * Обновляет текст загрузки
 * @param {string} text - текст загрузки
 * @returns {void}
 */
function setText(text){
    if(loader) loader.find('.loading-layer__text').text(text)
}

export default {
    start,
    stop,
    setText
}