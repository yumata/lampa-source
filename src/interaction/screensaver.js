import Subscribe from '../utils/subscribe'
import Keypad from "./keypad";
import Template from './template'
import Api from './api'
import Utils from "../utils/math";
import Storage from "../utils/storage"

let listener = Subscribe();

let enabled  = false;
let worked   = false;

let img
let html     = Template.get('screensaver')
let movies   = []
let timer    = {}
let position = 0
let slides   = 'one'
let direct   = ['lt','rt','br','lb','ct']


function toggle(is_enabled) {
    enabled = is_enabled

    if(enabled) resetTimer()
    else clearTimeout(timer.wait)

    listener.send('toggle',{status: enabled})
}

function enable() {
    toggle(true)
}

function disable() {
    toggle(false)
}

function resetTimer() {
    if(!enabled) return

    clearTimeout(timer.wait)

    if(!Storage.field('screensaver')) return

    timer.wait = setTimeout(() => {
        if(Storage.field('screensaver_type') == 'nature') startSlideshow()
        else if(movies.length === 0) {
            Api.screensavers((data) => {
                movies = data

                startSlideshow()
            }, resetTimer)
        } else {
            startSlideshow()
        }
    }, 300 * 1000); //300 * 1000 = 5 минут
}

function startSlideshow() {
    if(!Storage.field('screensaver')) return

    worked = true

    html.fadeIn(300)

    Utils.time(html)

    nextSlide()

    timer.work = setInterval(() => {
        nextSlide()
    }, 30000)

    timer.start = setTimeout(()=>{
        html.addClass('visible')
    },5000)
}

function nextSlide() {
    const movie = movies[position]
    const image = Storage.field('screensaver_type') == 'nature' ? 'https://source.unsplash.com/1600x900/?nature&order_by=relevant&v='+Math.random() : Api.img(movie.backdrop_path,'original')


    img = null;
    img = new Image();
    img.src = image;
    img.onload = () => {
        let to = $('.screensaver__slides-'+(slides == 'one' ? 'two' : 'one'), html)

        to[0].src = img.src

        to.removeClass(direct.join(' ') + ' animate').addClass(direct[Math.floor(Math.random() * direct.length)])

        setTimeout(()=>{
            $('.screensaver__title',html).removeClass('visible')

            $('.screensaver__slides-'+slides, html).removeClass('visible')

            slides = slides == 'one' ? 'two' : 'one'

            to.addClass('visible').addClass('animate')

            if(movie){
                setTimeout(()=>{
                    $('.screensaver__title-name',html).text(movie.title || movie.name)
                    $('.screensaver__title-tagline',html).text(movie.original_title || movie.original_name)

                    $('.screensaver__title',html).addClass('visible')
                },500)
            }
        },3000)
        
    }
    img.onerror = (e) => {
        console.error(e)
    }

    position++

    if(position >= movies.length) position = 0
}

function stopSlideshow() {
    setTimeout(()=>{
        worked = false
    },300)
    
    html.fadeOut(300,()=>{
        html.removeClass('visible')
    })

    clearInterval(timer.work)
    clearTimeout(timer.start)

    movies = []
}

function init() {
    $('body').append(html)

    resetTimer()

    Keypad.listener.follow('keydown',(e) => {
        resetTimer()

        if(worked) {
            stopSlideshow()

            e.event.preventDefault(); //чтобы при выходе из скринсейвера не нажалось что-ниубдь в ui
        }
    });

    Keypad.listener.follow('keyup',(e) => {
        if(worked) e.event.preventDefault()
    });
}

function render() {
    return html;
}

export default {
    listener,
    init,
    enable,
    render,
    disable
}
