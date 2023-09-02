import Template from './template'
import Controller from './controller'
import Base64 from '../utils/base64'
import Lang from '../utils/lang'
import Settings from '../components/settings'
import Torserver from './torserver'
import Storage from '../utils/storage'
import Utils from '../utils/math'
import HeadBackward from './head_backward'

let html
let tout
let xmlHTTP
let controll
let active = {}
let graph  = []


function init(){
    Settings.listener.follow('open', function (e){
        if(e.name == 'server'){
            let btn = $(`<div class="settings-param selector" data-type="button">
                <div class="settings-param__name">${Lang.translate('speedtest_button')}</div>
            </div>`)

            btn.on('hover:enter',()=>{
                if(Torserver.ip()){
                    let params = {
                        url: Torserver.url() + '/download/300'
                    }

                    if(Storage.field('torrserver_auth')){
                        params.login    = Storage.get('torrserver_login')
                        params.password = Storage.get('torrserver_password')
                    }

                    start(params)
                }
            })

            $('[data-name="torrserver_url_two"]',e.body).after(btn)
        }
    })
}

function start(params){
    if(html) html.remove()

    active = params

    controll = Controller.enabled().name

    html = Template.js('speedtest')

    html.append(HeadBackward('',true))

    document.body.append(html)

    html.querySelectorAll('textpath').forEach(element => {
        element.html(element.getAttribute('data-text'))
    })

    html.find('#speedtest_num-text').html('Mbps')

    toggle()

    if(active.url) testUrl(active.url)
}

function speed2deg(v) {
    v = parseFloat(v)

    return (v>=1000?200:(v<20?v*4:(v<30?(v-20)*2+80:(v<60?(v-30)/1.5+100:(v<100?(v-60)/2+120:(v<200?(v-100)/5+140:(v<500?(v-200)/15+160:(v-500)/25+180)))))))
}

function hslToRgb(hue, sat, light) {
    hue = hue % 360, hue += hue < 0 ? hue += 360 : 0, sat /= 100, light /= 100;
    function f(n) {
        var k = (n + hue/30) % 12;
        var a = sat * Math.min(light, 1 - light);
        return parseInt((light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
    }
    return "#" + ((1 << 24) + (f(0) << 16) + (f(8) << 8) + f(4)).toString(16).slice(1);
}

function setSpeed(v){
    v = parseFloat(v)

    html.find('#speedtest_num').innerHTML = (v<1?v.toFixed(3):(v<10?v.toFixed(2):(v<100?v.toFixed(1):Math.round(v))))

    let r = speed2deg(v)
    let b = html.find('#speedtest_progress')
    let l = 1256.8

    b.style['stroke-dasharray'] = l * r / 360 + ',' + l
    b.style.stroke = hslToRgb(330 + r, 80, 45)

    html.find('#speedtest_graph').setAttribute('points', graph.map(function(pt){return pt.join(',')}).join(' '))
}

function normalizeUrl(base, link) {
    if (link[0] === '/') return base.replace(/^(https?:\/\/[^\/]+).*$/i, '$1') + link
    if (/^https?:?\/\//i.test(link)) return link
    base = base.replace(/\/[^\/]*(\?.*)?$/, '') + '/'
    return base + link
}

function testUrl(url) {
    if (!/\.m3u8?(\?.*)?$/i.test(url)) return testSpeed(url)

    let errorFn = function(e){
        html.find('#speedtest_status').html(Lang.translate('network_error'))
    }

    xmlHTTP = new XMLHttpRequest()

    $.ajax({
        url: url,
        cache: false,
        dataType: 'text',
        xhr: () => xmlHTTP,
        success: function (data) {
            if (data.substr(0,7) !== '#EXTM3U') return errorFn('Not EXTM3U')

            let i = 0, links = [], bandwidth = 0, setLink = false, m, l = data.split(/\r?\n/); data = null;

            for (; links.length < 100 && i < l.length; i++) {
                if (!!(m = l[i].match(/^#EXTINF:\s*(-?\d+(\.\d*)?)\s*,.*$/))) {
                    setLink = true;
                }
                else if (!!(m = l[i].match(/^#EXT-X-STREAM-INF:(.+,)?\s*BANDWIDTH=(\d+)\s*(,.+)?$/))) {
                    if (bandwidth < parseInt(m[2])) {
                        bandwidth = parseInt(m[2]);
                        setLink = true;
                    }
                    else setLink = false;
                } 
                else if (setLink && !!(m = l[i].match(/^[^#].+$/i))) {
                    links.push(normalizeUrl(xmlHTTP.responseURL, m[0].trim()))
                    setLink = false
                }
            }

            if (links.length === 0) return errorFn()

            if (bandwidth > 0) return testUrl(links.pop(), true)

            testSpeed(links[0])
        },
        error: errorFn
    })
}      

function testSpeed(url){
    let context  = this
    let status   = html.find('#speedtest_status')
    let time

    status.innerHTML = Lang.translate('speedtest_connect')

    graph = [[-250, -250]]

    let speed = 0, speedMbps = 0

    setSpeed(0)
    
    xmlHTTP = new XMLHttpRequest()

    xmlHTTP.open('GET', Utils.addUrlComponent(url, 'vr=' + ((new Date()) * 1)), true)

    if (active.login && active.password) xmlHTTP.setRequestHeader("Authorization", "Basic " + Base64.encode(active.login + ":" + active.password))

    xmlHTTP.responseType = 'arraybuffer'

    xmlHTTP.onprogress = function(e) {
        if (!time || time === true) return

        let load = e.timeStamp - time

        speed = Math.ceil(e.loaded * 8000 / load) // Бит в секунду

        speedMbps = speed / 1000 / 1000

        let x = Math.max(Math.min(load, 1e4) * 500 / 1e4, Math.min(e.loaded, 3e8) * 500 / 3e8) - 250,
            y = -(speed2deg(speedMbps)/4 + 250)

        graph.push([x.toFixed(1), y.toFixed(1)])

        setSpeed(speedMbps)

        if (load >= 1e4 || e.loaded > 3e8) xmlHTTP.abort()
    }

    xmlHTTP.onreadystatechange = function (e) {
        if (xmlHTTP.readyState === 2) {
            time = e.timeStamp

            status.innerHTML = Lang.translate('speedtest_test')
            
            tout = setTimeout(function(){xmlHTTP.abort()}, 15e3)
        }
    }

    let endTest = function(e) {
        clearTimeout(tout)

        setSpeed(speedMbps)

        status.innerHTML = Lang.translate('speedtest_ready')

        time = false;

        if (typeof active.onEnd === 'function') active.onEnd.apply(context, [speedMbps, xmlHTTP])
    }

    xmlHTTP.onload = endTest
    xmlHTTP.onabort = endTest
    xmlHTTP.onerror = endTest
    xmlHTTP.send()
}

function toggle(){
    Controller.add('speedtest',{
        toggle: ()=>{
            Controller.clear()
        },
        back: close
    })
    
    Controller.toggle('speedtest')
}


function close(){
    if(xmlHTTP) xmlHTTP.abort()

    clearTimeout(tout)

    html.remove()

    html    = false
    xmlHTTP = false

    if(active.onBack) active.onBack()
    else Controller.toggle(controll)

    active = {}
}

export default {
    init,
    close,
    start
}