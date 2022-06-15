import Template from '../../interaction/template'
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Api from './api'

function Main(){
    let comp
    let scrl = new Scroll({mask:true,over:true})
    let last

    /**
     * Создать
     */
    this.create = ()=>{
        comp = Template.get('settings_main')

        this.update()
    }

    /**
     * Обновить события
     */
    this.update = ()=>{
        let components = Api.allComponents()

        for(let name in components){
            let aded = components[name]

            if(!comp.find('[data-component="'+name+'"]').length){
                let item = $(`<div class="settings-folder selector" data-component="${name}">
                    <div class="settings-folder__icon">
                        ${aded.icon}
                    </div>
                    <div class="settings-folder__name">${aded.name}</div>
                </div>`)

                comp.append(item)
            }
        }

        comp.find('.selector').unbind('hover:focus hover:enter').on('hover:focus',(event)=>{
            last = event.target

            scrl.update($(event.target),true)
        }).on('hover:enter',(event)=>{
            this.render().detach()

            this.onCreate($(event.target).data('component'))
        })
    }

    /**
     * Сделать активным
     */
    this.active = function(){
        Controller.collectionSet(comp)
        Controller.collectionFocus(last,comp)

        scrl.height($('.settings__head'))
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = ()=>{
        return scrl.render(comp)
    }
}

export default Main