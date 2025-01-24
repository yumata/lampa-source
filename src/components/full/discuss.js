import Template from "../../interaction/template"
import Controller from '../../interaction/controller'
import Scroll from '../../interaction/scroll'
import Lang from '../../utils/lang'
import Platform from '../../utils/platform'
import Layer from '../../utils/layer'
import Review from '../../interaction/review'
import Input from '../settings/input'
import Modal from '../../interaction/modal'
import CUB from '../../utils/api/cub'
import Utils from '../../utils/math'
import Select from '../../interaction/select'
import Noty from '../../interaction/noty'
import Account from '../../utils/account'
import Storage from '../../utils/storage'

function Discuss(data, params = {}){
    let html,scroll,last,all_ready,rules_html

    let active  = 0
    let view    = 6
    let tv      = Platform.screen('tv')

    this.create = function(){
        html   = Template.get('items_line',{title: Lang.translate('title_comments')})
        scroll = new Scroll({horizontal: true})

        scroll.render().find('.scroll__body').addClass('full-reviews')

        html.find('.items-line__body').append(scroll.render())

        this.add()

        data.discuss.result.slice(0,view).forEach(this.append.bind(this))

        scroll.onWheel = (step)=>{
            this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        scroll.onScroll = (step)=>{
            data.discuss.result.slice(active, tv ? active + view : data.discuss.result.length).filter(e=>!e.ready).forEach((line_data)=>{
                Controller.collectionAppend(this.append(line_data))
            })

            if((tv || active + view >= data.discuss.result.length) && !all_ready && data.discuss.total_pages > 1){
                all_ready = true
                
                this.all()
            }

            Layer.visible(scroll.render(true))
        }
    }

    this.rules = function(){
        rules_html = Template.get('discuss_rules')

        $('body').append(rules_html)
    }

    this.filter = function(text){
		let err = 0
		
		function containsLongWords(str, length = 15) {
			let any = false
			
			str.split(/\s/).map(a=>{
				if(a.length >= length) any = true
			})
			
			return any
		}
		
		function containsFiveWords(str) {
			let words = str.split(/\s/)
			let count = 0
			
			words.map(a=>{
				if(a.length >= 5) count++
			})
			
			return count
		}
		
		if(/\d{4,}/g.test(text))               err = 1
		else if(!/[а-яА-ЯёЁ]{5,}/.test(text))  err = 2
		else if(!/[.,:;!?]/.test(text))   	   err = 3
		else if(/[*%$#_+=|^&]/.test(text))     err = 4
		else if(containsFiveWords(text) < 5)   err = 5
		else if(containsLongWords(text))       err = 6
		else if(text.length > 300)             err = 7
		
		return err
	}

    this.add = function(){
        let add_button = $('<div class="full-review-add selector"></div>')
        let add_value  = ''

        add_button.on('hover:enter',()=>{
            if(Account.logged()){
                this.rules()

                let keyboard = Input.edit({
                    title: '',
                    value: add_value,
                    nosave: true,
                    textarea: true
                },(new_value)=>{
                    rules_html.remove()

                    add_value = new_value

                    if(new_value){
                        Account.addDiscuss({...params.object, comment: new_value},(comment)=>{
                            add_button.after(this.append(comment))

                            Layer.visible(scroll.render(true))
                        })
                    }

                    this.toggle()
                })

                let keypad = $('.simple-keyboard')
                let helper = $('<div class="discuss-rules-helper hide"></div>')

                if(keypad.hasClass('simple-keyboard--with-textarea')){
                    keypad.append(helper)

                    keyboard.listener.follow('change',(event)=>{
                        let code = this.filter(event.value.trim())

                        helper.toggleClass('hide', !Boolean(code)).text(Lang.translate('discuss_rules_rule_' + code))
                    })
                }
            }
            else{
                Lampa.Account.showNoAccount()
            }
        }).on('hover:focus hover:touch',(e)=>{
            last = e.target

            scroll.update($(e.target),true)
        })

        scroll.append(add_button)
    }

    this.all = function(){
        let all_button = $('<div class="full-review full-review-all selector"><div class="full-review-all__text">'+Lang.translate('more')+'</div><div class="full-review-all__count">'+(data.discuss.total - data.discuss.result.length)+'</div></div>')

        all_button.on('hover:enter',()=>{
            let page      = 2
            let discuss   = []
            let wait      = false
            let position  = 0
            let container = $('<div><div class="content-loading"></div></div>')

            let draw = ()=>{
                Modal.scroll().reset()

                container.empty()

                discuss.forEach((element)=>{
                    let review = new Review(element, {type: 'vertical'})

                    review.create()

                    review.render().on('hover:focus hover:touch', (e)=>{
                        position = discuss.indexOf(element)
                    }).on('hover:enter',()=>{
                        this.see(review, Modal.toggle)
                    })

                    container.append(review.render()) 
                })

                if(data.discuss.total_pages !== page) container.append($('<div class="content-loading"></div>'))

                Modal.update(container)

                Modal.toggle()
            }

            let load = ()=>{
                CUB.discussGet({...params.object, page}, (anser)=>{
                    wait = false

                    discuss = discuss.slice(position, discuss.length).concat(anser.result)

                    position = 0

                    draw()
                }, ()=>{
                    page--

                    wait = false
                })
            }

            Modal.open({
                title: Lang.translate('title_comments'),
                html: container,
                size: 'medium',
                onBack: ()=>{
                    Modal.close()

                    draw = ()=>{}
                    load = ()=>{}

                    this.toggle()
                }
            })

            Modal.scroll().onEnd = ()=>{
                if(!wait && page < data.discuss.total_pages){
                    wait = true

                    page++

                    load()
                }
            }

            Modal.scroll().params().end_ratio = 1.5

            setTimeout(load,200) //задержка для анимации окна
        })

        scroll.append(all_button)
    }

    this.see = function(review, onBack){
        let items = []
        let voited = Storage.cache('discuss_voited',100,[])

        if(voited.indexOf(review.element.id) == -1 && Account.logged()){
            items = [
                {
                    separator: true,
                    title: Lang.translate('title_action')
                },
                {
                    title: '<span class="settings-param__label">+1</span> ' + Lang.translate('title_like'),
                    like: 1
                },
                {
                    title: Lang.translate('reactions_shit'),
                    like: -1
                }
            ]
        }

        if(!items.length) return
        
        Select.show({
            title: Utils.capitalizeFirstLetter(review.element.email),
            items: items,
            onFullDraw: (select_scroll)=>{
                select_scroll.body().prepend($('<div class="selectbox__text selector"><div>'+Utils.capitalizeFirstLetter(review.element.comment)+'</div></div>'))
            },
            onSelect: (item)=>{
                onBack()

                Account.voiteDiscuss({id: review.element.id, like: item.like},()=>{
                    voited.push(review.element.id)

                    Storage.set('discuss_voited', voited)
                    
                    review.updateLike(item.like)

                    Noty.show(Lang.translate('discuss_voited'))
                })
            },
            onBack: onBack
        })
    }

    this.append = function(element){
        element.ready = true

        let review = new Review(element)

        review.create()

        review.render().on('hover:focus', (e)=>{
            last = e.target

            active = data.discuss.result.indexOf(element)

            scroll.update($(e.target),true)
        }).on('hover:touch',(e)=>{
            active = data.discuss.result.indexOf(element)

            last = e.target
        }).on('hover:enter',()=>{
            this.see(review, this.toggle.bind(this))
        })

        scroll.append(review.render())

        return review.render()
    }

    this.toggle = function(){
        Controller.add('full_reviews',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.render())
                Controller.collectionFocus(last, this.render())

                if(this.onToggle) this.onToggle(this)
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            down:this.onDown,
            up: this.onUp,
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('full_reviews')
    }

    this.render = function(){
        return html
    }
}

export default Discuss