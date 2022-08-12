import Storage from './storage'
import Api from '../interaction/api'
import Lang from './lang'

function secondsToTime(sec, short){
    var sec_num = parseInt(sec, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if(short) return hours+':'+minutes;

    return hours+':'+minutes+':'+seconds;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function substr(txt,len){
    txt = txt || '';
    
    return txt.length > len ? txt.substr(0, len) + '...' : txt;
}

function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function declOfNum(n, text_forms) {  
    n = Math.abs(n) % 100; 
    var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

function bytesToSize(bytes, speed) {

    if(bytes == 0) {
        return Lang.translate('size_zero');
    }
    var unitMultiple = 1024; 
    var unitNames = [Lang.translate('size_byte'), Lang.translate('size_kb'), Lang.translate('size_mb'), Lang.translate('size_gb'), Lang.translate('size_tb'), Lang.translate('size_pp')];

    if(speed){
        unitMultiple = 1000;
        unitNames = [Lang.translate('speed_bit'), Lang.translate('speed_kb'), Lang.translate('speed_mb'), Lang.translate('speed_gb'), Lang.translate('speed_tb'), Lang.translate('speed_pp')];
    }

    var unitChanges = Math.floor(Math.log(bytes) / Math.log(unitMultiple));
    return parseFloat((bytes / Math.pow(unitMultiple, unitChanges)).toFixed(2)) + ' ' + unitNames[unitChanges];
}

function sizeToBytes(str){
	var gsize = str.match(/([0-9\\.,]+)\s+(Mb|МБ|GB|ГБ|TB|ТБ)/i);

	if(gsize){
		var size = parseFloat(gsize[1].replace(',','.'))

		if(/gb|гб/.test(gsize[2].toLowerCase())) size *= 1024;
		if(/tb|тб/.test(gsize[2].toLowerCase())) size *= 1048576;

		return size * 1048576;
	}

	return 0
}

function calcBitrate(byteSize, minutes){
    if (!minutes) return 0;
    let sec = minutes * 60;
    let bitSize = byteSize * 8;
    return ((bitSize / Math.pow(1000, 2)) / sec).toFixed(2) ;
}

function getMoths(ended){
    let need = ended ? '_e' : ''
    let all  = []

    for(let i = 1; i <= 12; i++){
        all.push(Lang.translate('month_' + i + need))
    }

    return all
}

function time(html){
    let create = function(){
        let months     = getMoths()
        let months_end = getMoths(true)
        let days       = [Lang.translate('day_7'), Lang.translate('day_1'), Lang.translate('day_2'), Lang.translate('day_3'), Lang.translate('day_4'), Lang.translate('day_5'), Lang.translate('day_6')];

        this.tik = function(){
            let date = new Date(),
                time = date.getTime(),
                ofst = parseInt((localStorage.getItem('time_offset') == null ? 'n0' : localStorage.getItem('time_offset')).replace('n',''))

                date = new Date(time + (ofst * 1000 * 60 * 60))

                time = [date.getHours(),date.getMinutes(),date.getSeconds(),date.getFullYear()]

            if(time[0] < 10){time[0] = "0"+ time[0]}
            if(time[1] < 10){time[1] = "0"+ time[1]}
            if(time[2] < 10){time[2] = "0"+ time[2]}

            let current_time = [time[0],time[1]].join(':'),
                current_week = date.getDay(),
                current_day  = date.getDate()

            $('.time--clock',html).text(current_time);
            $('.time--week',html).text(days[current_week]);
            $('.time--day',html).text(current_day);
            $('.time--moth',html).text(months[date.getMonth()]);
            $('.time--full',html).text(current_day + ' ' + months_end[date.getMonth()] + ' ' +  time[3]);
        }

        setInterval(this.tik.bind(this),1000)

        this.tik()
    }

    return new create()
}

function parseTime(str){
    let months     = getMoths()
    let months_end = getMoths(true)
    let days = [Lang.translate('day_7'), Lang.translate('day_1'), Lang.translate('day_2'), Lang.translate('day_3'), Lang.translate('day_4'), Lang.translate('day_5'), Lang.translate('day_6')]

    let date = new Date(str),
        time = [date.getHours(),date.getMinutes(),date.getSeconds(),date.getFullYear()]

    if(time[0] < 10){time[0] = "0"+ time[0]}
    if(time[1] < 10){time[1] = "0"+ time[1]}
    if(time[2] < 10){time[2] = "0"+ time[2]}

    let current_time = [time[0],time[1]].join(':'),
        current_week = date.getDay(),
        current_day  = date.getDate()

    return {
        time: current_time,
        week: days[current_week],
        day: current_day,
        mouth: months[date.getMonth()],
        full: current_day + ' ' + months_end[date.getMonth()] + ' ' +  time[3],
        short: current_day + ' ' + months_end[date.getMonth()]
    }
}

function secondsToTimeHuman(sec_num) {
    let hours   = Math.trunc(sec_num / 3600);
    let minutes = Math.floor((sec_num - hours * 3600) / 60);
    return (hours ? hours + 'ч. ' : '') + minutes + 'м.';
}

function strToTime(str){
    let date = new Date(str)

    return date.getTime()
}

function checkHttp(url){
    url = url + ''

    if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) return url; 

    url = protocol() + url

    return url
}

function shortText(fullStr, strLen, separator){
    if (fullStr.length <= strLen) return fullStr;
    
    separator = separator || '...';
    
    var sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);
    
    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
}

function protocol(){
    return window.location.protocol == 'https:' ? 'https://' : 'http://'
}


function addUrlComponent (url, params){
    return url + (/\?/.test(url) ? '&' : '?') + params;
}

function putScript(items, complite, error, success){
    var p = 0;
    
    function next(){
        if(p >= items.length) return complite()

        var u = items[p]

        if(!u){
            p++

            return next()
        } 

        console.log('Script','create:',u)

        var s = document.createElement('script')
            s.onload = ()=>{
                console.log('Script','include:',u)

                if(success) success(u)

                next()
            }
            s.onerror = ()=>{
                console.log('Script','error:',u)

                if(error) error(u)

                next()
            }

            s.setAttribute('src', u)
        
            document.body.appendChild(s)

        p++
    }
    
    next()
}

function putStyle(items, complite, error){
    var p = 0;

    function next(){
        if(p >= items.length) return complite()

        var u = items[p]
        
        $.get(u, (css)=>{
            css = css.replace(/\.\.\//g,'./')

            let style = document.createElement('style');
                style.type = 'text/css';

            if (style.styleSheet){
                // This is required for IE8 and below.
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            document.body.appendChild(style)

            next()
        },()=>{
            if(error) error(u)

            next()
        },'TEXT')

        p++
    }
    
    next(items[0])
}

function clearTitle(title){
    return title.replace(/[^a-zа-я0-9\s]/gi,'')
}

function cardImgBackground(card_data){
    if(Storage.field('background')){
        return Storage.get('background_type','complex') == 'poster' && card_data.backdrop_path ? Api.img(card_data.backdrop_path,'original') : card_data.poster_path ? Api.img(card_data.poster_path) : card_data.poster || card_data.img || ''
    }
    return ''
}

function stringToHslColor(str, s, l) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var h = hash % 360;
    return 'hsl('+h+', '+s+'%, '+l+'%)';
}

function pathToNormalTitle(path, add_exe = true){
    let name = path.split('.')
    let exe  = name.pop()
        name = name.join('.')

    return (name + '').replace(/_|\./g, ' ') + (add_exe ? ' <span class="exe">.'+exe+'</span>' : '')
}

function hash(input){
    let str  = (input || '') + ''
    let hash = 0;

    if (str.length == 0) return hash;

    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);

        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash) + '';
}

