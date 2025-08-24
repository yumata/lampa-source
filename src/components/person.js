import Api from '../core/api/api'
import Main from '../interaction/items/main'
import Background from '../interaction/background'
import Utils from '../utils/utils'
import LineModule from '../interaction/items/line/module/module'
import Router from '../core/router'
import Person from '../interaction/person/person'
import PersonModule from '../interaction/person/module/module'

function component(object){
    let comp = Utils.createInstance(Main, object)

    comp.use({
        onCreate: function(){
            Api.person(object,(data)=>{
                if(data.person){
                    let lines = []

                    lines.push({
                        results: [],
                        params: {
                            module: LineModule.MASK.none,
                            emit: {
                                onCreate: function(){
                                    this.person = Utils.createInstance(Person, data.person, {
                                        module: PersonModule.only('About')
                                    })

                                    this.person.create()

                                    this.scroll.append(this.person.render(true))
                                },
                                onToggle: function(){
                                    data.person.profile_path && Background.change(Api.img(data.person.profile_path, 'w200'))
                                },
                                onDestroy: function(){
                                    this.person?.destroy()
                                }
                            }
                        }
                    })

                    if(data.credits && data.credits.knownFor && data.credits.knownFor.length > 0) {
                        for (let i = 0; i < data.credits.knownFor.length; i++) {
                            let departament = data.credits.knownFor[i]
                            let credits = departament.credits.map(a=>{
                                a.time_sort = new Date(a.first_air_date || a.release_date || '').getTime()
                                
                                return a
                            })

                            credits.sort((a,b)=>b.time_sort - a.time_sort)

                            if(credits.length > 0) {
                                lines.push({
                                    title: departament.name + ' (' + credits.length + ')',
                                    results: credits,
                                    params: {
                                        module: LineModule.toggle(LineModule.MASK.base, 'More')
                                    }
                                })
                            }
                        }
                    }

                    if(lines.length) this.build(lines)
                    else this.empty()
                }
                else{
                    this.empty()
                }
            },this.empty.bind(this))
        },
        onInstance: function(item){
            item.use({
                onInstance: function(card, data){
                    card.use({
                        onEnter: Router.call.bind(Router, 'full', data),
                        onFocus: function(){
                            Background.change(Utils.cardImgBackground(data))
                        }
                    })
                }
            })
        }
    })

    return comp
}

export default component