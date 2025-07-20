import Lang from '../../../utils/lang'
import Controller from '../../controller'
import Select from '../../select'

class Module{
    onInit(){
        this.menu_list = []

        this.onMenu = ()=>{
            let enabled   = Controller.enabled().name
            let menu_main = []

            this.menu_list.forEach((item, i)=>{
                i !== 0 && menu_main.push({
                    title: item.title,
                    separator: true
                })

                menu_main = menu_main.concat(item.menu())
            })

            console.log('Menu', 'show', menu_main, this.menu_list)

            if(!menu_main.length) return
    
            if(this.onMenuShow) this.onMenuShow(menu_main, this.card, this.data)
    
            Select.show({
                title: Lang.translate('title_action'),
                items: menu_main,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onBeforeClose: ()=>{
                    Controller.toggle(enabled)

                    return true
                }
            })
        }
    }
}

export default Module