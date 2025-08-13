import Controller from '../interaction/controller'
import Utils from '../utils/math'
import Cache from '../utils/cache'
import Ai from '../utils/api/ai'
import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import EmptyModule from '../interaction/empty/module/ai'

/**
 * Компонент "Факты о фильме"
 * @param {*} object 
 */

function component(object){
    let comp = Utils.createInstance(Category, object, {
        icon: 'text',
        module: CategoryModule.only('Explorer', 'Loading'),
    })

    comp.use(EmptyModule)

    comp.use({
        onCreate: function(){
            let cache_name = ['facts', this.object.movie.id , (this.object.movie.name ? 'tv' : 'movie')].join('_')
            let cache_text = ''

            Cache.getData('other', cache_name).then((text)=>{
                cache_text = text
            }).finally(()=>{
                if(cache_text){
                    this.build(cache_text)
                }
                else{
                    Ai.facts(this.object.movie.id, this.object.movie.name ? 'tv' : 'movie', (data)=>{
                        Cache.rewriteData('other', cache_name, data.text).finally(()=>{})

                        this.build(data.text)
                    }, this.empty.bind(this))
                }
            })
        },
        onBuild: function(text){
            try{
                this.body.html(Utils.simpleMarkdownParser(text))

                this.body.find('h1').remove()

                this.body.addClass('text-markdow explorer-list animate-up-content animate-opacity')

                this.scroll.onWheel = (step)=>{
                    if(!Controller.own(this)) this.start()
        
                    if(step > 0) Controller.move('down')
                    else Controller.move('up')
                }
            }
            catch(e){
                this.empty({status: 245, message: e.message})
            }
        },
        onController: function(controller){
            controller.up = ()=>{
                if(this.scroll.position() == 0) Controller.toggle('head')
                else this.scroll.wheel(-150)
            }

            controller.down = ()=>{
                this.scroll.wheel(150)
            }
        }
    })

    return comp
}

export default component