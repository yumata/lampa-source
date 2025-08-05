import Lang from '../../../utils/lang'
import Controller from '../../controller'
import Select from '../../select'

class Module{
    onInit(){
        this.menu_list = []
    }

    onCreate(){
        this.card.on('hover:long', ()=>{
            let enabled = Controller.enabled().name
            let menu = []

            this.menu_list.forEach((item, i)=>{
                i !== 0 && menu.push({
                    title: item.title,
                    separator: true
                })

                menu = menu.concat(item.menu())
            })

            if(!menu.length) return

            this.emit('menu', menu, this.card, this.data)

            Select.show({
                title: Lang.translate('title_action'),
                items: menu,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onBeforeClose: ()=>{
                    Controller.toggle(enabled)

                    return true
                }
            })
        })
    }
}

export default Module