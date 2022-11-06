import Radio from './component'
import Player from './player'

function startPlugin() {
    window.radio = true

    Lampa.Component.add('radio', Radio)

    Lampa.Template.add('radio_item',`<div class="selector radio-item">
        <div class="radio-item__imgbox">
            <img class="radio-item__img" />
        </div>

        <div class="radio-item__name">{name}</div>
    </div>`)

    Lampa.Template.add('radio_player',`<div class="selector radio-player stop hide">
        <div class="radio-player__name">Radio Record</div>

        <div class="radio-player__button">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
        </div>
    </div>`)

    Lampa.Template.add('radio_style',`<style>
    .radio-item {
        width: 8em;
        -webkit-flex-shrink: 0;
            -ms-flex-negative: 0;
                flex-shrink: 0;
      }
      .radio-item__imgbox {
        background-color: #3E3E3E;
        padding-bottom: 83%;
        position: relative;
        -webkit-border-radius: 0.3em;
           -moz-border-radius: 0.3em;
                border-radius: 0.3em;
      }
      .radio-item__img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .radio-item__name {
        font-size: 1.1em;
        margin-top: 0.8em;
      }
      .radio-item.focus .radio-item__imgbox:after {
        border: solid 0.26em #fff;
        content: "";
        display: block;
        position: absolute;
        left: -0.5em;
        top:  -0.5em;
        right:  -0.5em;
        bottom:  -0.5em;
        -webkit-border-radius: 0.8em;
           -moz-border-radius: 0.8em;
                border-radius: 0.8em;
      }
      .radio-item + .radio-item {
        margin-left: 1em;
      }
      
      @-webkit-keyframes sound {
        0% {
          height: 0.1em;
        }
        100% {
          height: 1em;
        }
      }
      
      @-moz-keyframes sound {
        0% {
          height: 0.1em;
        }
        100% {
          height: 1em;
        }
      }
      
      @-o-keyframes sound {
        0% {
          height: 0.1em;
        }
        100% {
          height: 1em;
        }
      }
      
      @keyframes sound {
        0% {
          height: 0.1em;
        }
        100% {
          height: 1em;
        }
      }
      @-webkit-keyframes sound-loading {
        0% {
          -webkit-transform: rotate(0deg);
                  transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
                  transform: rotate(360deg);
        }
      }
      @-moz-keyframes sound-loading {
        0% {
          -moz-transform: rotate(0deg);
               transform: rotate(0deg);
        }
        100% {
          -moz-transform: rotate(360deg);
               transform: rotate(360deg);
        }
      }
      @-o-keyframes sound-loading {
        0% {
          -o-transform: rotate(0deg);
             transform: rotate(0deg);
        }
        100% {
          -o-transform: rotate(360deg);
             transform: rotate(360deg);
        }
      }
      @keyframes sound-loading {
        0% {
          -webkit-transform: rotate(0deg);
             -moz-transform: rotate(0deg);
               -o-transform: rotate(0deg);
                  transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
             -moz-transform: rotate(360deg);
               -o-transform: rotate(360deg);
                  transform: rotate(360deg);
        }
      }
      .radio-player {
        display: -webkit-box;
        display: -webkit-flex;
        display: -moz-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -webkit-align-items: center;
           -moz-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        -webkit-border-radius: 0.3em;
           -moz-border-radius: 0.3em;
                border-radius: 0.3em;
        padding: 0.2em 0.8em;
        background-color: #3e3e3e;
      }
      .radio-player__name {
        margin-right: 1em;
        white-space: nowrap;
        overflow: hidden;
        -o-text-overflow: ellipsis;
           text-overflow: ellipsis;
        max-width: 8em;
      }
      @media screen and (max-width: 385px) {
        .radio-player__name {
          display: none;
        }
      }
      .radio-player__button {
        position: relative;
        width: 1.5em;
        height: 1.5em;
        display: -webkit-box;
        display: -webkit-flex;
        display: -moz-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -webkit-align-items: center;
           -moz-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
           -moz-box-pack: center;
            -ms-flex-pack: center;
                justify-content: center;
        -webkit-flex-shrink: 0;
            -ms-flex-negative: 0;
                flex-shrink: 0;
      }
      .radio-player__button i {
        display: block;
        width: 0.2em;
        background-color: #fff;
        margin: 0 0.1em;
        -webkit-animation: sound 0ms -800ms linear infinite alternate;
           -moz-animation: sound 0ms -800ms linear infinite alternate;
             -o-animation: sound 0ms -800ms linear infinite alternate;
                animation: sound 0ms -800ms linear infinite alternate;
        -webkit-flex-shrink: 0;
            -ms-flex-negative: 0;
                flex-shrink: 0;
      }
      .radio-player__button i:nth-child(1) {
        -webkit-animation-duration: 474ms;
           -moz-animation-duration: 474ms;
             -o-animation-duration: 474ms;
                animation-duration: 474ms;
      }
      .radio-player__button i:nth-child(2) {
        -webkit-animation-duration: 433ms;
           -moz-animation-duration: 433ms;
             -o-animation-duration: 433ms;
                animation-duration: 433ms;
      }
      .radio-player__button i:nth-child(3) {
        -webkit-animation-duration: 407ms;
           -moz-animation-duration: 407ms;
             -o-animation-duration: 407ms;
                animation-duration: 407ms;
      }
      .radio-player__button i:nth-child(4) {
        -webkit-animation-duration: 458ms;
           -moz-animation-duration: 458ms;
             -o-animation-duration: 458ms;
                animation-duration: 458ms;
      }
      .radio-player.stop .radio-player__button {
        -webkit-border-radius: 100%;
           -moz-border-radius: 100%;
                border-radius: 100%;
        border: 0.2em solid #fff;
      }
      .radio-player.stop .radio-player__button i {
        display: none;
      }
      .radio-player.stop .radio-player__button:after {
        content: "";
        width: 0.5em;
        height: 0.5em;
        background-color: #fff;
      }
      .radio-player.loading .radio-player__button:before {
        content: "";
        display: block;
        border-top: 0.2em solid #fff;
        border-left: 0.2em solid transparent;
        border-right: 0.2em solid transparent;
        border-bottom: 0.2em solid transparent;
        -webkit-animation: sound-loading 1s linear infinite;
           -moz-animation: sound-loading 1s linear infinite;
             -o-animation: sound-loading 1s linear infinite;
                animation: sound-loading 1s linear infinite;
        width: 0.9em;
        height: 0.9em;
        -webkit-border-radius: 100%;
           -moz-border-radius: 100%;
                border-radius: 100%;
        -webkit-flex-shrink: 0;
            -ms-flex-negative: 0;
                flex-shrink: 0;
      }
      .radio-player.loading .radio-player__button i {
        display: none;
      }
      .radio-player.focus {
        background-color: #fff;
        color: #000;
      }
      .radio-player.focus .radio-player__button {
        border-color: #000;
      }
      .radio-player.focus .radio-player__button i, .radio-player.focus .radio-player__button:after {
        background-color: #000;
      }
      .radio-player.focus .radio-player__button:before {
        border-top-color: #000;
      }
    </style>`)

    window.radio_player = new Player()

    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            let button = $(`<li class="menu__item selector" data-action="radio">
                <div class="menu__ico">
                    <svg width="38" height="31" viewBox="0 0 38 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="17.613" width="3" height="16.3327" rx="1.5" transform="rotate(63.4707 17.613 0)" fill="white"/>
                    <circle cx="13" cy="19" r="6" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 11C0 8.79086 1.79083 7 4 7H34C36.2091 7 38 8.79086 38 11V27C38 29.2091 36.2092 31 34 31H4C1.79083 31 0 29.2091 0 27V11ZM21 19C21 23.4183 17.4183 27 13 27C8.58173 27 5 23.4183 5 19C5 14.5817 8.58173 11 13 11C17.4183 11 21 14.5817 21 19ZM30.5 18C31.8807 18 33 16.8807 33 15.5C33 14.1193 31.8807 13 30.5 13C29.1193 13 28 14.1193 28 15.5C28 16.8807 29.1193 18 30.5 18Z" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">Радио</div>
            </li>`)

            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'Радио',
                    component: 'radio',
                    page: 1
                })
            })

            $('.menu .menu__list').eq(0).append(button)

            $('body').append(Lampa.Template.get('radio_style',{},true))

            window.radio_player.create()
        }
    })
}

if(!window.radio) startPlugin()