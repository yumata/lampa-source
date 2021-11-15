import Subscribe from '../utils/subscribe'
import Arrays from './arrays'
import Storage from './storage'
import Base64 from './base64'
import Noty from '../interaction/noty'

function create(){
    let listener = Subscribe();

    var _calls = []
    var _last

    var last_reguest

    let need = {
        timeout: 1000 * 60
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

    function errorDecode(jqXHR, exception){
        var msg = '';

        if (jqXHR.status === 0 && exception !== 'timeout') {
            msg = 'Нет подключения к сети.';
        } else if (jqXHR.status == 404) {
            msg = 'Запрошенная страница не найдена. [404]';
        } else if (jqXHR.status == 401) {
            msg = 'Авторизация не удалась';
        } else if (jqXHR.status == 500) {
            msg = 'Внутренняя ошибка сервера. [500]';
        } else if (exception === 'parsererror') {
            msg = 'Запрошенный синтаксический анализ JSON завершился неудачно.';
        } else if (exception === 'timeout') {
            msg = 'Время запроса истекло.';
        } else if (exception === 'abort') {
            msg = 'Запрос был прерван.';
        } else if (exception === 'custom') {
            msg = jqXHR.responseText;
        } else {
            msg = 'Неизвестная ошибка: ' + jqXHR.responseText;
        }

        return msg;
    }


    /**
     * Сделать запрос
     * @param {Object} params 
     */
    function go(params){
        listener.send('go');

        last_reguest = params;

        if(params.start) params.start();

        var secuses = function(data){
            if(params.before_complite) params.before_complite(data);

            if(params.complite){
                try{
                    params.complite(data);
                }
                catch(e){
                    console.error('Reguest','complite error:', e.message + "\n\n" + e.stack);

                    Noty.show('Error: ' + (e.error || e).message + '<br><br>' + (e.error && e.error.stack ? e.error.stack : e.stack || '').split("\n").join('<br>'))
                }
            } 

            if(params.after_complite) params.after_complite(data);

            if(params.end) params.end();
        }

        var data = {
            dataType: params.dataType || 'json',
            url: params.url,
            timeout: need.timeout,
            crossDomain: true,
            success: (data) => {
                //console.log('Reguest','result of '+params.url+' :',data)

                secuses(data);
            },
            error: (jqXHR, exception) => {
                console.log('Reguest','error of '+params.url+' :', errorDecode(jqXHR, exception));

                if(params.before_error) params.before_error(jqXHR, exception);

                if(params.error) params.error(jqXHR, exception);

                if(params.after_error) params.after_error(jqXHR, exception);

                if(params.end) params.end();
            },
            beforeSend: (xhr) => {
                
                let use = Storage.field('torrserver_auth')
				let srv = Storage.get(Storage.field('torrserver_use_link') == 'two' ? 'torrserver_url_two' : 'torrserver_url')

				if(use && params.url.indexOf(srv) > -1) xhr.setRequestHeader("Authorization", "Basic " + Base64.encode(Storage.get('torrserver_login')+':'+Storage.get('torrserver_password')))

                if(params.beforeSend){
                    xhr.setRequestHeader(params.beforeSend.name, params.beforeSend.value)
                }
            }
        }

        if(params.post_data){ 
            data.type = 'POST';
            data.data = params.post_data;
        }

        if(params.headers){
            data.headers = params.headers
        }

        $.ajax(data);

        need.timeout  = 1000 * 60;
    }

    function native(params){
        listener.send('go');

        last_reguest = params;

        if(params.start) params.start();

        let platform = Storage.get('platform','')

        if(platform == 'webos') go(params)
        else if(platform == 'tizen') go(params)
        else go(params)

        need.timeout  = 1000 * 60;
    }
}

export default create