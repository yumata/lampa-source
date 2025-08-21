import Template from '../template'
import Controller from '../../core/controller'
import Activity from './activity'

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

        this.component.start()
    }

    /**
     * Стартуем активную активность
     */
    start(){
        this.is_started = true

        Controller.add('content',{
            invisible: true,
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

        this.component.start()
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

    // this.refresh = function(){
    //     component.refresh && component.refresh()
    // }

    // this.canRefresh = function(){
    //     let status = this.is_started && this.need_refresh && inActivity() ? true : false

    //     if(status){
    //         this.need_refresh = false

    //         replace(object)
    //     }

    //     return status
    // }

    // this.needRefresh = function(){
    //     if(body.parentElement) body.parentElement.removeChild(body)

    //     this.need_refresh = true

    //     let wait = Template.js('activity_wait_refresh')

    //     wait.addEventListener('click',(e)=>{
    //         if(DeviceInput.canClick(e.originalEvent)) this.canRefresh()
    //     })

    //     slide.appendChild(wait)
    // }

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
        this.component.destroy()

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