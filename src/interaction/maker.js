import Arrays from '../utils/arrays'
import Constructor from './constructor'
import MaskHelper from '../utils/mask'

import Card from './card/card'
import CardModule from './card/module/module'
import Main from './items/main'
import MainModule from './items/main/module/module'
import Category from './items/category'
import CategoryModule from './items/category/module/module'
import Line from './items/line'
import LineModule from './items/line/module/module'
import Company from './company/company'
import CompanyModule from './company/module/module'
import Discuss from './discuss/discuss'
import DiscussModule from './discuss/module/module'
import Episode from './episode/episode'
import EpisodeModule from './episode/module/module'
import Person from './person/person'
import PersonModule from './person/module/module'
import Register from './register/register'
import RegisterModule from './register/module/module'
import Season from './season/season'
import SeasonModule from './season/module/module'
import CardParser from './card_parser/card_parser'
import Empty from './empty/empty'

let classes = {
    Card: Card,
    Main: Main,
    Category: Category,
    Line: Line,
    Company: Company,
    Discuss: Discuss,
    Episode: Episode,
    Person: Person,
    Register: Register,
    Season: Season,
    CardParser: CardParser,
    Empty: Empty
}

let modules = {
    Card: CardModule,
    Main: MainModule,
    Category: CategoryModule,
    Line: LineModule,
    Company: CompanyModule,
    Discuss: DiscussModule,
    Episode: EpisodeModule,
    Person: PersonModule,
    Register: RegisterModule,
    Season: SeasonModule
}

class None extends Constructor({}) {}

function make(class_name, data = {}, createModule){
    let createName  = get(class_name, data, createModule)
    let createClass = new createName(data)

    if(data.params.emit && typeof data.params.emit == 'object' && typeof createClass.use == 'function'){
        createClass.use(data.params.emit)

        if(typeof data.params.emit.onInit == 'function'){
            data.params.emit.onInit(createClass)
        }
    }

    return createClass
}

function get(class_name, data = {}, createModule){
    if(typeof classes[class_name] == 'undefined'){
        console.log('Maker','error','no class', class_name)

        return None
    }
    else{
        Arrays.extend(data, {params: {}})

        if(typeof createModule !== 'undefined'){
            if(typeof modules[class_name] !== 'undefined'){
                data.params.module = createModule(modules[class_name])
            }
        }
        
        return classes[class_name]
    }
}

function module(class_name){
    if(typeof modules[class_name] !== 'undefined') return modules[class_name]

    console.log('Maker','error','no module', class_name)

    return new MaskHelper([])
}

function list(){
    return Object.keys(classes)
}

export default {
    get,
    make,
    module,
    list
}