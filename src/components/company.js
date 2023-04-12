import Start from './company/start'
import Api from '../interaction/api'

function component(object){
    let comp = new Lampa.InteractionMain(object)

    comp.create = function(){
        this.activity.loader(true)

        Api.company(object,(data)=>{
            let company = new Start(data.company)
                company.create()

            this.push(company)

            this.build(data.lines)
        },this.empty.bind(this))

        return this.render()
    }

    return comp
}

export default component