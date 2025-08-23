import Statistic from '../core/account/statistic'
import Register from '../interaction/register/register'



function component(object){
    let comp = new Lampa.InteractionMain(object)

    comp.create = function(){
        this.activity.loader(true)

        Statistic.get(data=>{
            this.activity.loader(false)

            data.forEach(line=>{
                line.cardClass = (elem, params)=>{
                    params.card_events = {
                        onEnter: ()=>{}
                    }

                    return new Register(elem)
                }
            })

            comp.build(data)
        })

        return this.render()
    }

    return comp
}

export default component