import Subscribe from '../utils/subscribe'
import Arrays from './arrays'
import Storage from './storage'
import Base64 from './base64'
import Noty from '../interaction/noty'
import Android from '../utils/android'
import Lang from './lang'
import Platform from './platform'
import Manifest from './manifest'
import Mirrors from './mirrors'

function create(){
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


    /**
     * Сделать запрос
     * @param {Object} params 
     */
    function go(params){
        Lampa.Listener.send('request_before', {params});

        var error = function(jqXHR, exception){
            jqXHR.decode_error = errorDecode(jqXHR, exception);
            jqXHR.decode_code  = errorCode(jqXHR);

            Lampa.Listener.send('request_error', {params, error: jqXHR});
            
            console.log('Request','error of '+params.url+' :', errorDecode(jqXHR, exception));

            if(params.before_error) params.before_error(jqXHR, exception);

            if(params.error) params.error(jqXHR, exception);

            if(params.after_error) params.after_error(jqXHR, exception);

            if(params.end) params.end();
        }

        if(typeof params.url !== 'string' || !params.url) return error({status: 404}, '')

        listener.send('go');

        last_reguest = params;

        if(params.start) params.start();

        let secuses = function(data){
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

                    console.log('Request','authorization:',authorization)

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

        $.ajax(data);

        need.timeout  = 1000 * 30;
    }

    /**
     * Сделать нативный Android запрос
     * @param {Object} params 
     */
    function android_go(params){
        Lampa.Listener.send('request_before', {params});
        
        var error = function(jqXHR, exception){
            Lampa.Listener.send('request_error', {params, error: jqXHR})

            console.log('Request','error of '+params.url+' :', errorDecode(jqXHR, exception));

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

export default create