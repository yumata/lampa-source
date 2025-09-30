import Template from '../template'
import Controller from '../../core/controller'
import Activity from './activity'
import Component from '../../core/component'

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
     * Создает
     */
    create(){
        try{
            this.component.create(this.body)

            this.body.append(this.component.render(true))
        }
        catch(e){
            console.log('Activity','create error:', e.stack)

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
     * Создает повторно
     */
    restart(){
        this.is_stopped = false

        try{
            this.component.start()
        }
        catch(e){
            console.log('Activity','restart error:', e.stack)
        }
    }

    /**
     * Стартуем активную активность
     */
    start(){
        this.is_started = true

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

        this.is_stopped = false

        if(this.waite_refresh){
            // Нужно подождать пока закроется текущее активити
            setTimeout(()=>{
                Activity.replace()
            }, 400)

            return this.loader(true)
        }

        try{
            this.component.start()
        }
        catch(e){
            console.log('Activity','start error:', e.stack)
        }
    }


    /**
     * Пауза
     */
    pause(){
        this.is_started = false

        this.component.pause && this.component.pause()
    }

    /**
     * Включаем активность если она активна
     */
    toggle(){
        if(this.is_started) this.start()
    }

    /**
     * Обновляет компонент
     */
    refresh(){
        if(Activity.own(this.component)) Activity.replace()
        else{
            this.waite_refresh = true
        }
    }

    canRefresh(){
        console.warn('activity.canRefresh is deprecated')

        return false
    }

    needRefresh(){
        console.warn('activity.needRefresh is deprecated, use activity.refresh()')
    }

    /**
     * Стоп
     */
    stop(){
        this.is_started = false

        if(this.is_stopped) return

        this.is_stopped = true

        this.component.stop && this.component.stop()

        if(this.slide.parentElement) this.slide.parentElement.removeChild(this.slide)
    }

    /**
     * Рендер
     */
    render(js){
        return js ? this.slide : $(this.slide)
    }

    /**
     * Уничтожаем активность
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

        this.slide.remove()
    }
}


export default ActivitySlide