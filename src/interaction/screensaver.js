import Subscribe from '../utils/subscribe'
import Keypad from "./keypad";
import Template from './template'
import Api from './api'


let enabled  = false;
let isActive = false;
let img = null;
let listener = Subscribe();
let timer, slideshowInt;
let html = Template.get('screensaver');
let movies = [];
let animations = ['zoom-in', 'zoom-out', 'slide-right', 'slide-left'];


function toggle(isEnabled) {
    enabled = isEnabled;
    if(enabled) {
        resetTimer();
    } else {
        clearTimeout(timer);
    }
    listener.send('toggle',{status: enabled});
}

function enable() {
    toggle(true);
}

function disable() {
    toggle(false);
}

function resetTimer() {
    if(!enabled) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
        console.log('timeout');
        if(movies.length === 0) {
            Api.screensavers((data) => {
                movies = data;
                startSlideshow();
            }, console.error)
        } else {
            startSlideshow();
        }
    }, 300 * 1000); //5 минут
}

function startSlideshow() {
    isActive = true;
    html.addClass('screensaver--visible');
    nextSlide();
    slideshowInt = setInterval(() => {
        nextSlide();
    }, 15000);
}

function nextSlide() {
    const movie = movies[Math.floor(Math.random() * movies.length)],
        animation = animations[Math.floor(Math.random() * animations.length)],
        image = Api.img(movie.backdrop_path,'original');
    let slide = html.find('.screensaver__slide');

    img = null;
    img = new Image();
    img.src = image;
    img.onload = () => {
        html.find('.screensaver__title').removeClass('screensaver__title--visible');
        slide.attr('class', 'screensaver__slide screensaver__slide--' + animation)
            .css('background', 'no-repeat center/cover url("' + img.src +'")');
        html.find('.screensaver__title-name').text(movie.title || movie.name);
        html.find('.screensaver__title-tagline').text(movie.original_title || movie.original_name || '');

        setTimeout(() => {
            slide.addClass('animate');
            html.find('.screensaver__title').addClass('screensaver__title--visible');
        }, 100);
    }
    img.onerror = (e) => {
        console.error(e);
    }
}

function stopSlideshow() {
    isActive = false;
    html.removeClass('screensaver--visible');
    clearInterval(slideshowInt);
}

function init() {
    $('body').append(html);
    resetTimer();
    Keypad.listener.follow('keydown',(e) => {
        resetTimer();
        if(isActive) {
            stopSlideshow();
            e.event.preventDefault(); //чтобы при выходе из скринсейвера не нажалось что-ниубдь в ui
        }
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
