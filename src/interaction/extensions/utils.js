import Template from '../template'
import Modal from '../modal'
import Utils from '../../utils/math'
import Lang from '../../utils/lang'

function showReload(cancel){
    Modal.open({
        title: '',
        align: 'center',
        zIndex: 300,
        html: $('<div class="about">'+Lang.translate('plugins_need_reload')+'</div>'),
        buttons: [
            {
                name: Lang.translate('settings_param_no'),
                onSelect: ()=>{
                    Modal.close()

                    cancel()
                }
            },
            {
                name: Lang.translate('settings_param_yes'),
                onSelect: ()=>{
                    window.location.reload()
                }
            }
        ]
    })
}

function showInfo(plug, back){
    let modal = Template.get('extensions_info')
    let footer = $('.extensions-info__footer',modal)

    if(plug.image) modal.prepend($('<img class="extensions-info__image" src="'+plug.image+'"/>'))

    $('.extensions-info__descr',modal).text(plug.descr)
    $('.extensions-info__instruction',modal).html((plug.instruction || Lang.translate('extensions_no_info')).replace(/\n/g,'<br>').replace(/\s\s/g,'&nbsp;&nbsp;'))

    function addLabel(name, value){
        let label = $(`<div>
            <div class="extensions-info__label">${name}</div>
            <div class="extensions-info__value">${value}</div>
        </div>`)

        footer.append(label)
    }

    if(plug.link) addLabel(Lang.translate('settings_parser_jackett_link'), plug.link)
    if(plug.author) addLabel(Lang.translate('title_author'), plug.author)
    if(plug.time) addLabel(Lang.translate('settings_added'), Utils.parseTime(plug.time).full)

    Modal.open({
        title: plug.name || Lang.translate('extensions_info'),
        html: modal,
        size: 'large',
        onBack: ()=>{
            Modal.close()

            back()
        }
    })
}

export default {
    showReload,
    showInfo
}