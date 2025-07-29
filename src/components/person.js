import Api from '../interaction/api'
import Main from '../interaction/items/main'
import Activity from '../interaction/activity'
import Background from '../interaction/background'
import Utils from '../utils/math'
import LineModule from '../interaction/items/line/module/module'

function component(object){
    let comp = new Main(object)

    comp.use({
        onCreate: function(){
            Api.person(object,(data)=>{
                if(data.person){
                    let lines = []

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
                        onEnter: function(){
                            Activity.push({
                                url: data.url,
                                component: 'full',
                                id: data.id,
                                method: data.name ? 'tv' : 'movie',
                                card: data,
                                source: data.source || object.source || 'tmdb',
                            })
                        },
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