function uid(len){
	var ALPHABET  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var ID_LENGTH = len || 8;

    var id = '';

    for (var i = 0; i < ID_LENGTH; i++) {
        id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }

    return id;
}

function copyTextToClipboard(text, succes, error) {
    let textArea = document.createElement("textarea")
        textArea.value = text
    
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"
  
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
  
    try {
        let successful = document.execCommand('copy')

        if(successful) succes()
        else error()
    } catch (err) {
        error()
    }
  
    document.body.removeChild(textArea);
}

function imgLoad(image,src,onload, onerror){
    let img = $(image)[0]

    img.onload = function(){
        if(onload) onload()
    }

    img.onerror = function(e){
        img.src = './img/img_broken.svg'

        if(onerror) onerror()
    }

    img.src = src
}

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function toggleFullscreen(){
    let doc  = window.document
    let elem = doc.documentElement

    let requestFullScreen = elem.requestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullScreen || elem.msRequestFullscreen
    let cancelFullScreen  = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(elem)
    }
    else {
        cancelFullScreen.call(doc)
    }
}

export default {
    secondsToTime,
    secondsToTimeHuman,
    capitalizeFirstLetter,
    substr,
    numberWithSpaces,
    time,
    bytesToSize,
    calcBitrate,
    parseTime,
    checkHttp,
    shortText,
    protocol,
    addUrlComponent,
    sizeToBytes,
    putScript,
    putStyle,
    clearTitle,
    cardImgBackground,
    strToTime,
    stringToHslColor,
    pathToNormalTitle,
    hash,
    uid,
    copyTextToClipboard,
    imgLoad,
    isTouchDevice,
    toggleFullscreen
}
