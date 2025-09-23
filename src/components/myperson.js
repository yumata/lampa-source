import Background from '../interaction/background'
import Utils from '../utils/utils'
import Lang from '../core/lang'
import Account from '../core/account/account'
import Api from '../core/api/api'
import Main from '../interaction/items/main'
import TMDB from '../core/api/sources/tmdb'
import LineModule from '../interaction/items/line/module/module'
import CardModule from '../interaction/card/module/module'
import Router from '../core/router'

/**
 * Компонент Персоны"
 * @param {*} object 
 */
function component(object){
    let comp = new Main(object)
    let next = null

    comp.use({
        onCreate: function(){
            let parts = [
                (call)=>{
                    Account.Api.persons((data)=>{
                        if(!data.length) return call()

                        let persons = data.map(p=>p.person)

                        persons.forEach(person=>{
                            person.params = {
                                module: CardModule.only('Card', 'Release', 'Callback'),
                                emit: {
                                    onFocus: ()=>{
                                        Background.change(Utils.cardImgBackground(person))
                                    },
                                    onEnter: Router.call.bind(Router, 'actor', person)
                                }
                            }
                        })

                        call({
                            title: Lang.translate('title_persons'),
                            results: persons,
                            params: {
                                module: LineModule.toggle(LineModule.MASK.base, 'More', 'Event'),
                            }
                        })
                    },call)
                }
            ]

            function loadPart(partLoaded, partEmpty){
                Api.partNext(parts, 3, partLoaded, partEmpty)
            }

            next = loadPart

            TMDB.get('person/popular',{},(json)=>{
                json.results.sort((a,b)=>a.popularity - b.popularity)

                let filtred = json.results.filter(p=>p.known_for_department && p.known_for)

                let persons = filtred.filter(p=>(p.known_for_department || '').toLowerCase() == 'acting' && p.known_for.length).slice(0,10)

                persons.forEach((person_data,index)=>{
                    let event = (call_inner)=>{
                        TMDB.person({only_credits: 'movie', id: person_data.id},(result)=>{
                            if(!result.credits) return call_inner()

                            let cards = (result.credits.movie || []).filter(m=>m.backdrop_path && m.vote_count > 20)

                            cards.sort((a,b)=>{
                                let da = a.release_date || a.first_air_date
                                let db = b.release_date || b.first_air_date

                                if(db > da) return 1
                                else if(db < da) return -1
                                else return 0
                            })

                            let src  = person_data.profile_path ? TMDB.img(person_data.profile_path,'w90_and_h90_face') : person_data.img || './img/actor.svg'

                            cards.forEach(item=>{
                                item.params = {
                                    emit: {
                                        onEnter: Router.call.bind(Router, 'full', item),
                                        onFocus: function(){
                                            Background.change(Utils.cardImgBackground(item))
                                        }
                                    }
                                }
                            })
                          
                            call_inner({
                                title: person_data.name,
                                icon_img: src,
                                results: cards.length > 5 ? cards.slice(0,20) : [],
                                params: {
                                    module: LineModule.toggle(LineModule.MASK.base, 'Icon','More','MoreFirst','Event'),
                                    text: Lang.translate('title_person_about'),
                                    emit: {
                                        onMore: Router.call.bind(Router, 'actor', person_data)
                                    }
                                }
                            })
                        })
                    }

                    parts.push(event)
                })

                loadPart(this.build.bind(this), this.empty.bind(this))
            },()=>{
                loadPart(this.build.bind(this), this.empty.bind(this))
            })
        },
        onNext: function(resolve, reject){
            if(next){
                next(resolve.bind(this), reject.bind(this))
            }
            else reject.call(this)
        }
    })

    return comp
}

export default component