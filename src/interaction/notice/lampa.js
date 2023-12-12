import Notice from '../notice'
import NoticeClass from './class'
import DB from '../../utils/db'

class NoticeLampa extends NoticeClass {
    constructor(params = {}){
        super(params)

        this.name = params.name || 'Lampa'
        this.time = 0
        this.view = 0

        this.db_name = params.db_name || 'notice'

        this.notices = []

        this.connect()
    }

    connect(){
        this.db = new DB(this.db_name, ['all','readed'], 2)
        this.db.openDatabase().then(this.update.bind(this))
    }

    update(){
        this.db.getData('readed','time').then((time)=>{
            this.time = time || 0

            return this.db.getData('all')
        }).then(result=>{
            result.sort((a,b)=>{
                return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
            })

            this.notices = result

            this.view = result.filter(n=>n.time > this.time).length

            Notice.drawCount()
        }).catch(e=>{})
    }

    count(){
        return this.view
    }

    push(element, resolve, reject){
        if(!(element.id && element.from)){
            if(reject) reject('No (id) or (from)')

            return 
        }

        if(!this.notices.find(n=>n.id == element.id)){
            this.db.addData('all', element.id, element).then(this.update.bind(this)).then((e)=>{
                if(resolve) resolve(e)
            }).catch((e)=>{
                if(reject) reject(e)
            })
        }
        else if(reject) reject('Already added')
    }

    viewed(){
        this.db.rewriteData('readed','time',Date.now())

        this.view = 0
        this.time = Date.now()

        Notice.drawCount()
    }

    items(){
        return this.notices
    }
}


export default NoticeLampa