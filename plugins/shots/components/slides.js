function backward(){
    let head = Lampa.Template.get('head_backward',{title: ''})

    head.find('.head-backward__button').on('click',()=>{
        Lampa.Controller.back()
    })

    return head
}

function Slides(params){
    let html = $(`<div class="shots-slides">
        <div class="shots-slides__slides"></div>
        <div class="shots-slides__install">${Lampa.Lang.translate(params.button_text)}</div>
        <div class="shots-slides__down">${Lampa.Lang.translate('shots_down')}</div>
    </div>`)

    params.slides.forEach((slide_data, slide_index)=>{
        html.find('.shots-slides__slides').append($(`<img class="shots-slides__slide slide-${slide_index + 1}">`))
    })

    let slide   = 0
    let total   = params.slides.length
    let timeload
    let cancel  = false
    let down    = html.find('.shots-slides__down')
    let install = html.find('.shots-slides__install')

    if(Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice()){
        html.append(backward())
    }

    $('body').append(html)

    let push = ()=>{
        if(slide == total){
            destroy()

            params.onInstall && params.onInstall()
        }
    }

    let next = ()=>{
        if( slide >= total ) return

        if(slide > 0){
            html.find('.slide-' + slide).addClass('up')
        }

        slide++

        html.find('.slide-' + slide).addClass('active')

        if(slide === total){
            down.removeClass('active')

            setTimeout(()=>{
                install.addClass('active')
            },500)
        }
    }

    let start = ()=>{
        Lampa.Loading.stop()

        setTimeout(()=>{
            down.addClass('active')
        },600)

        next()

        Lampa.Controller.add('shots_present', {
            toggle: ()=>{
                Lampa.Controller.clear()

                Lampa.Background.theme('#08090D')
            },
            enter: push,
            down: next,
            back: stop,
        })

        Lampa.Controller.toggle('shots_present')
    }

    let stop = ()=>{
        destroy()

        Lampa.Loading.stop()

        params.onBack && params.onBack()
    }

    let preload = ()=>{
        let slides_loaded = 0

        for(let i=1; i<=total; i++){
            let img = html.find('.slide-' + i)[0]
            img.src = params.slides[i-1]
            img.onload = ()=>{
                slides_loaded++

                if(slides_loaded === total && !cancel){
                    params.onLoad && params.onLoad()

                    start()

                    clearTimeout(timeload)
                }
            }
        }

        timeload = setTimeout(stop,10000)
    }

    let destroy = ()=>{
        start = ()=>{}

        cancel = true

        clearTimeout(timeload)

        html.remove()

        Lampa.Background.theme('reset')
    }

    down.on('click', next)
    
    install.on('click', push)

    Lampa.Loading.start(stop)

    preload()
}

export default Slides