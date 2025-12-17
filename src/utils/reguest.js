import Subscribe from '../utils/subscribe'
import Arrays from './arrays'
import Storage from '../core/storage/storage'
import Base64 from './base64'
import Noty from '../interaction/noty'
import Android from '../core/android'
import Lang from '../core/lang'
import Platform from '../core/platform'
import Manifest from '../core/manifest'
import Mirrors from '../core/mirrors'
import Cache from './cache'
import Utils from './utils'

let bad_mirrors = {}

/**
 * Универсальный запрос
 * @example
 * let network = new Request()
 * network.get('https://site.com/api/method',function(data){console.log(data)},function(error){console.log(error)})
 * network.silent('https://site.com/api/method',function(data){console.log(data)},function(error){console.log(error)})
 * network.quiet('https://site.com/api/method',function(data){console.log(data)},function(error){console.log(error)})
 * network.last('https://site.com/api/method',function(data){console.log(data)},function(error){console.log(error)})
 * network.native('https://site.com/api/method',function(data){console.log(data)},function(error){console.log(error)})
 * network.timeout(10000) // установить таймаут для всех запросов
 * network.clear() // очистить все запросы
 * network.again() // повторить последний запрос
 * let last = network.latest() // вернуть обьект последненго запроса
 * let error_text = network.errorDecode(jqXHR, exception) // декодировать ошибку в запросе
 * let error_code = network.errorCode(jqXHR) // вернуть код ошибки
 * let error_json = network.errorJSON(jqXHR) // вернуть json ошибки
 * @returns {Request}
 */
