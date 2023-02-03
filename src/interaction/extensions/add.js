import Template from '../template' 
import Lang from '../../utils/lang'
import Input from '../../components/settings/input'

class Add{
    constructor(){
        this.html = document.createElement('div')
        this.html.classList.add('extensions__block-add')
        this.html.classList.add('selector')
        this.html.innerText = Lang.translate('extensions_add')

        this.html.addEventListener('hover:enter',()=>{
            Input.edit({
                title: Lang.translate('extensions_set_url'),
                value: '',
                free: true,
                nosave: true
            },(new_value)=>{
                this.onAdd(new_value)
            })
        })

        this.html.addEventListener('hover:focus',()=>{

        })
    }

    render(){
        return this.html
    }
}

export default Add