import Template from './template'
import Controller from '../core/controller'

export default function(title, js){
    let head = Template[js ? 'js' : 'get']('head_backward', {title: title})

    head.find('.head-backward__button').on('click', Controller.back.bind(Controller))

    return head
}