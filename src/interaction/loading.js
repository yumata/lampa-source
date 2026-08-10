import Controller from '../core/controller'
import Lang from '../core/lang'
import DeviceInput from './device_input'
import MediaLoading from './media_loading'

let callback_cancel,
    controller_enabled,
    loader,
    media_loader,
    timer

/**
 * Отображает слой загрузки с возможностью отмены
 * @param {function} on_cancel - вызывается при отмене загрузки
 * @param {string} text - текст загрузки
 * @returns {void}
 */
function start(on_cancel, text, options = {}){
    callback_cancel = on_cancel

    controller_enabled = Controller.enabled().name

    if(media_loader){
        media_loader.destroy()
        media_loader = false
    }

    if(options.media){
        media_loader = MediaLoading.create()
        loader = media_loader.render().addClass('media-loading--standalone')

        media_loader.set(options.media)
        media_loader.update(options.progress || 0, text)
        media_loader.show()
    }
    else{
        loader = $(`<div class="loading-layer">
            <div class="loading-layer__box">
                <div class="loading-layer__text">${Lang.translate('loading')}</div>
                <div class="loading-layer__ico"></div>
            </div>
        </div>`)

        if(text) loader.find('.loading-layer__text').text(text)
    }

    loader.on('click',(e)=>{
        if(DeviceInput.canClick(e.originalEvent)) cancel()
    })

    clearTimeout(timer)

    if(options.media){
        $('body').append(loader)
    }
    else{
        timer = setTimeout(()=>{
            $('body').append(loader)
        },500)
    }
    

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
    if(media_loader){
        media_loader.destroy()
        media_loader = false
    }
    else if(loader) loader.remove()

    loader = false

    clearTimeout(timer)

    if(controller_enabled) Controller.toggle(controller_enabled)
}

/**
 * Обновляет текст загрузки
 * @param {string} text - текст загрузки
 * @returns {void}
 */
function setText(text){
    if(media_loader) media_loader.update(0, text)
    else if(loader) loader.find('.loading-layer__text').text(text)
}

function setProgress(progress, detail){
    if(media_loader) media_loader.update(progress, detail)
    else setText(Math.round(progress) + '%' + (detail ? ' - ' + detail : ''))
}

export default {
    start,
    stop,
    setText,
    setProgress
}
