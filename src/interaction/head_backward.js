import Template from './template'
import Controller from './controller'

export default function(title, use_js){
    let head = Template[use_js ? 'js' : 'get']('head_backward',{title: title})

    if(use_js){
        head.querySelector('.head-backward__button').addEventListener('click',()=>{
            Controller.back()
        })

        head.querySelector('.head-backward__title').innerText = title
    }
    else{
        head.find('.head-backward__button').on('click',()=>{
            Controller.back()
        })
    }

    return head
}