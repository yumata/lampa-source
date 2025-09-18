import Arrays from '../utils/arrays.js'
import Sound from '../core/sound.js'

let bell
let items = []

function Item(params){
    Arrays.extend(params, {
        icon: `<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.6"></path>
            </svg>`,
        type: 'info',
        text: '',
        from: '',
        time: 5000
    })

    let element = $(`<div class="bell__item bell__item--${params.type}">
        <div class="bell__item-icon">${params.icon}</div>
        <div class="bell__item-text"><div>${params.text}</div></div>    
    </div>`)

    if(params.from) element.find('.bell__item-text').prepend(`<b>${params.from}</b><br>`)

    setTimeout(()=>{
        element.removeClass('show')

        setTimeout(()=>{
            let slide = $(`<div class="bell__item-slide"></div>`)
                slide.css('height', element.outerHeight() + 'px')

            element.after(slide)

            element.remove()

            Arrays.remove(items, this)

            slide.animate({
                height: 0
            }, 300, ()=>{
                slide.remove()
            })

            if(items.length == 0){
                bell.removeClass('show')
            }
        },300)
    }, params.time)

    bell.find('.bell__wrap').append(element)

    setTimeout(()=>{
        element.addClass('show')
    },100)

    items.push(this)

    Sound.play('bell')
}

function init(){
    bell = $(`<div class="bell">
        <div class="bell__wrap"></div>
    </div>`)

    $('body').append(bell)
}

function push(params){
    new Item(params)

    bell.addClass('show')
}

export default {
    init,
    push
}