import Item from './item'
import Reguest from '../../utils/reguest'
import Lang from '../../core/lang'
import Plugins from '../../core/plugins'
import Controller from '../../core/controller'
import Account from '../../core/account/account'
import Noty from '../noty'
import Select from '../select'
import Input from '../settings/input'
import Utils from './utils'
import UtilsOther from '../../utils/utils'

class Extension extends Item {
    constructor(data, params){
        super(data, params)

        this.network  = new Reguest()
        this.template = 'extensions_item'
    }

    visible(){
        super.visible()

        if(this.params.cub)   this.cub()
        if(this.data.premium) this.premium()
        if(this.params.autocheck) this.check()

        if(Plugins.loaded().indexOf(this.data.url || this.data.link) >= 0) this.html.querySelector('.extensions__item-included').classList.remove('hide')

        this.html.addEventListener('hover:enter',this.menu.bind(this))
    }

    menu(){
        if(this.removed) return

        let menu = []
        let controller = Controller.enabled().name
        let back = ()=>{
            Controller.toggle(controller)
        }

        if(this.params.type == 'plugins' || this.params.type == 'installs'){
            menu.push({
                title: Lang.translate('extensions_' + (this.data.status ? 'disable': 'enable')),
                toggle: true
            })
        }

        menu.push({
            title: Lang.translate('extensions_check'),
            status: true
        })

        if(this.params.cub || this.params.noedit){
            if(this.params.type == 'extensions'){
                menu.push({
                    title: Lang.translate('extensions_install'),
                    install: true
                })
            }

            menu.push({
                title: Lang.translate('extensions_info'),
                instruction: true
            })
        }
        else{
            menu.push({
                title: Lang.translate('extensions_edit'),
                separator: true
            })
            menu.push({
                title: Lang.translate('extensions_change_name'),
                change: 'name'
            })
            menu.push({
                title: Lang.translate('extensions_change_link'),
                change: 'url'
            })

            menu.push({
                title: Lang.translate('extensions_remove'),
                remove: true
            })
        }

        Select.show({
            title: Lang.translate('title_action'),
            items: menu,
            onBack: back,
            onSelect: (a)=>{
                if(a.toggle){
                    this.data.status = this.data.status == 1 ? 0 : 1

                    if(this.params.cub) Account.Api.pluginToggle(this.data, this.data.status)
                    else Plugins.save(this.data)

                    this.update()

                    if(this.data.status == 1){
                        back()

                        Plugins.push(this.data)
                    }
                    else{
                        Utils.showReload(back)
                    }
                }
                else if(a.change){
                    Input.edit({
                        title: a.change == 'name' ? Lang.translate('extensions_set_name') : Lang.translate('extensions_set_url'),
                        value: this.data[a.change] || '',
                        free: true,
                        nosave: true
                    },(new_value)=>{
                        if(new_value){
                            this.data[a.change] = new_value

                            Plugins.save(this.data)

                            this.update()

                            if(a.change == 'url'){
                                this.check()

                                Plugins.push(this.data)
                            }
                        }
        
                        back()
                    })
                }
                else if(a.status){
                    back()

                    this.check()
                }
                else if(a.install){
                    let ready = Plugins.get().find(b=>b.url == this.data.link)

                    if(ready){
                        Noty.show(Lang.translate('extensions_ready'))

                        back()
                    }
                    else{
                        back()

                        Plugins.add({url:this.data.link, status: 1, name: this.data.name, author: this.data.author})

                        this.html.querySelector('.extensions__item-included').classList.remove('hide')
                    }
                }
                else if(a.instruction){
                    Utils.showInfo(this.data, back)
                }
                else if(a.remove){
                    Plugins.remove(this.data)

                    this.html.style.opacity = 0.5
                    this.removed = true

                    Utils.showReload(back)
                }
            }
        })
    }

    check(){
        let check = this.html.querySelector('.extensions__item-check')
        let code = this.html.querySelector('.extensions__item-code')
        let stat = this.html.querySelector('.extensions__item-status')

        check.classList.remove('hide')
        code.classList.add('hide')
        stat.classList.add('hide')

        let display = (type, num, text)=>{
            code.innerText = num
            code.classList.remove('hide')
            code.classList.remove('success')
            code.classList.remove('error')
            code.classList.add(type)

            stat.innerText = text
            stat.classList.remove('hide')

            check.classList.add('hide')
        }

        let url = UtilsOther.fixMirrorLink(UtilsOther.rewriteIfHTTPS(this.data.url || this.data.link))

        this.network.timeout(5000)
        this.network.native(url,(str)=>{
            if(/Lampa\./.test(str)){
                display('success',200,Lang.translate('extensions_worked'))
            }
            else{
                display('error',500,Lang.translate('extensions_no_plugin'))
            }
        },(a,e)=>{
            display('error', a.decode_code || 404,Lang.translate('title_error'))
        },false,{
            dataType: 'text'
        })
    }
}

export default Extension