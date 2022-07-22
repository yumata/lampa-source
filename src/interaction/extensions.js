import Template from './template'
import Scroll from './scroll'
import Controller from './controller'
import Reguest from '../utils/reguest'
import Subscribe from '../utils/subscribe'
import Status from '../utils/status'
import Account from '../utils/account'
import Select from './select'
import Input from '../components/settings/input'
import Plugins from '../utils/plugins'
import Modal from './modal'
import Noty from './noty'
import Lang from '../utils/lang'

let html
let last_controller
let last_hover
let main_scroll

let listener = Subscribe()
let network  = new Reguest() 
let opened   = false

function init(){}

function Plugin(plug, params){
    let item = Template.get('extensions_item',plug)
    let memo = params.type == 'installs' || params.type == 'plugins' || params.connected

    item.on('hover:enter',(e)=>{
        let menu = []

        if(params.type == 'plugins' || params.type == 'installs'){
            menu.push({
                title: Lang.translate('extensions_' + (plug.status ? 'disable': 'enable')),
                toggle: true
            })
        }

        menu.push({
            title: Lang.translate('extensions_check'),
            status: true
        })

        if(params.cub){
            if(params.type == 'extensions'){
                menu.push({
                    title: Lang.translate('extensions_install'),
                    install: true
                })
            }

            menu.push({
                title: Lang.translate('extensions_info'),
                ghost: !Boolean(plug.instruction),
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
            onBack: toggle,
            onSelect: (a)=>{
                if(a.toggle){
                    plug.status = plug.status == 1 ? 0 : 1

                    if(params.cub) Account.pluginsStatus(plug, plug.status)
                    else Plugins.save()

                    this.update()

                    toggle()
                }
                else if(a.change || a.change){
                    Input.edit({
                        title: a.change == 'name' ? Lang.translate('extensions_set_name') : Lang.translate('extensions_set_url'),
                        value: plug[a.change] || '',
                        free: true,
                        nosave: true
                    },(new_value)=>{
                        if(new_value){
                            plug[a.change] = new_value

                            Plugins.save()

                            this.update()

                            toggle()

                            if(a.change == 'url') this.check()
                        }
        
                        toggle()
                    })
                }
                else if(a.status){
                    toggle()

                    this.check()
                }
                else if(a.install){
                    let ready = Plugins.get().find(b=>b.url == plug.link)

                    if(ready){
                        Noty.show(Lang.translate('extensions_ready'))

                        toggle()
                    }
                    else{
                        Plugins.add({url:plug.link, status: 1, name: plug.name, author: plug.author})

                        needReload()

                        item.find('.extensions__item-included').removeClass('hide')
                    }
                }
                else if(a.instruction){
                    let text = $('<div class="about"></div>')

                    text.html((plug.instruction || Lang.translate('extensions_no_info')).replace(/\n/g,'<br>').replace(/\s\s/g,'&nbsp;&nbsp;'))

                    Modal.open({
                        title: Lang.translate('extensions_info'),
                        html: text,
                        size: 'large',
                        onBack: ()=>{
                            Modal.close()

                            toggle()
                        }
                    })
                }
                else if(a.remove){
                    this.remove()

                    toggle()
                }
            }
        })
    })

    if(params.cub) item.append('<div class="extensions__cub">CUB</div>')
    if(Plugins.loaded().indexOf(plug.url) >= 0) item.find('.extensions__item-included').toggleClass('hide',false)

    if(!memo){
        item.find('.extensions__item-disabled').remove()
        item.find('.extensions__item-check').toggleClass('hide',true)

        if(Plugins.get().find(b=>b.url == plug.link)) item.find('.extensions__item-included').toggleClass('hide',false)
    } 

    this.update = function(){
        item.find('.extensions__item-name').text(plug.name || Lang.translate('extensions_no_name'))
        item.find('.extensions__item-author').text(plug.author || (params.type == 'plugins' ? '@cub' : '@lampa'))
        item.find('.extensions__item-descr').text(plug.descr || plug.url || plug.link)
        item.find('.extensions__item-disabled').toggleClass('hide',Boolean(plug.status))
    }

    this.check = function(){
        let check = $('.extensions__item-check',item).removeClass('hide')
        let code  = $('.extensions__item-code',item).addClass('hide')
        let stat  = $('.extensions__item-status',item).addClass('hide')

        let display = (type, num, text)=>{
            code.text(num).removeClass('hide success error').addClass(type)
            stat.text(text).removeClass('hide')
            check.addClass('hide')
        }

        network.timeout(5000)
        network.native(plug.url || plug.link,(str)=>{
            if(/Lampa\./.test(str)){
                display('success',200,Lang.translate('extensions_worked'))
            }
            else{
                display('error',500,Lang.translate('extensions_no_plugin'))
            }
        },(a,e)=>{
            display('error',404,Lang.translate('title_error'))
        },false,{
            dataType: 'text'
        })
    }

    this.remove = function(){
        Navigator.move('left')

        Plugins.remove(plug)

        item.remove()
    }

    this.render = function(){
        return item
    }

    this.update()

    if(memo) this.check()
}

function needReload(){
    Modal.open({
        title: '',
        html: $('<div class="about"><div class="selector">'+Lang.translate('plugins_need_reload')+'</div></div>'),
        onBack: ()=>{
            Modal.close()

            toggle()
        },
        onSelect: ()=>{
            Modal.close()

            toggle()
        }
    })
}

function append(title, data, params = {}){
    let block  = Template.get('extensions_block',{title})
    let scroll = new Scroll({
        horizontal: true,
        scroll_by_item:true
    })

    let update = function(e, is_mouse){
        last_hover = e.target

        if(!is_mouse){
            scroll.update($(e.target),false)

            main_scroll.update(block)
        }
    }

    if(!params.cub){
        let add = $('<div class="extensions__block-add selector">'+Lang.translate('extensions_add')+'</div>')

        add.on('hover:enter',(e)=>{
            Input.edit({
                title: Lang.translate('extensions_set_url'),
                value: '',
                free: true,
                nosave: true
            },(new_value)=>{
                if(new_value){
                    let data   = {url:new_value, status: 1}
                    let plugin = new Plugin(data, params)

                    Plugins.add(data)

                    plugin.render().on('hover:focus',update)

                    add.after(plugin.render())

                    needReload()
                }
                else{
                    toggle()
                }
                
            })
        }).on('hover:focus',update)

        scroll.append(add)
    }

    data.forEach(plug=>{
        let plugin = new Plugin(plug, params)

        plugin.render().on('hover:focus',update)

        scroll.append(plugin.render())
    })

    block.find('.extensions__block-body').append(scroll.render())

    main_scroll.append(block)
}

function load(){
    let status = new Status(5)

    status.onComplite = ()=>{
        if(!opened) return

        main_scroll.render().find('.broadcast__scan').remove()

        append(Lang.translate('extensions_from_memory'), status.data.installs, {type: 'installs'})

        if(status.data.plugins.length) append(Lang.translate('extensions_from_cub'), status.data.plugins,{cub:true, type: 'plugins'})

        if(status.data.connected && status.data.connected.length) append(Lang.translate('extensions_from_connected'), status.data.connected,{cub:true, type: 'extensions', connected: true})
        if(status.data.extensions_best && status.data.extensions_best.length) append(Lang.translate('extensions_from_popular'), status.data.extensions_best,{cub:true, type: 'extensions'})
        if(status.data.extensions_all && status.data.extensions_all.length)  append(Lang.translate('extensions_from_lib'), status.data.extensions_all.reverse(),{cub:true, type: 'extensions'})

        toggle()
    }

    status.append('installs', Plugins.get().reverse())

    Account.plugins((plugins)=>{
        status.append('plugins', plugins.filter(e=>!e.author))
        status.append('connected', plugins.filter(e=>e.author))
    })

    Account.extensions((extensions)=>{
        status.append('extensions_best', extensions.best)
        status.append('extensions_all', extensions.plugins)
    })
}

function show(){
    opened = true

    html = Template.get('extensions')

    last_controller = Controller.enabled().name

    main_scroll = new Scroll({
        scroll_by_item:true,
        mask: true
    })

    main_scroll.minus($('.extensions__head',html))

    main_scroll.append($('<div class="broadcast__scan"><div></div></div>'))

    load()

    html.find('.extensions__body').append(main_scroll.render())

    $('body').append(html)

    toggle()
}

function toggle(){
    Controller.add('extensions',{
        toggle: ()=>{
            Controller.collectionSet(html)
            Controller.collectionFocus(last_hover,html)
        },
        up: ()=>{
            Navigator.move('up')
        },
        down: ()=>{
            Navigator.move('down')
        },
        right: ()=>{
            Navigator.move('right')
        },
        left: ()=>{
            Navigator.move('left')
        },
        back: close
    })
    
    Controller.toggle('extensions')
}

function close(){
    network.clear()

    html.remove()

    opened = false

    last_hover = false

    Controller.toggle(last_controller)
}

function render(){
    return html
}

export default {
    init,
    listener,
    show,
    render
}