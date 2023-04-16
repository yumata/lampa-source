import NoticeClass from './class'
import Lang from '../../utils/lang'
import Notice from '../notice'
import Arrays from '../../utils/arrays'

class NoticeAll extends NoticeClass {
    constructor(params = {}){
        super(params)

        this.name = Lang.translate('settings_param_jackett_interview_all')
    }

    active(){
        return false
    }

    count(){
        return Notice.count()
    }

    viewed(){
        for(let name in Notice.classes){
            if(Notice.classes[name] !== this){
                Notice.classes[name].viewed()
            }
        }
    }

    items(){
        let items = []

        for(let name in Notice.classes){
            if(Notice.classes[name] !== this){
                items = items.concat(Notice.classes[name].items().map((item)=>{
                    let new_item = Arrays.clone(item)
                        new_item.display = name

                    return new_item
                }))
            }
        }

        items.sort((a,b)=>{
            return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
        })
        
        return items
    }
}


export default NoticeAll