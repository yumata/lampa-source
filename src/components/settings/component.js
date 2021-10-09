import Template from '../../interaction/template'
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Params from '../settings/params'
import Storage from '../../utils/storage'
import Platform from '../../utils/platform'

function component(name){
    let scrl = new Scroll({mask: true, over:true})
    let comp = Template.get('settings_'+name)
    let last

    if(Storage.get('native')){
        comp.find('.is--torllok').remove()
    }

    if(!Platform.any()){
        comp.find('.is--player').remove()
    }

    scrl.render().find('.scroll__content').addClass('layer--wheight').data('mheight',$('.settings__head'))

    comp.find('.selector').on('hover:focus',(e)=>{
        last = e.target
        scrl.update($(e.target),true)
    })

    Params.bind(comp.find('.selector'))

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

            Controller.toggle('settings')
        }
    })

    this.destroy = ()=>{
        scrl.destroy()

        comp.remove()

        comp = null
    }

    this.render = ()=>{
        return scrl.render(comp)
    }
}

export default component