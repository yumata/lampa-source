import Template from '../../interaction/template'
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'

function main(){
    let comp
    let scrl = new Scroll({mask:true,over:true})
    let last

    this.create = ()=>{
        comp = Template.get('settings_main')

        comp.find('.selector').on('hover:focus',(event)=>{
            last = event.target

            scrl.update($(event.target),true)
        }).on('hover:enter',(event)=>{
            this.render().detach()

            this.onCreate($(event.target).data('component'))
        })
    }

    this.active = function(){
        Controller.collectionSet(comp)
        Controller.collectionFocus(last,comp)
    }

    this.render = ()=>{
        return scrl.render(comp)
    }
}

export default main