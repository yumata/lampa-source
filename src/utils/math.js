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
        return '0 Байт';
    }
    var unitMultiple = 1024; 
    var unitNames = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];

    if(speed){
        unitNames = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб'];
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
    return ((bitSize / Math.pow(1024, 2)) / sec).toFixed(2) ;
}

function time(html){
    let create = function(){
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



        let days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

        this.moth = function(m){
            let n = months[m]
            let d = n.slice(-1)

            if(d == 'ь') return n.slice(0,n.length-1)+'я'
            else if(n == 'Ма') return n+'я'
            else  return n+'а'
        }

        this.tik = function(){
            let date = new Date(),
                time = date.getTime(),
                ofst = parseInt('0')

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
            $('.time--full',html).text(current_day + ' ' + this.moth(date.getMonth()) + ' ' +  time[3]);
        }

        setInterval(this.tik.bind(this),1000)

        this.tik()
    }

    return new create()
}

function parseTime(str){
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

    let mouth = function(m){
        let n = months[m]
        let d = n.slice(-1)

        if(d == 'ь') return n.slice(0,n.length-1)+'я'
        else if(n == 'Ма') return n+'я'
        else  return n+'а'
    }

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
        full: current_day + ' ' + mouth(date.getMonth()) + ' ' +  time[3]
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
    return window.location.protocol == 'https:' ? 'https://' : 'http://'
}


function addUrlComponent (url, params){
    return url + (/\?/.test(url) ? '&' : '?') + params;
}

function putScript(items, complite, error){
    var p = 0;

    function next(){
        if(p >= items.length) return complite()

        var u = items[p]
        var s = document.createElement('script')
            s.onload = next
            s.onerror = ()=>{
                if(error) error(u)

                next()
            }

            s.setAttribute('src', u)

        document.body.appendChild(s)

        p++
    }
    
    next(items[0])
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
        return Storage.get('background_type','complex') == 'poster' && card_data.backdrop_path ? Api.img(card_data.backdrop_path,'original') : card_data.poster_path ? Api.img(card_data.poster_path) : ''
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

export default {
    secondsToTime,
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
    hash
}