import Api from '../../../core/api/api'
import Color from '../../../utils/color'

export default {
    onCreate: function(){
        let im = this.html.find('.full--poster')
        let poster

        this.img_poster = im[0] || {}

        if(window.innerWidth <= 480){
            this.img_poster = new Image()
            this.img_poster.crossOrigin = "Anonymous"
        }

        this.img_poster.onerror = (e)=>{
            this.img_poster.src = './img/img_broken.svg'
        }

        this.img_poster.onload = (e)=>{
            im.parent().addClass('loaded')
        }

        if(window.innerWidth <= 480){
            if(this.card.backdrop_path) poster = Api.img(this.card.backdrop_path,'w780')
            else if(this.card.background_image) poster = this.card.background_image

            this.img_poster.onerror = (e)=>{
                this.img_poster = im[0]

                this.img_poster.onerror = (e)=>{
                    this.img_poster.src = './img/img_broken.svg'
                }
        
                this.img_poster.onload = (e)=>{
                    im.parent().addClass('loaded').addClass('with-out')
                }

                im[0].src = poster || this.card.img
            }

            this.img_poster.onload = (e)=>{
                Color.blurPoster(this.img_poster, im.width(), im.height(), (nim)=>{
                    im[0].src = nim.src
                    
                    im.parent().addClass('loaded')

                    setTimeout(()=>{
                        im[0].style.transition = 'none'
                    },500)

                    let sc = this.mscroll.render(true)
                    let an = 0
                    let ts = 0
                    let dl = window.innerHeight * 0.1

                    let smoothParallax = ()=>{
                        im[0].style.transform = 'translate3d(0, ' + ts * 0.35 + 'px, 0)'
                        im[0].style.opacity   = ts >= dl ? Math.max(0, 1 - (ts - dl) / (window.innerHeight * 0.2)) : 1;

                        an--

                        if(an > 0) smoothParallax()
                    }

                    sc.addEventListener('scroll', function(e) {
                        ts = sc.scrollTop
                        
                        if(an == 0){
                            an = 100

                            requestAnimationFrame(smoothParallax)
                        }
                    })
                })
            }
        }

        if(poster) this.html.find('.full-start__poster').addClass('background--poster')

        this.img_poster.src = poster || this.card.img
    }
}