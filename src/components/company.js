import Api from '../core/api'
import Main from '../interaction/items/main'
import Background from '../interaction/background'
import Utils from '../utils/math'
import Router from '../core/router'
import Arrays from '../utils/arrays'
import LineModule from '../interaction/items/line/module/module'
import Company from '../interaction/company/company'
import CompanyModule from '../interaction/company/module/module'

function component(object){
    let comp = Utils.createInstance(Main, object)

    comp.use({
        onCreate: function(){
            Api.company(object, (data)=>{
                object.company = data.company

                Arrays.insert(data.lines, 0, {
                    results: [],
                    params: {
                        module: LineModule.MASK.none,
                        emit: {
                            onCreate: function(){
                                this.company = Utils.createInstance(Company, object.company, {
                                    module: CompanyModule.only('About')
                                })

                                this.company.create()

                                this.scroll.append(this.company.render(true))
                            },
                            onDestroy: function(){
                                this.company?.destroy()
                            }
                        }
                    }
                })

                this.build(data.lines)
            }, this.empty.bind(this))
        },
        onInstance: function(item, data){
            item.use({
                onMore: Router.call.bind(Router, 'category_full', {url: data.url, title: data.title, companies: object.company.id, sort_by: 'vote_count.desc', source: 'tmdb'}),
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