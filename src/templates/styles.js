let html = `<style>
.torrent-error > div + div {
    margin-top: 1.3em; }

.torrent-error > div {
  line-height: 1.2; }
  .torrent-error > div > div {
    font-size: 1.4em; }
  .torrent-error > div > ul {
    margin: 0;
    margin-top: 0.2em;
    font-size: 1.2em;
    font-weight: 300; }
    .torrent-error > div > ul > li {
      position: relative;
      padding-left: 1em; }
      .torrent-error > div > ul > li::before {
        content: '';
        display: block;
        width: 0.3em;
        height: 0.3em;
        -webkit-border-radius: 100%;
            -moz-border-radius: 100%;
                border-radius: 100%;
        background-color: #ddd;
        position: absolute;
        top: 0.5em;
        left: 0; }
      .torrent-error > div > ul > li + li {
        margin-top: 0.2em; }

.torrent-error code {
  background-color: #4c4c4c;
  -webkit-border-radius: 0.2em;
      -moz-border-radius: 0.2em;
          border-radius: 0.2em;
  padding: 0 0.5em;
  font-family: inherit;
  font-size: inherit;
  word-break: break-all; }

.error + .torrent-error {
  margin-top: 2em; }

.search-box {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
      -moz-box-orient: vertical;
      -moz-box-direction: normal;
      -ms-flex-direction: column;
          flex-direction: column;
  padding: 1.5em;
  -webkit-box-align: center;
  -webkit-align-items: center;
      -moz-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
      -moz-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center; }

.simple-button {
  margin-right: 1em;
  font-size: 1.3em;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.3em 1.2em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 5em;
      -moz-border-radius: 5em;
          border-radius: 5em;
  -webkit-box-align: center;
  -webkit-align-items: center;
      -moz-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  height: 2.8em;
  -webkit-transition: background-color 0.3s;
  -o-transition: background-color 0.3s;
  -moz-transition: background-color 0.3s;
  transition: background-color 0.3s; }
  .simple-button > svg {
    width: 1.5em;
    height: 1.5em; }
    .simple-button > svg + span {
      margin-left: 1em; }
  .simple-button.focus {
    background-color: #fff;
    color: #000; }

.torrent-filter {
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  margin-bottom: 2em; }

.files__left .full-start__poster {
  display: inline-block; }

.console {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1d1f20;
  z-index: 100;
  padding: 1.5em 0; }
  .console__line {
    padding: 0.3em 1.5em;
    font-size: 1.1em;
    line-height: 1.2;
    word-break: break-all; }
    .console__line:nth-child(2n) {
      background-color: rgba(255, 255, 255, 0.05); }
    .console__line.focus {
      background-color: rgba(255, 255, 255, 0.2); }


body.no--mask .scroll--mask {
  -webkit-mask-image: unset !important;
          mask-image: unset !important; }

body.no--animation * {
  -webkit-transition: none !important;
  -o-transition: none !important;
  -moz-transition: none !important;
  transition: none !important; }

.player-video__paused {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 8em;
  height: 8em;
  -webkit-border-radius: 100%;
      -moz-border-radius: 100%;
          border-radius: 100%;
  padding: 2em;
  background-color: rgba(0, 0, 0, 0.5);
  margin-left: -4em;
  margin-top: -4em;
  -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px); }

.player-panel{
  left: 1.5em;
  bottom: 1.5em;
  right: 1.5em;
  width: auto;
  padding: 1.5em;
  -webkit-border-radius: 0.5em;
    -moz-border-radius: 0.5em;
          border-radius: 0.5em;
  -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px); 
}

.player-panel__timeline{
  background-color: rgba(255, 255, 255, 0.1);
    -webkit-border-radius: 2em;
       -moz-border-radius: 2em;
            border-radius: 2em;
    margin-bottom: 0.6em;
}
.player-panel__peding, .player-panel__position{
  -webkit-border-radius: 5em;
       -moz-border-radius: 5em;
            border-radius: 5em;
}
.player-panel__line + .player-panel__line {
  margin-top: 1em; }

.player-panel .button{
  padding: 0.4em;
}
.player-panel__right .button + .button, .player-panel__left .button + .button {
  margin-left: 1em; }

.player-info {
  position: fixed;
  top: 1.5em;
  left: 1.5em;
  right: 1.5em;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  -webkit-transform: translateY(-100%);
      -moz-transform: translateY(-100%);
      -ms-transform: translateY(-100%);
        -o-transform: translateY(-100%);
          transform: translateY(-100%);
  -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, -webkit-transform 0.3s;
  -o-transition: opacity 0.3s, -o-transform 0.3s;
  -moz-transition: transform 0.3s, opacity 0.3s, -moz-transform 0.3s;
  transition: transform 0.3s, opacity 0.3s;
  transition: transform 0.3s, opacity 0.3s, -webkit-transform 0.3s, -moz-transform 0.3s, -o-transform 0.3s;
  padding: 1.5em;
  -webkit-border-radius: 0.5em;
      -moz-border-radius: 0.5em;
          border-radius: 0.5em;
  -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px); }
  .player-info.info--visible {
    -webkit-transform: translateY(0);
        -moz-transform: translateY(0);
        -ms-transform: translateY(0);
          -o-transform: translateY(0);
            transform: translateY(0);
    opacity: 1; }
  .player-info__name {
    font-size: 1.5em;
    word-break: break-all; }

.torrent-file__title .exe {
  -webkit-border-radius: 0.3em;
      -moz-border-radius: 0.3em;
          border-radius: 0.3em;
  background: #262829;
  padding: 0.2em 0.4em;
  display: inline-block; }

.player-video__subtitles {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5em;
  text-align: center;
  font-size: 2.5em;
  text-shadow: 0 2px 1px #000000, 0 -2px 1px #000000, -2px 1px 0 #000000, 2px 0px 1px #000000; }

.player-info__line {
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex; }
.player-info__time {
  margin-left: auto;
  -webkit-flex-shrink: 0;
      -ms-flex-negative: 0;
          flex-shrink: 0;
  font-size: 1.5em;
  padding-left: 1em; }
.player-info__values {
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  margin-top: 1.2em; }
  .player-info__values > div {
    margin-right: 1em; }
    .player-info__values > div span {
      font-size: 1.2em;
      font-weight: 300; }

.player-panel__timeline.focus {
  -webkit-box-shadow: 0 0 0 0.1em #fff;
      -moz-box-shadow: 0 0 0 0.1em #fff;
          box-shadow: 0 0 0 0.1em #fff; }
  .player-panel__timeline.focus .player-panel__position > div:after {
    -webkit-transform: translateY(-50%) translateX(50%) scale(1.5) !important;
        -moz-transform: translateY(-50%) translateX(50%) scale(1.5) !important;
        -ms-transform: translateY(-50%) translateX(50%) scale(1.5) !important;
          -o-transform: translateY(-50%) translateX(50%) scale(1.5) !important;
            transform: translateY(-50%) translateX(50%) scale(1.5) !important; }

.player-info__error {
  margin-top: 1em; }
</style>`

export default html