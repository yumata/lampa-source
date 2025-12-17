import Template from '../template'
import Controller from '../../core/controller'
import Activity from './activity'
import Component from '../../core/component'
import Noty from '../noty'

/**
 * Слайд активности
 * @param {Object} component - Компонент активности
 * @param {Object} object - Параметры активности
 */
class ActivitySlide{
    constructor(component, object){
        this.component = component
        this.object    = object || {}

        this.slide = Template.js('activity')
        this.body  = this.slide.find('.activity__body')

        this.is_stopped = false
        this.is_started = false
    }

    /**
     * Создание активности
     * @returns {void}
     */
    create(){
        try{
            this.component.create(this.body)

            this.body.append(this.component.render(true))
        }
        catch(e){
            console.log('Activity','create error:', e.stack)

            Noty.show('Activity create error:' + e.message + ' ' + e.stack)

            this.component = Component.create({
                component: 'nocomponent'
            })

            this.component.activity = this

            this.create()
        }
    }

    /**
     * Показывает загрузку
     * @param {boolean} status 
     */
    loader(status){
        this.slide.toggleClass('activity--load', status)
    }

    /**
     * Стартуем активную активность
     * @return {void}
     */
    start(){
        this.is_started = true
        this.is_stopped = false

        Controller.add('content',{
            invisible: true,
            toggle: ()=>{
                Controller.clear()
            },
            left: ()=>{
                Controller.toggle('menu')
            },
            up: ()=>{
                Controller.toggle('head')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')

        if(this.waite_refresh) this.runRefresh()
        else {
            try{
                this.component.start()
            }
            catch(e){
                console.log('Activity','start error:', e.stack)

                Noty.show('Activity start error:' + e.message + ' ' + e.stack)
            }
        }
    }


    /**
     * Пауза активности
     * @return {void}
     */
    pause(){
        this.is_started = false

        this.component.pause && this.component.pause()
    }

    /**
     * Включаем активность если она активна
     * @return {void}
     */
    toggle(){
        if(this.is_started) this.start()
    }

    /**
     * Событие изменения размеров окна
     * @return {void}
     */
    resize(){
        if(this.component.resize) this.component.resize()
    }

    /**
     * Обновить активность (если активна) или при следующем старте
     * @return {void}
     */
    refresh(){
        if(this.waite_refresh) return

        this.waite_refresh = true

        if(Activity.own(this.component)) this.runRefresh()
    }

    /**
     * Запуск обновления активности
     * @returns {void}
     */
    runRefresh(){
        // Если нет пометки на обновление, то не обновляем
        if(!this.waite_refresh) return

        clearTimeout(this.timer_refresh)

        // При переходе назад текушая активность уничтожается через 200мс, поэтому ждем на удаление и запускаем обновление
        this.timer_refresh = setTimeout(()=>{
            if(this.component.beforeRefresh) this.component.beforeRefresh()

            Activity.replace()
        }, 400)

        this.loader(true)
    }

    canRefresh(){
        console.warn('activity.canRefresh is deprecated')

        return false
    }

    needRefresh(){
        console.warn('activity.needRefresh is deprecated, use activity.refresh()')
    }

    /**
     * Останавливает активность когда открывается другая
     * @return {void}
     */
    stop(){
        this.is_started = false

        if(this.is_stopped) return

        this.is_stopped = true

        this.component.stop && this.component.stop()

        this.slide.remove()
    }

    /**
     * Вернуть HTML слайд активности
     * @param {boolean} js - вернуть js объект
     * @returns {jQuery|HTMLElement} - HTML слайд активности
     */
    render(js){
        return js ? this.slide : $(this.slide)
    }

    /**
     * Уничтожение активности
     * @returns {void}
     */
    destroy(){
        try{
            this.component.destroy()
        }
        catch(e){
            console.log('Activity','destroy error:', e.stack)
        }

        // После create работает долгий запрос и затем вызывается build, однако уже было вызвано destroy и возникают ошибки, поэтому заодно чистим функцию build и остальные функции компонента
        for(let f in this.component){
            if(typeof this.component[f] == 'function'){
                this.component[f] = function(){}
            }
        }

        // Помечаем что компонент уничтожен, для внутренних функций компонента
        this.component.destroyed = true

        this.slide.remove()

        clearTimeout(this.timer_refresh)
    }
}


export default ActivitySlide