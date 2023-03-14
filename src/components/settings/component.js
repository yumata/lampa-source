import Template from '../../interaction/template'
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Params from '../settings/params'
import Storage from '../../utils/storage'
import Platform from '../../utils/platform'
import Noty from '../../interaction/noty'
import Api from './api'
import Lang from '../../utils/lang'

function Component(name, component_params = {}){
    let scrl = new Scroll({mask: true, over:true, step: 200})
    let comp = Template.get('settings_'+name)
    let last

    /**
     * Обновить скролл
     */
    function updateScroll(){
        comp.find('.selector').unbind('hover:focus').on('hover:focus',(e)=>{
            last = e.target
    
            scrl.update($(e.target),true)
        }).unbind('hover:hover').on('hover:hover',(e)=>{
            last = e.target
        })
    }

    /**
     * Билдим все события
     */
    function buildEvents(){
        if(!Platform.is('android')){
            comp.find('.is--android').remove()
        }
    
        if(!Platform.any()){
            comp.find('.is--player').remove()
        }

        if(!Platform.desktop()){
            comp.find('.is--nw').remove()
        }

        if(!window.lampa_settings.lang_use) comp.find('[data-name="light_version"]').prev().remove()

        scrl.render().find('.scroll__content').addClass('layer--wheight').data('mheight',$('.settings__head'))

        comp.find('.clear-storage').on('hover:enter',()=>{
            Noty.show(Lang.translate('settings_clear_cache'))

            localStorage.clear()

            setTimeout(()=>{
                window.location.reload()
            },1000)
        })

        Params.bind(comp.find('.selector'), comp)

        Params.listener.follow('update_scroll',updateScroll)

        Params.listener.follow('update_scroll_position',()=>{
            if(last) scrl.update($(last),true)
        })

        updateScroll()
    }

    /**
     * Добавляем пользовательские параметры
     */
    function addParams(){
        let params = Api.getParam(name)

        if(params){
            params.forEach(data=>{
                let item;

                if(data.param.type == 'select'){
                    item = $(`<div class="settings-param selector" data-type="select" data-name="${data.param.name}">
                        <div class="settings-param__name">${data.field.name}</div>
                        <div class="settings-param__value"></div>
                    </div>`)
                }
                if(data.param.type == 'trigger'){
                    item = $(`<div class="settings-param selector" data-type="toggle" data-name="${data.param.name}">
                        <div class="settings-param__name">${data.field.name}</div>
                        <div class="settings-param__value"></div>
                    </div>`)
                }
                if(data.param.type == 'input'){
                    item = $(`<div class="settings-param selector" data-type="input" data-name="${data.param.name}" placeholder="${data.param.placeholder}">
                        <div class="settings-param__name">${data.field.name}</div>
                        <div class="settings-param__value"></div>
                    </div>`)
                }
                if(data.param.type == 'title'){
                    item = $(`<div class="settings-param-title"><span>${data.field.name}</span></div>`)
                }
                if(data.param.type == 'static'){
                    item = $(`<div class="settings-param selector" data-static="true">
                        <div class="settings-param__name">${data.field.name}</div>
                    </div>`)
                }

                if(item){
                    if(data.field.description) item.append(`<div class="settings-param__descr">${data.field.description}</div>`)

                    if(typeof data.onRender == 'function') data.onRender(item)
                    if(typeof data.onChange == 'function') item.data('onChange',data.onChange)

                    comp.append(item)
                } 
            })
        }
    }
    
    /**
     * Стартуем
     */
    function start(){
        addParams()

        buildEvents()

        if(typeof component_params.last_index !== 'undefined' && component_params.last_index > 0) last = comp.find('.selector').eq(component_params.last_index)[0]

        Controller.add('settings_component',{
            toggle: ()=>{
                Controller.collectionSet(comp)
                Controller.collectionFocus(last,comp)
            },
            up: ()=>{
                Navigator.move('up')
            },
            down: ()=>{
                Navigator.move('down')
            },
            back: ()=>{
                scrl.destroy()
    
                comp.remove()
    
                Params.listener.remove('update_scroll',updateScroll)
    
                Controller.toggle('settings')
            }
        })
    }

    start()

    /**
     * Уничтожить
     */
    this.destroy = ()=>{
        scrl.destroy()

        comp.remove()

        comp = null

        Params.listener.remove('update_scroll',updateScroll)
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = ()=>{
        scrl.append(comp)
        
        return scrl.render()
    }
}

export default Component