function Request(){
    let listener = Subscribe();

    var _calls = []
    var _last

    var last_reguest

    let need = {
        timeout: 1000 * 30
    }

    this.timeout = function(time){
        need.timeout = time
    }

    /**
     * Видимый запрос
     * @param {String} url адрес
     * @param {Function} complite успешно
     * @param {Function} error ошибка
     * @param {Object} post_data данные для пост запроса
     */
    this.get = function(url, complite, error, post_data){
        clear()

        go({
            url: url,

            post_data: post_data,

            start: function(){
                listener.send('start');
            },
            before_complite: function(){
                listener.send('before_complite');
            },
            complite: function(data){
                if(complite) complite(data);
            },
            after_complite: function(){
                listener.send('after_complite');
            },
            before_error: function(){
                listener.send('before_error');
            },
            error: function(data){
                if(error) error(data);
            },
            after_error: function(){
                listener.send('after_error');
            },

            end: function(){
                listener.send('end');
            }
        })

    }

    /**
     * Тихий запрос, отработает в любом случае
     * @param {String} url адрес
     * @param {Function} complite успешно
     * @param {Function} error ошибка
     * @param {Object} post_data данные для пост запроса
     * @param {Object} params дополнительные параметры
     */
    this.quiet = function(url, complite, error, post_data, params){
        var add_params = {};

        if(params){
            add_params = params;
        }

        var data = {
            url: url,

            post_data: post_data,

            complite: function(data){
                if(complite) complite(data);
            },
            error: function(data){
                if(error) error(data);
            }
        }

        Arrays.extend(data, add_params, true);

        go(data);
    }

    /**
     * Бесшумный запрос, сработает прерывание при новом запросе
     * @param {String} url адрес
     * @param {Function} complite успешно
     * @param {Function} error ошибка
     * @param {Object} post_data данные для пост запроса
     * @param {Object} params дополнительные параметры
     */
    this.silent = function(url, complite, error, post_data, params){
        var add_params = {};

        if(params){
            add_params = params;
        }

        var reguest = {
            url: url,
            complite: complite,
            error: error
        }

        _calls.push(reguest)

        var data = {
            url: url,

            post_data: post_data,

            complite: function(data){
                if(_calls.indexOf(reguest) !== -1 && reguest.complite) reguest.complite(data);
            },
            error: function(data){
                if(_calls.indexOf(reguest) !== -1 && reguest.error) reguest.error(data);
            },

            end: function(){
                listener.send('end')
            }
        }

        Arrays.extend(data, add_params, true);
        
        go(data)
    }

    /**
     * Отработать только последний запрос в стеке
     * @param {String} url адрес
     * @param {Function} complite успешно
     * @param {Function} error ошибка
     * @param {Object} post_data данные для пост запроса
     */
    this.last = function(url, complite, error, post_data){
        var reguest = {
            url: url,
            complite: complite,
            error: error
        }

        _last = reguest;

        go({
            url: url,

            post_data: post_data,

            complite: function(data){
                if(_last && _last.complite) _last.complite(data);
            },
            error: function(data){
                if(_last && _last.error) _last.error(data);
            },

            end: function(){
                dispatchEvent({type: 'load:end'});
            }
        })
    }

    this.native = function(url, complite, error, post_data, params){
        var add_params = {};

        if(params){
            add_params = params;
        }

        var reguest = {
            url: url,
            complite: complite,
            error: error
        }

        _calls.push(reguest)

        var data = {
            url: url,

            post_data: post_data,

            complite: function(data){
                if(_calls.indexOf(reguest) !== -1 && reguest.complite) reguest.complite(data);
            },
            error: function(data){
                if(_calls.indexOf(reguest) !== -1 && reguest.error) reguest.error(data);
            },

            end: function(){
                listener.send('end')
            }
        }

        Arrays.extend(data, add_params, true);

        native(data)
    }

    /**
     * Очистить все запросы
     */
    this.clear = function(){
        _calls = [];
    }

    /**
     * Повторить запрос
     * @param {Object} custom 
     */
    this.again = function(custom){
        if(custom || last_reguest){
            go(custom || last_reguest);
        }
    }

    /**
     * Вернуть обьект последненго запроса
     * @returns Object
     */
    this.latest = function(){
        return last_reguest;
    }

    /**
     * Декодировать ошибку в запросе
     * @param {Object} jqXHR 
     * @param {String} exception 
     * @returns String
     */
    this.errorDecode = function(jqXHR, exception){
        return errorDecode(jqXHR, exception)
    }

    this.errorCode = function(jqXHR){
        return errorCode(jqXHR)
    }

    this.errorJSON = function(jqXHR){
        return errorJSON(jqXHR)
    }

    function errorDecode(jqXHR, exception){
        if(!Arrays.isObject(jqXHR)) return Lang.translate('network_error')

        let msg = '';
        let txt = jqXHR.responseText || jqXHR.message || jqXHR.status || '';

        if (jqXHR.status === 0 && exception !== 'timeout') {
            msg = Lang.translate('network_noconnect')
        }
        else if(jqXHR.responseJSON && jqXHR.responseJSON.code){
            msg = Lang.translate('network_500').replace('500',jqXHR.responseJSON.code) + (jqXHR.responseJSON.text ? ' [' + jqXHR.responseJSON.text + ']' : '')
        } else if (jqXHR.status == 404) {
            msg = Lang.translate('network_404')
        } else if (jqXHR.status == 401) {
            msg = Lang.translate('network_401')
        } else if (jqXHR.status == 500) {
            msg = Lang.translate('network_500')
        } else if (exception === 'parsererror') {
            msg = Lang.translate('network_parsererror')
        } else if (exception === 'timeout') {
            msg = Lang.translate('network_timeout');
        } else if (exception === 'abort') {
            msg = Lang.translate('network_abort');
        } else if (exception === 'custom') {
            msg = jqXHR.responseText;
        } else {
            msg = Lang.translate('network_error') + (txt ? ': ' + txt : '');
        }

        return msg;
    }

    function errorCode(jqXHR){
        return jqXHR && jqXHR.responseJSON ? jqXHR.responseJSON.code : jqXHR ? jqXHR.status : 404
    }

    function errorJSON(jqXHR){
        return jqXHR && jqXHR.responseJSON ? jqXHR.responseJSON : {
            code: jqXHR ? jqXHR.status : 404,
            text: jqXHR ? jqXHR.responseText || jqXHR.message || Lang.translate('network_404') : Lang.translate('network_404')
        }
    }

    function go(params){
        params.url = params.url || 'no url'

        let error     = false
        let hasmirror = Manifest.cub_mirrors.find(m=>params.url.indexOf(m) >= 0)
        
        if(hasmirror && params.url.indexOf('api/checker') == -1){
            let mirrors = Manifest.cub_mirrors
            
            Arrays.remove(mirrors, hasmirror)

            for(let name in bad_mirrors){
                let mirror = bad_mirrors[name]

                if(Date.now() - mirror.time > 1000 * 60 * 10){
                    mirror.time = Date.now()
                    mirror.urls = []
                }

                if(mirror.urls.length > 10){
                    console.log('Request','bad mirror:', name, 'count:', mirror.urls.length)

                    Arrays.remove(mirrors, name)

                    mirror.urls = mirror.urls.slice(-11)
                }
            }

            error = function(jqXHR, exception){
                if(mirrors.length > 0 && (jqXHR.status < 400 || jqXHR.error_time > 1000 * 15)){
                    if(!bad_mirrors[hasmirror]) bad_mirrors[hasmirror] = {
                        urls: [],
                        time: Date.now()
                    }

                    if(bad_mirrors[hasmirror].urls.indexOf(params.url) < 0){
                        bad_mirrors[hasmirror].urls.push(params.url)
                    }

                    let next = mirrors.shift()

                    console.log('Request','try next mirror for:', params.url, 'next mirror:', next)

                    Manifest.cub_mirrors.forEach(mirror=>{
                        params.url = params.url.replace(mirror, next)
                    })

                    hasmirror = next

                    request(params, error)
                }
                else{
                    if(params.before_error) params.before_error(jqXHR, exception);

                    if(params.error) params.error(jqXHR, exception);

                    if(params.after_error) params.after_error(jqXHR, exception);

                    if(params.end) params.end();
                }
            }
        }

        request(params, error)
    }

    function cacheGet(params, callback) {
        if(params.cache && params.cache.life > 0 && Storage.field('request_caching')) {
            Cache.getData('other', cacheName(params), -1, true).then((result)=>{
                if (result) {
                    if(Date.now() < result.time + (params.cache.life * 1000 * 60)) callback(result.value, result.value)
                    else callback(null, result.value)
                } 
                else callback(null, null)
            }).catch(e=>{
                callback(null, null)
            })
        }
        else callback(null, null)
    }

    function cacheSet(params, data) {
        Cache.rewriteData('other', cacheName(params), data).catch(e=>{})
    }

    function cacheName(params) {
        let url = params.url || ''

        // убираем зеркало из урла, что бы не было дублей в кеше
        Manifest.cub_mirrors.forEach(mirror=>{
            url = url.replace(mirror, '')
        })

        url = url.replace(/https?:\/\//i, '')

        return 'request_[' + url + '][' + JSON.stringify(params.post_data || {}) + (params.dataType || 'json') + Storage.field('tmdb_lang') + ']'
    }


    /**
     * Сделать запрос
     * @param {Object} params 
     */
    function request(params, errorCallback = false){
        Lampa.Listener.send('request_before', {params});

        let start_time = Date.now()
        let cache_old  = false

        var error = function(jqXHR, exception){
            if(params.attempts && params.attempts > 0){
                params.attempts--

                console.log('Request','attempt left:', params.attempts, 'for', params.url)

                return go(params)
            }

            // Если есть старый кеш отдаем его
            if(cache_old) return secuses(cache_old, true)

            jqXHR.decode_error = errorDecode(jqXHR, exception);
            jqXHR.decode_code  = errorCode(jqXHR);

            params.url = params.url || 'no url';

            Lampa.Listener.send('request_error', {params, error: jqXHR, exception});

            let end_time = Date.now() - start_time
            let time = end_time > 1000 ? Math.round(end_time / 1000) + 's' : end_time + 'ms'

            jqXHR.error_time = time
            
            console.log('Request',params.post_data ? 'POST' : 'GET','time:',time,'error of '+params.url+' :', errorDecode(jqXHR, exception));

            if(errorCallback) return errorCallback(jqXHR, exception);

            if(params.before_error) params.before_error(jqXHR, exception);

            if(params.error) params.error(jqXHR, exception);

            if(params.after_error) params.after_error(jqXHR, exception);

            if(params.end) params.end();
        }

        if(typeof params.url !== 'string' || !params.url) return error({status: 404}, '')

        listener.send('go');

        last_reguest = params;

        if(params.start) params.start();

        let secuses = function(data, fromcache = false){
            function sendSecuses(send_data){
                if(params.cache && params.cache.life > 0 && !fromcache) {
                    cacheSet(params, send_data)
                }

                if(params.before_complite) params.before_complite(send_data)

                if(params.complite){
                    try{
                        params.complite(send_data)
                    }
                    catch(e){
                        console.error('Request','complite error:', e.message + "\n\n" + e.stack)

                        Noty.show('Error: ' + (e.error || e).message + '<br><br>' + (e.error && e.error.stack ? e.error.stack : e.stack || '').split("\n").join('<br>'))
                    }
                } 

                if(params.after_complite) params.after_complite(send_data)

                if(params.end) params.end()
            }

            let abort_called = false

            Lampa.Listener.send('request_secuses', {params, data, abort: ()=>{
                abort_called = true

                return sendSecuses
            }})

            if(!abort_called) sendSecuses(data)
        }

        let datatype = params.dataType || 'json';
        let timeout  = !Mirrors.connected() && params.url.indexOf(Manifest.cub_domain) >= 0 ? 2000 : params.timeout || need.timeout;

        let data = {
            dataType: datatype,
            url: params.url,
            timeout: timeout,
            crossDomain: true,
            success: (data) => {
                if(datatype == 'json' && !data) error({status: 500})
                else secuses(data);
            },
            error: error,
            beforeSend: (xhr) => {
                let use = Storage.field('torrserver_auth')
				let srv = Storage.get(Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url')

				if(use && srv && params.url.indexOf(srv) >= 0){
                    let authorization = "Basic " + Base64.encode(Storage.get('torrserver_login')+':'+Storage.value('torrserver_password'))

                    xhr.setRequestHeader("Authorization", authorization)
                } 

                if(params.beforeSend){
                    xhr.setRequestHeader(params.beforeSend.name, params.beforeSend.value)
                }
            }
        }

        if(params.withCredentials){
            data.xhrFields = {
                withCredentials: true
            }
        }

        if(params.post_data){ 
            data.type = 'POST';
            data.data = params.post_data;
        }

        if(params.type) data.type = params.type;

        if(params.headers){
            data.headers = params.headers
        }

        cacheGet(params, (cached, old)=>{
            // Запомнить что есть старый кеш на случай ошибки что бы отдать его
            cache_old = old

            if(cached){
                secuses(cached, true)
            }
            else{
                $.ajax(data);
            }
        })
        

        need.timeout  = 1000 * 30;
    }

    /**
     * Сделать нативный Android запрос
     * @param {Object} params 
     */
    function android_go(params){
        Lampa.Listener.send('request_before', {params});

        let start_time = Date.now()
        
        var error = function(jqXHR, exception){
            Lampa.Listener.send('request_error', {params, error: jqXHR})

            let end_time = Date.now() - start_time
            let time = end_time > 1000 ? Math.round(end_time / 1000) + 's' : end_time + 'ms'

            console.log('Request',params.post_data ? 'POST' : 'GET','time:',time,'error of '+params.url+' :', errorDecode(jqXHR, exception));

            if(params.before_error) params.before_error(jqXHR, exception);

            if(params.error) params.error(jqXHR, exception);

            if(params.after_error) params.after_error(jqXHR, exception);

            if(params.end) params.end();
        }

        if(typeof params.url !== 'string' || !params.url) return error({status: 404}, '')

        listener.send('go');

        last_reguest = params;

        if(params.start) params.start();

        var secuses = function(data){
            Lampa.Listener.send('request_secuses', {params, data});

            if(params.before_complite) params.before_complite(data);

            if(params.complite){
                try{
                    params.complite(data);
                }
                catch(e){
                    console.error('Request','complite error:', e.message + "\n\n" + e.stack);

                    Noty.show('Error: ' + (e.error || e).message + '<br><br>' + (e.error && e.error.stack ? e.error.stack : e.stack || '').split("\n").join('<br>'))
                }
            } 

            if(params.after_complite) params.after_complite(data);

            if(params.end) params.end();
        }

        params.timeout = !Mirrors.connected() && params.url.indexOf(Manifest.cub_domain) >= 0 ? 3000 : params.timeout || need.timeout;

        Android.httpReq(params, {complite: secuses, error: error})

        need.timeout  = 1000 * 30;
    }

    function native(params){
        if(Platform.is('android')) android_go(params)
        else go(params)
    }
}

export default Request