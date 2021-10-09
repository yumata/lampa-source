import Storage from './storage'
import Api from '../interaction/api'

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
        return '0 Bytes';
    }
    var unitMultiple = 1024; 
    var unitNames = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    if(speed){
        unitNames = ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
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

function parseTime(date = new Date()) {
    let months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Ма',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ]

    let days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]

    let month = function(m){
        let n = months[m]
        let d = n.slice(-1)

        if(d === 'ь') return n.slice(0,n.length-1)+'я'
        else if(n === 'Ма') return n+'я'
        else  return n+'а'
    }

    let time = [date.getHours(),date.getMinutes(),date.getSeconds(),date.getFullYear()];

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
        month: months[date.getMonth()],
        full: current_day + ' ' + month(date.getMonth()) + ' ' +  time[3]
    }
}

function strToTime(str){
    let date = new Date(str)

    return date.getTime()
}

function checkHttp(url){
    url = url.replace(/https:\/\//,'')
    url = url.replace(/http:\/\//,'')

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
    return window.protocol == 'https:' ? 'https://' : 'http://'
}


function addUrlComponent (url, params){
    return url + (/\?/.test(url) ? '&' : '?') + params;
}

function putScript(items, complite){
    var p = 0;

    function next(){
        if(p >= items.length) return complite()

        var u = items[p]
        var s = document.createElement('script')
            s.onload = next
            s.onerror = next

            s.setAttribute('src', u)

        document.body.appendChild(s)

        p++
    }
    
    next(items[0])
}

function clearTitle(title){
    return title.replace(/[^a-zа-я0-9\s]/gi,'')
}

function cardImgBackground(card_data){
    return Storage.get('background_type','complex') == 'poster' && card_data.backdrop_path ? Api.img(card_data.backdrop_path,'original') : card_data.poster_path ? Api.img(card_data.poster_path) : ''
}

function stringToHslColor(str, s, l) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var h = hash % 360;
    return 'hsl('+h+', '+s+'%, '+l+'%)';
}

function pathToNormalTitle(path){
    let name = path.split('.')
    let exe  = name.pop()
        name = name.join('.')

    return (name + '').replace(/_|\./g, ' ') + ' <span class="exe">.'+exe+'</span>'
}

export default {
    secondsToTime,
    capitalizeFirstLetter,
    substr,
    numberWithSpaces,
    bytesToSize,
    parseTime,
    checkHttp,
    shortText,
    protocol,
    addUrlComponent,
    sizeToBytes,
    putScript,
    clearTitle,
    cardImgBackground,
    strToTime,
    stringToHslColor,
    pathToNormalTitle
}