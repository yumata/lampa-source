import Template from '../template'
import Subscribe from '../../utils/subscribe'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'
import Reguest from '../../utils/reguest'

function Info() {
    this.html = Template.get('player_info');
    this.listener = Subscribe();
    this.clockInterval; this.statsInterval;
    this.http = new Reguest();
    this.src = '';

    this.set = (data) => {
        if(data.title) {
            this.html.find('.player-info__name').html(Utils.pathToNormalTitle(data.title));
        }
        if(data.url) {
            this.src = data.url;
        }

        $(document).on('player-panel-visible', this.handlePanelVisible);

        if(Storage.get('player-clock', 'true')) {
            if(this.clockInterval) {
                clearInterval(this.clockInterval);
            }
            this.tick();
            this.clockInterval = setInterval(this.tick, 1000);
        }

        if(Storage.get('player-stats', 'true')) {
            if(this.statsInterval) {
                clearInterval(this.statsInterval);
            }
            this.getTorrentStats();
            this.statsInterval = setInterval(this.getTorrentStats, 2500);
        }
    }

    this.handlePanelVisible = (e, status) => this.toggle(status);

    this.toggle = (status) => {
        this.html.toggleClass('info--visible', status);
    }

    this.tick = () => {
        const dateTime = Utils.parseTime();
        $('.player-info .time--clock').text(dateTime.time);
    }

    this.getTorrentStats = () => {
        if(!this.src) return;
        this.http.silent(this.src.replace('play', 'stat'), function (data) {
            if(data.download_speed) {
                $('.player-info__dl-speed').html(`
                    <img src="./img/icons/keyboard/up.svg" class="player-info__dl-arrow" width="24"/> 
                        ${Utils.bytesToSize(data.download_speed, true)}/s`);
            } else {
                $('.player-info__dl-speed').html('');
            }
            if(data.upload_speed) {
                $('.player-info__ul-speed').html(`
                    <img src="./img/icons/keyboard/up.svg" width="24"/> ${Utils.bytesToSize(data.upload_speed, true)}/s`);
            } else {
                $('.player-info__ul-speed').html('');
            }

            if(data.total_peers) {
                $('.player-info__torr-info').html(`
                    <img src="./img/icons/pulse.svg" width="24"/> ${data.active_peers ?? 0} / ${data.total_peers} • ${data.connected_seeders ?? 0} seeds
                `)
            }

        }, function () {
            console.error('Encountered an error while receiving TorrServer stats')
        })
    }

    this.render = () => this.html;

    this.destroy = () => {
        clearInterval(this.clockInterval);
        clearInterval(this.statsInterval);
        this.clockInterval = null;
        $(document).off('player-panel-visible', this.handlePanelVisible);
        $('.player-info .time--clock').html('');
        $('.player-info__dl-speed').html('');
        $('.player-info__ul-speed').html('');
        $('.player-info__torr-info').html('');
    }

    return this;
}

export default Info;