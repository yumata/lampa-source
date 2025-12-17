import Template from '../template'
import Params from './params'

let components = {}
let params = {}

/**
 * Добавить компонент
 * @param {{component:string, icon:string, name:string}} data 
 */
function addComponent(data){
    components[data.component] = data

    Template.add('settings_'+data.component, '<div></div>')
}

/**
 * Получить компонент
 * @param {string} component 
 * @returns {{component:string, icon:string, name:string}}
 */
function getComponent(component){
    return components[component]
}

/**
 * Удалить компонент
 * @param {string} component
 */
function removeComponent(component){
    delete components[component]
    delete params[component]
}

/**
 * Добавить параметр
 * @param {{component:string, param:{name:string, type:string, values:string|object, default:string|boolean}, field:{name:string, description:string|undefined}, onRender:((item)=>void)|undefined, onChange?:((e)=>void)|undefined}} data 
 */
function addParam(data){
    if(!params[data.component]) params[data.component] = []

    params[data.component].push(data)

    if(data.param.type == 'select' || data.param.type == 'input') Params.select(data.param.name, data.param.values, data.param.default)
    if(data.param.type == 'trigger') Params.trigger(data.param.name, data.param.default)
}

/**
 * Получить параметры
 * @param {string} component 
 * @returns {[{component:string, param:{name:string, type:string, values:string|object, default:string|boolean}, field:{name:string, description:string|undefined}, onRender:((item)=>void)|undefined, onChange?:((e)=>void)|undefined}]}
 */
function getParam(component){
    return params[component]
}
/**
 * Удалить параметры
 * @param {string} component 
 */
function removeParams(component){
    delete params[component]
}

/**
 * Получить все компоненты
 * @returns {{name:{component:string, icon:string, name:string}}}
 */
function allComponents(){
    return components
}

/**
 * Получить все параметры
 * @returns {{component:[{component:string, param:{name:string, type:string, values:string|object, default:string|boolean}, field:{name:string, description:string|undefined}, onRender:((item)=>void)|undefined, onChange?:((e)=>void)|undefined}]}}
 */
function allParams(){
    return params
}

export default {
    allComponents,
    allParams,

    addComponent,
    addParam,

    getParam,
    getComponent,
    
    removeComponent,
    removeParams
}