import Template from '../template'
import Controller from '../../core/controller'

/**
 * Добавляет шапку с кнопкой назад
 * @param {string} title - заголовок шапки
 * @param {boolean} js - возвращать HTMLElement объект
 * @returns {HTMLElement|jQuery} - элемент шапки
 */
export default function(title, js){
    let head = Template[js ? 'js' : 'get']('head_backward', {title: title})

    head.find('.head-backward__button').on('click', Controller.back.bind(Controller))

    return head
}